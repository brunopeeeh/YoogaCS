import os
import json
import random
import asyncio
import time
from typing import List, Dict, Any, Optional
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

# Carregar variáveis de ambiente do diretório pai
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

from rag_engine import get_semantic_faq_context

# Inicializar FastAPI
app = FastAPI(
    title="Yooga CS Coach API",
    description="Backend em Python para simulação de chat e auditoria de Customer Success",
    version="1.0.0"
)

# Permitir CORS para o frontend em Vite (normalmente http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chave API do Gemini (somente servidor — nunca expor via VITE_)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")

# Rate limiting simples em memória (req/min por IP)
_rate_limit_store: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_MAX = 60
RATE_LIMIT_WINDOW = 60  # segundos

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("[Yooga API] OK - API do Google Gemini configurada com sucesso!")
else:
    print("[Yooga API] AVISO - GEMINI_API_KEY nao configurada. Usando motor de fallbacks locais.")

if BACKEND_API_KEY:
    print("[Yooga API] OK - Autenticacao de API habilitada (X-API-Key).")
else:
    print("[Yooga API] AVISO - BACKEND_API_KEY nao configurada. API aberta (apenas dev local).")

# Caminho para os embeddings do FAQ
FAQ_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "faq-embeddings.json")

# Modelos do Gemini para rotação automática contra limites de cota (429)
MODEL_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite"
]

# ─── Schemas Pydantic ─────────────────────────────────────────────────────────

class Message(BaseModel):
    sender: str  # "agent" ou "client"
    message: str

class SimulateRequest(BaseModel):
    prompt: str
    history: List[Message]
    system_instruction: Optional[str] = None
    client_profile: Optional[str] = "irritado"

class CoachRequest(BaseModel):
    prompt: str
    history: List[Message]
    system_instruction: Optional[str] = None

class AuditRequest(BaseModel):
    history: List[Message]
    goals: Optional[List[str]] = []
    scenario_title: Optional[str] = ""
    system_instruction: Optional[str] = None
    prompt: Optional[str] = None

class GenerateScenarioRequest(BaseModel):
    prompt: str
    system_instruction: Optional[str] = None
    response_json_schema: Optional[Dict[str, Any]] = None

class RagSearchRequest(BaseModel):
    query: str

# ─── Middleware de segurança ──────────────────────────────────────────────────

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        if BACKEND_API_KEY:
            api_key = request.headers.get("X-API-Key", "")
            if api_key != BACKEND_API_KEY:
                raise HTTPException(status_code=401, detail="API key inválida ou ausente")

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = _rate_limit_store[client_ip]
        timestamps[:] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
        if len(timestamps) >= RATE_LIMIT_MAX:
            raise HTTPException(status_code=429, detail="Limite de requisições excedido. Tente novamente em breve.")
        timestamps.append(now)

    return await call_next(request)

# ─── Validação de respostas JSON ─────────────────────────────────────────────

def validate_coach_response(data: Dict[str, Any]) -> bool:
    return bool(data.get("suggested_response") and data.get("reasoning"))

def validate_audit_response(data: Dict[str, Any]) -> bool:
    required = [
        "overall_score", "empathy_score", "resolution_score",
        "professionalism_score", "agility_score", "feedback",
        "strengths", "improvements", "weak_areas", "recommended_training_topics"
    ]
    return all(k in data for k in required)

def validate_scenario_response(data: Dict[str, Any]) -> bool:
    required = ["title", "client_profile", "initial_problem", "difficulty_level", "goals", "context"]
    return all(k in data for k in required)

def build_rag_query(prompt: str, history: List[Message]) -> str:
    """Extrai a mensagem mais recente para busca RAG, evitando prompts multi-linha."""
    if history:
        for msg in reversed(history):
            if msg.message.strip():
                return msg.message.strip()
    lines = [l.strip() for l in prompt.split("\n") if l.strip()]
    return lines[-1] if lines else prompt.strip()

# ─── Funções Auxiliares de LLM com Rotação de Modelos ────────────────────────

