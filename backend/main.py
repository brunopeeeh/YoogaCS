import os
import json
import random
import asyncio
import time
import re
from typing import List, Dict, Any, Optional
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv
from openai import OpenAI

# Carregar variáveis de ambiente do diretório pai
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Provedor ativo e chaves
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "deepseek").lower()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
DEEPSEEK_REASONING_MODEL = os.getenv("DEEPSEEK_REASONING_MODEL", "deepseek-reasoning")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")

deepseek_client = None
if DEEPSEEK_API_KEY:
    deepseek_client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
    print(f"[Yooga API] OK - API do DeepSeek configurada. Chat: {DEEPSEEK_MODEL}, Reasoning: {DEEPSEEK_REASONING_MODEL} (Provedor ativo: {LLM_PROVIDER})")
else:
    print("[Yooga API] AVISO - DEEPSEEK_API_KEY nao configurada.")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

def supabase_request(table: str, method: str = "GET", body: Any = None, params: Optional[Dict[str, str]] = None) -> Any:
    """Executa uma requisição REST direta à API PostgREST do Supabase (independente de SDK)."""
    import urllib.request
    import urllib.parse
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Yooga Supabase] Erro - SUPABASE_URL ou SUPABASE_KEY não configurados.")
        raise HTTPException(status_code=503, detail="Supabase não configurado no backend")
        
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    
    if params:
        query_string = urllib.parse.urlencode(params)
        url += f"?{query_string}"
        
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    data_bytes = None
    if body is not None:
        data_bytes = json.dumps(body).encode("utf-8")
        
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers=headers,
        method=method
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_content = response.read().decode("utf-8")
            if res_content:
                return json.loads(res_content)
            return []
    except urllib.error.HTTPError as he:
        err_msg = he.read().decode("utf-8")
        print(f"[Yooga Supabase] Erro HTTP ({he.code}): {err_msg}")
        raise HTTPException(status_code=he.code, detail=f"Erro no Supabase: {err_msg}")
    except Exception as e:
        print(f"[Yooga Supabase] Erro de conexão: {e}")
        raise HTTPException(status_code=500, detail=f"Erro de conexão com o banco: {e}")



def is_llm_available() -> bool:
    """Verifica se há algum provedor de LLM configurado e ativo."""
    if LLM_PROVIDER == "deepseek" and DEEPSEEK_API_KEY:
        return True
    if LLM_PROVIDER == "gemini" and GEMINI_API_KEY:
        return True
    return False

from rag_engine import get_semantic_faq_context, generate_deterministic_vector, dot_product

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

class FilterRequest(BaseModel):
    criteria: Optional[Dict[str, Any]] = {}
    orderBy: Optional[str] = "-created_date"
    limit: Optional[int] = 100

# ─── Middleware de segurança ──────────────────────────────────────────────────

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # Ignora validações de API Key e Rate Limiting para requisições de Preflight (OPTIONS)
    if request.method == "OPTIONS":
        return await call_next(request)

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

# ─── Cache Semântico Local para o Coach ───────────────────────────────────────

import unicodedata

def clean_text_for_cache(text: str) -> str:
    # Normalizar diacríticos e acentos (ex: "faço" -> "faco")
    nfd_form = unicodedata.normalize('NFD', text)
    cleaned = "".join(c for c in nfd_form if unicodedata.category(c) != 'Mn')
    return cleaned.lower()

class SemanticCache:
    def __init__(self, max_size: int = 100, threshold: float = 0.90):
        self.max_size = max_size
        self.threshold = threshold
        self.entries: List[Dict[str, Any]] = []

    def _get_words(self, text: str) -> set:
        cleaned = clean_text_for_cache(text)
        words = re.findall(r"\w+", cleaned)
        return set(words)

    def get(self, query: str) -> Optional[Dict[str, Any]]:
        if not query or not query.strip():
            return None
        
        query_words = self._get_words(query)
        if not query_words:
            return None

        best_score = -1.0
        best_entry = None

        # Comparar similaridade Jaccard (conjuntos de palavras)
        for entry in self.entries:
            cached_words = entry["words"]
            intersection = query_words.intersection(cached_words)
            union = query_words.union(cached_words)
            if union:
                score = len(intersection) / len(union)
                if score > best_score:
                    best_score = score
                    best_entry = entry

        if best_entry and best_score >= self.threshold:
            print(f"[Semantic Cache] HIT semântico perfeito! Jaccard Score: {best_score:.4f} (Economia de tokens!)")
            return dict(best_entry["response"])
            
        return None

    def set(self, query: str, response: Dict[str, Any]):
        if not query or not query.strip() or not response:
            return
        
        try:
            query_words = self._get_words(query)
            if len(self.entries) >= self.max_size:
                self.entries.pop(0) # FIFO Eviction
                
            self.entries.append({
                "query": query,
                "words": query_words,
                "response": dict(response)
            })
            print(f"[Semantic Cache] Registrado com sucesso. Tamanho: {len(self.entries)}")
        except Exception as e:
            print(f"[Semantic Cache] Erro ao registrar no cache: {e}")

coach_semantic_cache = SemanticCache(max_size=100, threshold=0.90)

# ─── Funções Auxiliares de LLM com Rotação de Modelos ────────────────────────

def parse_json_resilient(raw_text: str) -> Dict[str, Any]:
    """Sanitiza, repara e converte uma string de retorno da IA em um dicionário Python de forma robusta."""
    if not raw_text:
        return {}
    
    cleaned = raw_text.strip()
    
    # 1. Remover cercas de código markdown
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()
    
    # 2. Tentar parse imediato (caso o JSON seja perfeito)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
        
    # 3. Se falhou, aplica sanitizações adicionais
    try:
        # A. Remove vírgulas sobressalentes antes de fechamento (trailing commas)
        cleaned_sanitized = re.sub(r",\s*([\]}])", r"\1", cleaned)
        
        # B. Tentar reparar aspas simples ao redor de chaves/valores
        cleaned_sanitized = re.sub(r"'(\w+)'\s*:", r'"\1":', cleaned_sanitized)
        cleaned_sanitized = re.sub(r":\s*'([^']*)'", r': "\1"', cleaned_sanitized)
        
        # C. Normalizar booleanos e None do Python para JSON (True -> true, False -> false, None -> null)
        cleaned_sanitized = re.sub(r"\bTrue\b", "true", cleaned_sanitized)
        cleaned_sanitized = re.sub(r"\bFalse\b", "false", cleaned_sanitized)
        cleaned_sanitized = re.sub(r"\bNone\b", "null", cleaned_sanitized)
        
        try:
            return json.loads(cleaned_sanitized)
        except json.JSONDecodeError:
            pass
            
        # D. Caso extremo: A IA adicionou texto conversacional antes ou depois do objeto JSON
        # Encontra o primeiro '{' e o último '}'
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            extracted = cleaned[start_idx:end_idx+1]
            try:
                return json.loads(extracted)
            except json.JSONDecodeError:
                pass
                
            # Tenta aplicar todas as sanitizações no trecho extraído
            extracted_sanitized = re.sub(r",\s*([\]}])", r"\1", extracted)
            extracted_sanitized = re.sub(r"'(\w+)'\s*:", r'"\1":', extracted_sanitized)
            extracted_sanitized = re.sub(r":\s*'([^']*)'", r': "\1"', extracted_sanitized)
            extracted_sanitized = re.sub(r"\bTrue\b", "true", extracted_sanitized)
            extracted_sanitized = re.sub(r"\bFalse\b", "false", extracted_sanitized)
            extracted_sanitized = re.sub(r"\bNone\b", "null", extracted_sanitized)
            
            try:
                return json.loads(extracted_sanitized)
            except json.JSONDecodeError:
                pass
                
    except Exception as e:
        print(f"[Yooga Resilient Parser] Falha de sanitização: {e}")
        
    return {}