def invoke_gemini_text(prompt: str, system_instruction: str = "") -> str:
    """Invoca o Gemini em formato texto puro, rotacionando modelos caso ocorram cotas 429."""
    if not GEMINI_API_KEY:
        return ""
        
    for model_name in MODEL_CHAIN:
        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
                
            model = genai.GenerativeModel(model_name=model_name, **config)
            response = model.generate_content(prompt)
            if response and response.text:
                print(f"[Yooga API] Sucesso com o modelo: {model_name}")
                return response.text.strip()
        except Exception as e:
            print(f"[Yooga API] Erro ao chamar {model_name}: {e}. Tentando próximo modelo...")
            
    print("[Yooga API] Todos os modelos na cadeia falharam.")
    return ""

def invoke_gemini_json(prompt: str, schema_dict: Dict[str, Any], system_instruction: str = "") -> Dict[str, Any]:
    """Invoca o Gemini exigindo um retorno estruturado em JSON Schema, rotacionando modelos."""
    if not GEMINI_API_KEY:
        return {}
        
    final_instruction = system_instruction or ""
    if "JSON" not in final_instruction:
        final_instruction += "\nResponda APENAS com um objeto JSON válido conforme o schema solicitado, sem marcações markdown de bloco."
        
    for model_name in MODEL_CHAIN:
        try:
            generation_config = {
                "response_mime_type": "application/json",
                "response_schema": schema_dict,
            }
            config = {}
            if final_instruction:
                config["system_instruction"] = final_instruction

            model = genai.GenerativeModel(model_name=model_name, **config)
            response = model.generate_content(prompt, generation_config=generation_config)

            if response and response.text:
                clean_text = response.text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_text)
                print(f"[Yooga API] Sucesso estruturado com o modelo: {model_name}")
                return parsed
        except Exception as e:
            print(f"[Yooga API] Erro estruturado ao chamar {model_name} (com schema): {e}. Tentando sem schema...")
            try:
                generation_config = {"response_mime_type": "application/json"}
                config = {}
                if final_instruction:
                    config["system_instruction"] = final_instruction
                model = genai.GenerativeModel(model_name=model_name, **config)
                response = model.generate_content(prompt, generation_config=generation_config)
                if response and response.text:
                    clean_text = response.text.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_text)
                    print(f"[Yooga API] Sucesso estruturado (fallback sem schema) com: {model_name}")
                    return parsed
            except Exception as e2:
                print(f"[Yooga API] Erro estruturado ao chamar {model_name}: {e2}. Tentando próximo...")
            
    print("[Yooga API] Todos os modelos de JSON falharam.")
    return {}

# ─── Endpoints da API ─────────────────────────────────────────────────────────

@app.post("/api/rag/search")
async def rag_search(req: RagSearchRequest):
    """
    Busca semântica na base FAQ Yooga via Supabase pgvector (ou fallback local).
    Retorna contexto truncado para economizar tokens no prompt da IA.
    """
    context = get_semantic_faq_context(req.query, FAQ_PATH)
    source = "supabase" if context else "none"
    try:
        from supabase_rag import is_supabase_configured
        if is_supabase_configured() and context:
            source = "supabase"
        elif context:
            source = "local_json"
    except ImportError:
        source = "local_json" if context else "none"

    return {
        "context": context,
        "source": source,
        "chars": len(context),
    }


@app.get("/api/rag/stats")
async def rag_stats():
    """Estatísticas da base vetorial (Supabase ou local)."""
    try:
        from supabase_rag import get_stats, is_supabase_configured
        if is_supabase_configured():
            return get_stats()
    except ImportError:
        pass

    local_count = 0
    if os.path.exists(FAQ_PATH):
        try:
            with open(FAQ_PATH, encoding="utf-8") as f:
                data = json.load(f)
                local_count = len(data) if isinstance(data, list) else 0
        except Exception:
            pass
    return {"configured": False, "source": "local_json", "chunk_count": local_count}


@app.post("/api/chat/simulate")
async def simulate_chat(req: SimulateRequest):
    """
    Simula a mensagem de resposta do cliente de suporte baseando-se no histórico,
    perfil psicológico do cliente e regras sazonais.
    """
    rag_query = build_rag_query(req.prompt, req.history)
    context = get_semantic_faq_context(rag_query, FAQ_PATH) if not req.system_instruction else ""

    if not GEMINI_API_KEY:
        return {"response": get_mock_client_response(req.prompt, context, req.client_profile)}

    system_instruction = req.system_instruction or f"""
    Você é um CLIENTE real de um restaurante (parceiro da Yooga) que está entrando em contato com o suporte da Yooga para resolver um problema urgente.

    Sua identidade como cliente:
    - Perfil Psicológico: {req.client_profile.upper()}. Incorpore fielmente este perfil (ex: se IRRITADO, use exclamações, demonstre pressa e frustração com o sistema; se CONFUSO, demonstre insegurança e peça explicações simples; se IMPACIENTE, mande mensagens curtas e diretas).
    - Conhecimento Técnico: Baixo. Você é dono de restaurante ou operador de caixa, NÃO é profissional de TI. Não entende jargões de programação ou infraestrutura.

    Sua Base de Conhecimento Secreta (FAQ oficial da Yooga):
    {context}

    Instruções de Interação:
    1. Você só ficará satisfeito e acalmado se o atendente da Yooga guiar você exatamente pelos passos corretos descritos no FAQ técnico acima.
    2. Se o atendente der respostas vagas, genéricas, incompletas ou incorretas, demonstre frustração de acordo com seu perfil (continue reclamando, diga que não funcionou ou peça clareza).
    3. Responda em português brasileiro coloquial, de forma direta e curta (evite parágrafos longos e robóticos). Nunca se comporte como uma inteligência artificial ou assistente.
    """

    chat_history_str = ""
    for msg in req.history:
        role_label = "Atendente (Yooga CS)" if msg.sender == "agent" else "Cliente"
        chat_history_str += f"{role_label}: {msg.message}\n"
    if req.prompt:
        chat_history_str += f"Atendente (Yooga CS): {req.prompt}\n"
    chat_history_str += "Cliente: "

    response_text = await asyncio.to_thread(invoke_gemini_text, chat_history_str, system_instruction)

    if not response_text:
        response_text = get_mock_client_response(req.prompt, context, req.client_profile)

    return {"response": response_text}

@app.post("/api/chat/coach")
async def coach_assistant(req: CoachRequest):
    """
    Retorna uma sugestão perfeita de resposta para o analista estruturada sob
    as 5 Regras de Ouro Yooga, acompanhada por justificativa pedagógica.
    """
    context = get_semantic_faq_context(build_rag_query(req.prompt, req.history), FAQ_PATH)

    schema = {
        "type": "object",
        "properties": {
            "suggested_response": {"type": "string"},
            "reasoning": {"type": "string"}
        },
        "required": ["suggested_response", "reasoning"]
    }

    if not GEMINI_API_KEY:
        return get_mock_coach_response(context)

    if req.system_instruction:
        system_instruction = req.system_instruction
        if context and context not in system_instruction:
            system_instruction += f"\n\nContexto adicional do FAQ Yooga:\n{context}"
    else:
        system_instruction = f"""
    Você é o Yooga CS Coach, um mentor e instrutor sênior especialista em Customer Success da Yooga.
    Sua função é auxiliar o atendente em tempo real durante o suporte ao cliente.

    Seu objetivo:
    Com base no histórico da conversa e no FAQ Yooga abaixo:
    {context}

    Forneça uma resposta sugerida de alta qualidade que o atendente possa usar imediatamente, além de uma justificativa pedagógica baseada nos 5 pilares do sucesso (Disponibilidade, Proatividade, Conhecimento Técnico, Empatia e Humor).

    Retorne a resposta estritamente formatada no JSON requerido.
    """

    chat_history_str = ""
    for msg in req.history:
        role_label = "Atendente (Yooga CS)" if msg.sender == "agent" else "Cliente"
        chat_history_str += f"{role_label}: {msg.message}\n"
    chat_history_str += f"Cliente (última mensagem): {req.prompt}\nSugira a melhor resposta do Atendente Yooga no formato JSON solicitado."

    parsed_json = await asyncio.to_thread(invoke_gemini_json, chat_history_str, schema, system_instruction)

    if not validate_coach_response(parsed_json):
        parsed_json = get_mock_coach_response(context)

    return parsed_json