def invoke_deepseek_text(prompt: str, system_instruction: str = "") -> str:
    """Invoca o DeepSeek em formato texto puro."""
    if not deepseek_client:
        return ""
    try:
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        response = deepseek_client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=messages,
            stream=False
        )
        if response and response.choices:
            content = response.choices[0].message.content
            print(f"[Yooga API] Sucesso com o modelo DeepSeek: {DEEPSEEK_MODEL}")
            return content.strip() if content else ""
    except Exception as e:
        print(f"[Yooga API] Erro ao chamar DeepSeek: {e}")
    return ""

def extract_clean_rag_query(prompt: str) -> str:
    """Extrai os termos principais de busca de prompts grandes para evitar poluição semântica no RAG."""
    if not prompt:
        return ""
    # 1. Tentar extrair o tópico customizado
    custom_match = re.search(r'baseado no tópico:\s*["\']([^"\']+)["\']', prompt, re.IGNORECASE)
    if custom_match:
        return custom_match.group(1).strip()
    
    # 2. Tentar extrair o tipo de cenário e áreas de foco
    type_match = re.search(r'TIPO DE CENÁRIO:\s*["\']([^"\']+)["\']', prompt, re.IGNORECASE)
    focus_match = re.search(r'FOCAR NAS ÁREAS:\s*([^\n]+)', prompt, re.IGNORECASE)
    
    query_parts = []
    if type_match:
        query_parts.append(type_match.group(1).strip())
    if focus_match:
        query_parts.append(focus_match.group(1).strip())
        
    if query_parts:
        return " ".join(query_parts)
        
    return prompt[:100].strip() # Fallback padrão

def invoke_deepseek_chat(messages: List[Dict[str, str]]) -> str:
    """Invoca o DeepSeek passando uma estrutura nativa de mensagens de chat."""
    if not deepseek_client:
        return ""
    try:
        response = deepseek_client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=messages,
            stream=False
        )
        if response and response.choices:
            content = response.choices[0].message.content
            print(f"[Yooga API] Sucesso de Chat com o modelo DeepSeek: {DEEPSEEK_MODEL}")
            return content.strip() if content else ""
    except Exception as e:
        print(f"[Yooga API] Erro ao chamar DeepSeek Chat: {e}")
    return ""

def invoke_gemini_chat(messages: List[Dict[str, str]], system_instruction: str = "") -> str:
    """Invoca o Gemini em formato chat estruturado, rotacionando modelos para evitar limites de cota."""
    if not GEMINI_API_KEY:
        return ""
        
    gemini_contents = []
    for msg in messages:
        if msg["role"] == "system":
            continue
        # Mapeia "assistant" -> "model"
        role = "user" if msg["role"] == "user" else "model"
        gemini_contents.append({"role": role, "parts": [msg["content"]]})
        
    for model_name in MODEL_CHAIN:
        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
                
            model = genai.GenerativeModel(model_name=model_name, **config)
            response = model.generate_content(gemini_contents)
            if response and response.text:
                print(f"[Yooga API] Sucesso de Chat com o modelo Gemini: {model_name}")
                return response.text.strip()
        except Exception as e:
            print(f"[Yooga API] Erro no Chat com {model_name}: {e}. Tentando próximo...")
    
    return ""

def invoke_llm_chat(messages: List[Dict[str, str]], system_instruction: str = "") -> str:
    """Invoca o chat estruturado no provedor ativo (DeepSeek ou Gemini), com fallback automático."""
    if LLM_PROVIDER == "deepseek" and DEEPSEEK_API_KEY:
        deepseek_messages = list(messages)
        # Se houver system_instruction e não houver mensagem de sistema no topo, injeta
        if system_instruction and not any(m["role"] == "system" for m in deepseek_messages):
            deepseek_messages.insert(0, {"role": "system", "content": system_instruction})
            
        res = invoke_deepseek_chat(deepseek_messages)
        if res:
            return res
        print("[Yooga API] AVISO - Falha no DeepSeek Chat. Utilizando fallback para Gemini Chat...")

    if GEMINI_API_KEY:
        return invoke_gemini_chat(messages, system_instruction)
        
    return ""