@app.post("/api/chat/audit")
async def audit_chat(req: AuditRequest):
    """
    Avalia a simulação de chat concluída, atribuindo notas individuais de 0 a 100
    para cada um dos 5 Pilares Yooga, gerando uma nota consolidada e feedbacks detalhados.
    """
    schema = {
        "type": "object",
        "properties": {
            "overall_score": {"type": "integer"},
            "empathy_score": {"type": "integer"},
            "resolution_score": {"type": "integer"},
            "professionalism_score": {"type": "integer"},
            "agility_score": {"type": "integer"},
            "feedback": {"type": "string"},
            "strengths": {"type": "array", "items": {"type": "string"}},
            "improvements": {"type": "array", "items": {"type": "string"}},
            "weak_areas": {"type": "array", "items": {"type": "string"}},
            "recommended_training_topics": {"type": "array", "items": {"type": "string"}}
        },
        "required": [
            "overall_score", "empathy_score", "resolution_score", 
            "professionalism_score", "agility_score", "feedback", 
            "strengths", "improvements", "weak_areas", "recommended_training_topics"
        ]
    }
    
    if not GEMINI_API_KEY:
        return get_dynamic_offline_audit(req.history, req.goals)

    if req.system_instruction:
        system_instruction = req.system_instruction
    else:
        goals_formatted = "\n".join(f"- {g}" for g in req.goals) if req.goals else "- Solucionar o problema relatado com base no FAQ Yooga."
        system_instruction = f"""
    Você é um Auditor de Qualidade Sênior e rigoroso de Customer Success na Yooga.
    Sua missão é avaliar detalhadamente a transcrição do atendimento que acabou de ser concluído.

    Seus critérios de avaliação (as 5 Regras de Ouro Yooga):
    - Empatia (empathy_score): O analista acolheu o cliente, demonstrou escuta ativa e humanização?
    - Resolução/Conhecimento Técnico (resolution_score): O analista resolveu o problema de forma correta, guiando o cliente exatamente pelos caminhos e termos do FAQ correspondente?
    - Profissionalismo/Tom de Voz (professionalism_score): O analista manteve a compostura, usou linguagem adequada e emojis equilibrados?
    - Agilidade/Foco (agility_score): O analista respondeu com clareza, evitando enrolação ou mensagens desnecessárias?

    Objetivos que deveriam ser atingidos pelo Atendente neste cenário:
    {goals_formatted}

    INSTRUÇÕES CRÍTICAS PARA OS PONTOS FORTES E DE MELHORIA:
    1. Na lista "strengths" (pontos fortes), liste obrigatoriamente de 2 a 4 pontos específicos nos quais o analista se destacou na conversa (ex: uso de termos corretos do FAQ, tom acolhedor no início, excelente tratativa). Se o atendimento foi bom (nota acima de 70%), esta lista NUNCA deve vir vazia!
    2. Na lista "improvements" (áreas de melhoria), você deve listar apenas críticas construtivas e pontos que ele errou ou pode aprimorar.
    3. Se o atendimento foi excelente (nota acima de 90%) e não houver pontos reais a melhorar, você DEVE retornar a lista de melhorias vazia [] ou apenas com ["Manter a excelente qualidade de atendimento"].
    4. NUNCA coloque elogios ou afirmações de maestria (como "não há pontos significativos de melhoria" ou "demonstrou maestria") dentro do campo "improvements"! Todos os elogios, pontos positivos e reconhecimentos de maestria pertencem EXCLUSIVAMENTE ao campo "strengths".

    ATENÇÃO EXTREMA E CRÍTICA:
    Se você notar que a conversa não possui NENHUMA resposta do "Atendente (Yooga CS)" (o analista simplesmente finalizou a simulação sem enviar nenhuma mensagem ao cliente):
    - Você DEVE pontuar 0 (ZERO) em todas as notas (overall_score, empathy_score, resolution_score, professionalism_score, agility_score).
    - No campo "feedback", descreva com clareza que o atendimento foi abandonado ou não iniciado pelo analista.
    - Coloque na lista de "improvements" a obrigatoriedade de interagir com o cliente.

    Se houver interações, faça uma análise criteriosa e realista. Seja honesto e não dê notas infladas (uma nota 100 deve ser extremamente rara e perfeita).
    """

    chat_history_str = ""
    for msg in req.history:
        role_label = "Atendente (Yooga CS)" if msg.sender == "agent" else "Cliente"
        chat_history_str += f"{role_label}: {msg.message}\n"

    if req.prompt:
        chat_history_str += f"\n{req.prompt}\n"
    chat_history_str += "\nAvalie esta conversa e retorne a auditoria completa formatada no JSON requerido."

    parsed_json = await asyncio.to_thread(invoke_gemini_json, chat_history_str, schema, system_instruction)

    if not validate_audit_response(parsed_json):
        parsed_json = get_dynamic_offline_audit(req.history, req.goals)
        
    # Salvar o histórico de simulação de treino em arquivo JSON Lines (JSONL) para Fine-Tuning
    try:
        dir_path = os.path.join(os.path.dirname(__file__), "training_data")
        os.makedirs(dir_path, exist_ok=True)
        log_file_path = os.path.join(dir_path, "chat_logs.jsonl")
        
        log_entry = {
            "scenario_title": req.scenario_title,
            "goals": req.goals,
            "audit_results": {
                "overall_score": parsed_json.get("overall_score"),
                "empathy_score": parsed_json.get("empathy_score"),
                "resolution_score": parsed_json.get("resolution_score"),
                "professionalism_score": parsed_json.get("professionalism_score"),
                "agility_score": parsed_json.get("agility_score"),
                "feedback": parsed_json.get("feedback")
            },
            "conversation": [{"sender": m.sender, "message": m.message} for m in req.history]
        }
        
        with open(log_file_path, "a", encoding="utf-8") as lf:
            lf.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
        print(f"[Yooga API] OK - Historico de simulacao salvo com sucesso em: {log_file_path}")
    except Exception as log_err:
        print(f"[Yooga API] Erro ao salvar histórico de simulação para treino: {log_err}")
        
    return parsed_json

@app.post("/api/scenarios/generate")
async def generate_scenario(req: GenerateScenarioRequest):
    """Gera um cenário de treinamento estruturado em JSON."""
    schema = req.response_json_schema or {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "description": {"type": "string"},
            "client_profile": {"type": "string"},
            "initial_problem": {"type": "string"},
            "difficulty_level": {"type": "string"},
            "goals": {"type": "array", "items": {"type": "string"}},
            "context": {"type": "string"},
            "expected_interactions": {"type": "number"},
            "status": {"type": "string"}
        },
        "required": ["title", "client_profile", "initial_problem", "difficulty_level", "goals", "context"]
    }

    if not GEMINI_API_KEY:
        return {
            "title": "Cenário offline",
            "description": "Gerado localmente (sem API Gemini).",
            "client_profile": "irritado",
            "initial_problem": req.prompt[:300] if req.prompt else "Preciso de ajuda com o sistema Yooga.",
            "difficulty_level": "intermediario",
            "goals": ["Demonstrar empatia", "Aplicar FAQ Yooga", "Confirmar entendimento do cliente"],
            "context": "Revise e edite antes de publicar.",
            "expected_interactions": 4,
            "status": "ativo"
        }

    system_instruction = req.system_instruction or """
    Você é um especialista em Customer Success da Yooga.
    Gere um cenário de treinamento realista para agentes de suporte.
    Retorne APENAS um objeto JSON válido conforme o schema solicitado, em português brasileiro.
    """

    parsed_json = await asyncio.to_thread(invoke_gemini_json, req.prompt, schema, system_instruction)

    if not validate_scenario_response(parsed_json):
        raise HTTPException(status_code=502, detail="Falha ao gerar cenário estruturado. Tente novamente.")

    if parsed_json.get("difficulty_level") == "avancado":
        parsed_json["difficulty_level"] = "avançado"

    parsed_json.setdefault("status", "ativo")
    return parsed_json

# ─── Fallbacks Locais (Sem API Key) ──────────────────────────────────────────