def invoke_deepseek_json(prompt: str, schema_dict: Dict[str, Any], system_instruction: str = "", model_type: str = "chat") -> Dict[str, Any]:
    """Invoca o DeepSeek exigindo retorno estruturado em JSON com base em um Schema, com suporte a Dual-Model."""
    if not deepseek_client:
        return {}
        
    # Decidir o modelo primário e o de fallback interno (Plano B)
    if model_type == "reasoning" and DEEPSEEK_REASONING_MODEL:
        primary_model = DEEPSEEK_REASONING_MODEL
        fallback_model = DEEPSEEK_MODEL or "deepseek-chat"
    else:
        primary_model = DEEPSEEK_MODEL or "deepseek-chat"
        fallback_model = None

    schema_instruction = f"\nVocê DEVE retornar um objeto JSON que atenda rigorosamente ao seguinte JSON Schema:\n{json.dumps(schema_dict, ensure_ascii=False)}"
    final_instruction = system_instruction or ""
    final_instruction += schema_instruction
    if "JSON" not in final_instruction:
        final_instruction += "\nResponda APENAS com um objeto JSON válido, sem marcações markdown de bloco."
    
    messages = []
    messages.append({"role": "system", "content": final_instruction})
    messages.append({"role": "user", "content": prompt})

    def execute_call(model_name: str) -> Dict[str, Any]:
        kwargs = {
            "model": model_name,
            "messages": messages,
            "stream": False
        }
        
        # O modelo deepseek-reasoning oficial não suporta response_format={"type": "json_object"}
        if "reasoning" not in model_name.lower():
            kwargs["response_format"] = {"type": "json_object"}
            
        # Adicionar parâmetros de thinking/reasoning se for modelo de raciocínio/pro
        if "reasoning" in model_name.lower() or "pro" in model_name.lower():
            kwargs["extra_body"] = {"thinking": {"type": "enabled"}}
            kwargs["reasoning_effort"] = "high"

        try:
            response = deepseek_client.chat.completions.create(**kwargs)
        except Exception as e:
            # Se falhar devido aos parâmetros extras de thinking do provider, tenta chamada simplificada
            if any(k in str(e) for k in ["extra_body", "thinking", "reasoning_effort"]):
                print(f"[Yooga API] Parâmetros extras não suportados pelo provider no modelo {model_name}. Tentando sem extra_body...")
                kwargs.pop("extra_body", None)
                kwargs.pop("reasoning_effort", None)
                response = deepseek_client.chat.completions.create(**kwargs)
            else:
                raise e

        if response and response.choices:
            content = response.choices[0].message.content
            parsed = parse_json_resilient(content)
            if parsed and isinstance(parsed, dict):
                # Tentar extrair os logs de pensamento (thinking) do DeepSeek R1
                reasoning_content = getattr(response.choices[0].message, "reasoning_content", None)
                if reasoning_content:
                    parsed["_thinking_log"] = reasoning_content
                return parsed
        return {}

    try:
        # Tenta a chamada com o modelo primário
        parsed = execute_call(primary_model)
        if parsed:
            print(f"[Yooga API] Sucesso estruturado com DeepSeek ({primary_model})")
            return parsed
    except Exception as e:
        print(f"[Yooga API] Erro estruturado ao chamar modelo primário {primary_model}: {e}")
        
    # Se falhou e temos um fallback do DeepSeek configurado (Plano B), tenta o fallback
    if fallback_model:
        try:
            print(f"[Yooga API] Iniciando Plano B: Fallback interno do DeepSeek para {fallback_model}...")
            parsed = execute_call(fallback_model)
            if parsed:
                print(f"[Yooga API] Sucesso estruturado com fallback DeepSeek ({fallback_model})")
                return parsed
        except Exception as e_fallback:
            print(f"[Yooga API] Erro estruturado ao chamar fallback {fallback_model}: {e_fallback}")
            
    return {}

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
                parsed = parse_json_resilient(response.text)
                if parsed:
                    print(f"[Yooga API] Sucesso estruturado com o modelo: {model_name}")
                    return parsed
                raise ValueError("JSON parse failed or empty object returned")
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
                    parsed = parse_json_resilient(response.text)
                    if parsed:
                        print(f"[Yooga API] Sucesso estruturado (fallback sem schema) com: {model_name}")
                        return parsed
                    raise ValueError("JSON parse failed or empty object returned")
            except Exception as e2:
                print(f"[Yooga API] Erro estruturado ao chamar {model_name}: {e2}. Tentando próximo...")
            
    print("[Yooga API] Todos os modelos de JSON falharam.")
    return {}