def get_mock_client_response(prompt: str, context: str, profile: str) -> str:
    topic = ""
    if context and 'Artigo de Ajuda Yooga: "' in context:
        parts = context.split('Artigo de Ajuda Yooga: "')
        if len(parts) >= 2:
            topic = parts[1].split('"')[0]
            
    profiles = {
        "irritado": [
            f"Isso é um absurdo! Estou tentando resolver essa questão de '{topic or 'caixa'}' aqui e nada funciona!",
            "Eu preciso que resolva isso AGORA, meu restaurante está lotado!",
            "Toda hora a mesma conversa. Como que eu fico com a operação travada?"
        ],
        "confuso": [
            f"Olha, eu li sobre '{topic or 'integração'}', mas sou meio leigo. Pode me explicar bem devagar?",
            "Não achei essa opção que você falou. Pode me falar o caminho exato de onde clicar?",
            "Desculpa a demora, mas o que é CSC mesmo? Não entendi..."
        ],
        "objetivo": [
            f"Entendi. Qual o próximo passo para resolver o erro no '{topic or 'sistema'}'?",
            "Certo. Fiz isso. O que faço agora?",
            "Qual a solução definitiva para esse problema de notas?"
        ],
        "impaciente": [
            f"Pode ser mais rápido? Estou na correria do balcão aqui!",
            "Isso eu já fiz! E agora?",
            "Tem como agilizar o atendimento?"
        ],
        "detalhista": [
            f"Perfeito. Mas esse ajuste de bobina em '{topic or 'impressora'}' afeta o fechamento do caixa no final do dia?",
            "Quero documentar isso. Você pode detalhar os pré-requisitos?",
            "Isso vale apenas para impressoras Bematech ou outras marcas também?"
        ],
        "indeciso": [
            f"Não sei se devo tentar resolver o '{topic or 'problema'}' agora ou esperar...",
            "Talvez seja melhor eu tentar de outro jeito primeiro, o que você acha?",
            "Hmm, estou em dúvida sobre qual caminho seguir..."
        ],
        "emotivo": [
            f"Nossa, estou bem preocupado com essa questão de '{topic or 'sistema'}'! 😟",
            "Obrigado pela atenção! A Yooga sempre me ajuda quando preciso ❤️",
            "Fico tão ansioso quando acontece isso no restaurante..."
        ]
    }
    
    messages = profiles.get(profile.lower(), [
        "Certo, e qual é o próximo passo?",
        "Entendi, vou tentar fazer isso aqui e já te dou um retorno.",
        "Ok, obrigado pela explicação técnica!"
    ])
    return random.choice(messages)

def get_mock_coach_response(context: str) -> Dict[str, Any]:
    topic = "Central de Ajuda"
    if context and 'Artigo de Ajuda Yooga: "' in context:
        parts = context.split('Artigo de Ajuda Yooga: "')
        if len(parts) >= 2:
            topic = parts[1].split('"')[0]
            
    return {
        "suggested_response": f"Compreendo perfeitamente a urgência da sua operação com o restaurante cheio! Vamos resolver isso agora mesmo. Para solucionar a questão do {topic}, acesse o Painel Administrativo > Configurações e siga estes passos...",
        "reasoning": f"Sugestão estruturada offline com base nos embeddings locais do FAQ Yooga sobre '{topic}'. Aborda o pilar de Empatia e Disponibilidade nos momentos de pico."
    }

def get_dynamic_offline_audit(history: List[Message], goals: List[str]) -> Dict[str, Any]:
    # 1. Se não houver mensagens do agente, dar 0% em tudo
    agent_msgs = [m.message.lower() for m in history if m.sender == "agent"]
    if not agent_msgs:
        return {
            "overall_score": 0,
            "empathy_score": 0,
            "resolution_score": 0,
            "professionalism_score": 0,
            "agility_score": 0,
            "feedback": "O atendimento foi finalizado/abandonado sem nenhuma interação ou mensagem enviada pelo atendente. Por favor, interaja com o cliente para receber uma avaliação realista.",
            "strengths": [],
            "improvements": ["Iniciar o atendimento enviando mensagens ao cliente", "Demonstrar acolhimento à dúvida"],
            "weak_areas": ["Resolução", "Disponibilidade", "Empatia"],
            "recommended_training_topics": ["Princípios básicos de CS Yooga", "Como interagir com clientes"]
        }

    # 2. Calcular scores dinâmicos com base em palavras-chave e metas do cenário
    goals_met_count = 0
    if goals:
        for goal in goals:
            goal_lower = goal.lower()
            # Palavras longas e significativas do objetivo (removendo preposições e termos genéricos)
            words = [w for w in goal_lower.split() if len(w) > 4 and w not in [
                "sobre", "quando", "forma", "entre", "após", "antes", "deve", "podem", "como", "para", "com", "o", "a", "os", "as"
            ]]
            if words:
                matched_words = sum(1 for w in words if any(w in msg for msg in agent_msgs))
                # Se cobriu mais de 30% das palavras chave do objetivo, consideramos atingido
                if (matched_words / len(words)) >= 0.3:
                    goals_met_count += 1
            else:
                if any(goal_lower[:12] in msg for msg in agent_msgs):
                    goals_met_count += 1
        resolution_score = min(40 + int((goals_met_count / len(goals)) * 60), 100) if goals else 80
    else:
        # Fallback genérico por termos técnicos
        technical_terms = {
            "chat": ["chat", "ativar chat", "habilitar", "configur"],
            "impressora": ["impressora", "bobina", "58mm", "largura", "margem"],
            "caixa": ["caixa", "fechar", "abrir", "suprimento", "fechamento"],
            "offline": ["offline", "contingencia", "navegador", "internet", "sincroniz"],
            "ifood": ["ifood", "integracao", "sincronizar", "cardapio"],
            "fiscal": ["fiscal", "nfce", "nfc-e", "csc", "sefaz", "certificado"]
        }
        matched_tech_categories = 0
        for category, terms in technical_terms.items():
            if any(term in msg for msg in agent_msgs for term in terms):
                matched_tech_categories += 1
        resolution_score = min(50 + matched_tech_categories * 25, 100)

    # Empatia baseada no tom de acolhimento e escuta ativa
    empathy_kws = ["desculpe", "compreendo", "entendo", "sinto muito", "peço desculpas", "vamos resolver", "certo", "perfeito", "claro", "correria", "acalmar", "tranquilo", "ajudar", "confusão", "poxa"]
    empathy_matches = sum(1 for kw in empathy_kws if any(kw in msg for msg in agent_msgs))
    empathy_score = min(60 + empathy_matches * 10, 100)

    # Profissionalismo (Grammar, formal terms, emojis count)
    professionalism_score = 85
    if len([msg for msg in agent_msgs if len(msg) > 100]) > 0:
        professionalism_score = 95
    if any(any(bad in msg for bad in ["porra", "merda", "burro", "sei lá", "não sei"]) for msg in agent_msgs):
        professionalism_score = 30

    # Agilidade (Inversa do número de rodadas do atendente: menos rodadas = mais ágil)
    if len(agent_msgs) <= 1:
        agility_score = 100
    elif len(agent_msgs) <= 2:
        agility_score = 95
    elif len(agent_msgs) <= 4:
        agility_score = 85
    elif len(agent_msgs) <= 6:
        agility_score = 75
    else:
        agility_score = 60

    # Cálculo ponderado da Nota Geral (Resolução: 40%, Empatia: 30%, Profissionalismo: 20%, Agilidade: 10%)
    overall_score = int((resolution_score * 0.4) + (empathy_score * 0.3) + (professionalism_score * 0.2) + (agility_score * 0.1))

    feedback = "Análise dinâmica do atendimento realizada localmente. "
    strengths = []
    improvements = []
    
    if overall_score >= 80:
        feedback += "Excelente postura! Demonstrou ótimo domínio técnico e tratativa muito acolhedora com o cliente."
        strengths.append("Ótimo tom de voz e empatia")
        strengths.append("Domínio dos procedimentos descritos no FAQ")
    elif overall_score >= 60:
        feedback += "Bom atendimento, mas há pontos a refinar. Certifique-se de dar o caminho exato do menu no FAQ."
        strengths.append("Respostas claras")
        improvements.append("Guiar o cliente de forma mais passo a passo com o menu exato")
    else:
        feedback += "O atendimento precisa de melhorias. Tente acolher melhor a frustração do cliente e dar instruções técnicas mais precisas."
        improvements.append("Dedicar mais tempo para acalmar o cliente no início")
        improvements.append("Estudar o FAQ correspondente para guiar o cliente de forma correta")

    return {
        "overall_score": overall_score,
        "empathy_score": empathy_score,
        "resolution_score": resolution_score,
        "professionalism_score": professionalism_score,
        "agility_score": agility_score,
        "feedback": feedback,
        "strengths": strengths if strengths else ["Uso de termos cordiais"],
        "improvements": improvements if improvements else ["Propor soluções proativas"],
        "weak_areas": ["Resolução"] if overall_score < 70 else ["Proatividade"],
        "recommended_training_topics": [
            "Conhecimento de produto Yooga",
            "Gestão de contatos em tempo real"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