def invoke_llm_text(prompt: str, system_instruction: str = "") -> str:
    """Invoca o provedor de LLM ativo (DeepSeek ou Gemini), com fallback robusto."""
    if LLM_PROVIDER == "deepseek" and DEEPSEEK_API_KEY:
        res = invoke_deepseek_text(prompt, system_instruction)
        if res:
            return res
        print("[Yooga API] AVISO - Falha no DeepSeek. Utilizando fallback para Gemini...")

    if GEMINI_API_KEY:
        return invoke_gemini_text(prompt, system_instruction)
        
    return ""

def invoke_llm_json(prompt: str, schema_dict: Dict[str, Any], system_instruction: str = "", model_type: str = "chat") -> Dict[str, Any]:
    """Invoca o provedor estruturado ativo (DeepSeek ou Gemini), com fallback robusto."""
    if LLM_PROVIDER == "deepseek" and DEEPSEEK_API_KEY:
        res = invoke_deepseek_json(prompt, schema_dict, system_instruction, model_type=model_type)
        if res:
            return res
        print("[Yooga API] AVISO - Falha estruturada no DeepSeek. Utilizando fallback para Gemini...")

    if GEMINI_API_KEY:
        return invoke_gemini_json(prompt, schema_dict, system_instruction)
        
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
    Simula a mensagem de resposta do cliente de suporte baseando-se no histórico estruturado,
    perfil psicológico do cliente e regras sazonais.
    """
    rag_query = build_rag_query(req.prompt, req.history)
    context = get_semantic_faq_context(rag_query, FAQ_PATH) if not req.system_instruction else ""

    if not is_llm_available():
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

    # Mapear o histórico de mensagens ativamente para papéis estruturados nativos (agent -> user, client -> assistant)
    chat_messages = []
    for msg in req.history:
        role = "user" if msg.sender == "agent" else "assistant"
        chat_messages.append({"role": role, "content": msg.message})
    
    # Injetar a mensagem atual do atendente (agent) à qual a IA precisa responder
    if req.prompt:
        chat_messages.append({"role": "user", "content": req.prompt})

    response_text = await asyncio.to_thread(invoke_llm_chat, chat_messages, system_instruction)

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

    if not is_llm_available():
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

    # 1. Tentar recuperar do Cache Semântico
    cached_response = coach_semantic_cache.get(chat_history_str)
    if cached_response:
        return cached_response

    # 2. Se não encontrou, executa a chamada LLM
    parsed_json = await asyncio.to_thread(invoke_llm_json, chat_history_str, schema, system_instruction, "reasoning")

    if not validate_coach_response(parsed_json):
        parsed_json = get_mock_coach_response(context)
    else:
        # Registrar no cache apenas se for uma resposta real válida
        clean_cache_item = dict(parsed_json)
        clean_cache_item.pop("_thinking_log", None)
        coach_semantic_cache.set(chat_history_str, clean_cache_item)

    parsed_json.pop("_thinking_log", None)
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
    
    if not is_llm_available():
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
    3. Se o atendimento foi excelente (nota acima de 90%) and não houver pontos reais a melhorar, você DEVE retornar a lista de melhorias vazia [] ou apenas com ["Manter a excelente qualidade de atendimento"].
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

    parsed_json = await asyncio.to_thread(invoke_llm_json, chat_history_str, schema, system_instruction, "reasoning")

    if not validate_audit_response(parsed_json):
        parsed_json = get_dynamic_offline_audit(req.history, req.goals)
        
    # Salvar o histórico de simulação de treino em arquivo JSON Lines (JSONL) para Fine-Tuning
    try:
        dir_path = os.path.join(os.path.dirname(__file__), "training_data")
        os.makedirs(dir_path, exist_ok=True)
        log_file_path = os.path.join(dir_path, "chat_logs.jsonl")
        
        # Extrair metadado de raciocínio se houver e remover do payload limpo enviado ao usuário
        thinking_log = parsed_json.pop("_thinking_log", None)
        
        log_entry = {
            "scenario_title": req.scenario_title,
            "goals": req.goals,
            "thinking_process": thinking_log,
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
        print(f"[Yooga API] OK - Historico de simulacao com thinking log salvo em: {log_file_path}")
    except Exception as log_err:
        print(f"[Yooga API] Erro ao salvar histórico de simulação para treino: {log_err}")
        
    return parsed_json

@app.post("/api/scenarios/generate")
async def generate_scenario(req: GenerateScenarioRequest):
    """Gera um cenário de treinamento estruturado em JSON e enriquecido via RAG com artigos do FAQ."""
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

    # 1. Executar busca RAG para fundamentar tecnicamente o cenário
    clean_query = extract_clean_rag_query(req.prompt)
    context = get_semantic_faq_context(clean_query, FAQ_PATH) if is_llm_available() else ""

    if not is_llm_available():
        return {
            "title": "Cenário offline",
            "description": "Gerado localmente (sem API ativa).",
            "client_profile": "irritado",
            "initial_problem": req.prompt[:300] if req.prompt else "Preciso de ajuda com o sistema Yooga.",
            "difficulty_level": "intermediario",
            "goals": ["Demonstrar empatia", "Aplicar FAQ Yooga", "Confirmar entendimento do cliente"],
            "context": "Revise e edite antes de publicar.",
            "expected_interactions": 4,
            "status": "ativo"
        }

    # Injetar o manual técnico do FAQ se algum artigo relevante foi encontrado
    rag_instructions = ""
    if context:
        rag_instructions = f"""
    Manual Técnico Oficial da Yooga para fundamentação:
    {context}
    
    INSTRUÇÕES IMPORTANTES:
    1. Baseie as metas de resolução do cenário ("goals") estritamente nos procedimentos corretos contidos no Manual Técnico acima.
    2. No campo "context" (contexto técnico), mencione de forma resumida as regras técnicas ou caminhos de menu reais do sistema Yooga indicados no FAQ.
    """

    system_instruction = req.system_instruction or f"""
    Você é um especialista sênior em Customer Success e Treinamentos da Yooga.
    Gere um cenário de treinamento simulado realista para analistas de suporte.
    {rag_instructions}
    
    Retorne APENAS um objeto JSON válido conforme o schema solicitado, em português brasileiro.
    """

    parsed_json = await asyncio.to_thread(invoke_llm_json, req.prompt, schema, system_instruction)

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
# ─── Endpoints de Banco de Dados Centralizado (Proxy Supabase) ───────────────

def get_table_name(entity_name: str) -> str:
    mapping = {
        "db_users": "users",
        "db_scenarios": "scenarios",
        "db_simulations": "simulations",
        "db_company_profiles": "company_profiles",
        "db_agent_performances": "agent_performances"
    }
    return mapping.get(entity_name, entity_name)

@app.get("/api/db/{entity}")
async def db_list(entity: str, orderBy: Optional[str] = "-created_date"):
    try:
        table = get_table_name(entity)
        desc = orderBy.startswith("-")
        field = orderBy.replace("-", "")
        if entity == "db_scenarios" and field == "moduleId":
            field = "module_id"
        order_direction = "desc" if desc else "asc"
        
        params = {"order": f"{field}.{order_direction}"}
        res = supabase_request(table, "GET", params=params)
        
        # Mapeamento de volta para o frontend
        if entity == "db_scenarios" and isinstance(res, list):
            for item in res:
                if "module_id" in item:
                    item["moduleId"] = item.pop("module_id")
                    
        return res
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no banco de dados: {e}")

@app.post("/api/db/{entity}/filter")
async def db_filter(entity: str, req: FilterRequest):
    try:
        table = get_table_name(entity)
        desc = req.orderBy.startswith("-")
        field = req.orderBy.replace("-", "")
        if entity == "db_scenarios" and field == "moduleId":
            field = "module_id"
        order_direction = "desc" if desc else "asc"
        
        params = {
            "order": f"{field}.{order_direction}",
            "limit": str(req.limit)
        }
        
        # Mapeia critérios para filtros do PostgREST
        if req.criteria:
            for k, v in req.criteria.items():
                db_key = k
                if entity == "db_scenarios" and k == "moduleId":
                    db_key = "module_id"
                    
                if isinstance(v, str) and db_key == "created_by":
                    params[db_key] = f"ilike.{v}"
                else:
                    params[db_key] = f"eq.{v}"
                    
        res = supabase_request(table, "GET", params=params)
        
        # Mapeamento de volta para o frontend
        if entity == "db_scenarios" and isinstance(res, list):
            for item in res:
                if "module_id" in item:
                    item["moduleId"] = item.pop("module_id")
                    
        return res
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao filtrar banco de dados: {e}")

@app.get("/api/db/{entity}/{item_id}")
async def db_get(entity: str, item_id: str):
    try:
        table = get_table_name(entity)
        params = {"id": f"eq.{item_id}"}
        res = supabase_request(table, "GET", params=params)
        if res and len(res) > 0:
            item = res[0]
            if entity == "db_scenarios" and "module_id" in item:
                item["moduleId"] = item.pop("module_id")
            return item
        raise HTTPException(status_code=404, detail="Item não encontrado")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter item: {e}")

@app.post("/api/db/{entity}")
async def db_create(entity: str, data: Dict[str, Any]):
    try:
        table = get_table_name(entity)
        
        # Mapeamento de camelCase para snake_case
        if entity == "db_scenarios" and "moduleId" in data:
            data["module_id"] = data.pop("moduleId")
            
        res = supabase_request(table, "POST", body=data)
        if res and len(res) > 0:
            item = res[0]
            if entity == "db_scenarios" and "module_id" in item:
                item["moduleId"] = item.pop("module_id")
            return item
        raise HTTPException(status_code=500, detail="Erro ao criar registro")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar item: {e}")

@app.put("/api/db/{entity}/{item_id}")
async def db_update(entity: str, item_id: str, data: Dict[str, Any]):
    try:
        table = get_table_name(entity)
        data.pop("created_date", None)
        
        # Mapeamento de camelCase para snake_case
        if entity == "db_scenarios" and "moduleId" in data:
            data["module_id"] = data.pop("moduleId")
            
        # updated_date pode ser atualizada via backend
        import datetime
        data["updated_date"] = datetime.datetime.utcnow().isoformat() + "Z"
        
        params = {"id": f"eq.{item_id}"}
        res = supabase_request(table, "PATCH", body=data, params=params)
        if res and len(res) > 0:
            item = res[0]
            if entity == "db_scenarios" and "module_id" in item:
                item["moduleId"] = item.pop("module_id")
            return item
        raise HTTPException(status_code=404, detail="Item não encontrado para atualização")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar item: {e}")

@app.delete("/api/db/{entity}/{item_id}")
async def db_delete(entity: str, item_id: str):
    try:
        table = get_table_name(entity)
        params = {"id": f"eq.{item_id}"}
        supabase_request(table, "DELETE", params=params)
        return {"id": item_id, "deleted": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar item: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
