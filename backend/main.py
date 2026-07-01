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
import hashlib

# Carregar variáveis de ambiente do diretório pai
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Provedor ativo e chaves
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "deepseek").lower()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash")
DEEPSEEK_REASONING_MODEL = os.getenv("DEEPSEEK_REASONING_MODEL", "deepseek-v4-pro")
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
    """Verifica se há algum provedor de LLM configurado e ativo, independente do provider ativo."""
    if DEEPSEEK_API_KEY:
        return True
    if GEMINI_API_KEY:
        return True
    return False

from rag_engine import get_semantic_faq_context, generate_deterministic_vector, dot_product
from prompt_templates import (
    build_simulation_system_prompt,
    build_coach_system_prompt,
    get_client_profile_instructions,
    get_typing_delay_ms,
    get_nudge_message
)
from audit_engine import run_orchestrated_audit

# Inicializar FastAPI
app = FastAPI(
    title="Yooga CS Coach API",
    description="Backend em Python para simulação de chat e auditoria de Customer Success",
    version="1.0.0"
)

# CORS: aceita Vercel, localhost em qualquer porta, e origens extras via env
_extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = [
    "https://yooga-training.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
] + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
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
    initial_problem: Optional[str] = ""
    scenario_title: Optional[str] = ""
    scenario_context: Optional[str] = None
    expected_interactions: Optional[int] = 4

class CoachRequest(BaseModel):
    prompt: str
    history: List[Message]
    system_instruction: Optional[str] = None
    scenario_title: Optional[str] = ""
    required_points_hint: Optional[str] = ""

class AuditRequest(BaseModel):
    history: List[Message]
    goals: Optional[List[str]] = []
    scenario_title: Optional[str] = ""
    system_instruction: Optional[str] = None
    prompt: Optional[str] = None
    faq_context: Optional[str] = ""
    checklist_section: Optional[str] = ""
    common_mistakes_section: Optional[str] = ""
    scoring_rules_section: Optional[str] = ""

class NudgeRequest(BaseModel):
    client_profile: str
    history: List[Message]
    scenario_title: Optional[str] = ""

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

class AuthLoginRequest(BaseModel):
    email: str
    password: str

# ─── Middleware de segurança ──────────────────────────────────────────────────

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # Ignora validações de API Key e Rate Limiting para requisições de Preflight (OPTIONS)
    if request.method == "OPTIONS":
        return await call_next(request)

    if request.url.path.startswith("/api/"):
        from fastapi.responses import JSONResponse
        origin = request.headers.get("origin", "*")
        cors_headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Content-Type, X-API-Key, Authorization",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, PATCH",
        }
        
        # Rate-limiting primeiro — aplica a todas as requisições, inclusive com API key inválida
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = _rate_limit_store[client_ip]
        timestamps[:] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
        
        # Relaxa o rate-limit para conexões locais (desenvolvimento e testes automatizados locais)
        effective_limit = 600 if client_ip in ("127.0.0.1", "localhost", "::1", "unknown") else RATE_LIMIT_MAX
        
        if len(timestamps) >= effective_limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Limite de requisições excedido. Tente novamente em breve."},
                headers=cors_headers
            )
        timestamps.append(now)
        
        # Validação de API key depois do rate-limit
        if BACKEND_API_KEY:
            api_key = request.headers.get("X-API-Key", "")
            if api_key != BACKEND_API_KEY:
                return JSONResponse(
                    status_code=401,
                    content={"detail": "API key inválida ou ausente"},
                    headers=cors_headers
                )

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

# ─── Cache Semântico Vetorial para o Coach ────────────────────────────────────

import unicodedata

def clean_text_for_cache(text: str) -> str:
    """Normaliza diacríticos e acentos (ex: 'faço' -> 'faco') e converte para minúsculas."""
    nfd_form = unicodedata.normalize('NFD', text)
    cleaned = "".join(c for c in nfd_form if unicodedata.category(c) != 'Mn')
    return cleaned.lower()

class SemanticCache:
    """Cache semântico baseado em similaridade por cosseno (dot product de vetores normalizados).
    
    Substitui a abordagem anterior baseada em Jaccard (interseção de palavras), que falhava
    em capturar paráfrases e sinônimos. Agora, mensagens como 'Como posso te ajudar?' e
    'De que forma posso te ajudar?' retornam um HIT com score alto.
    """
    def __init__(self, max_size: int = 100, threshold: float = 0.85):
        self.max_size = max_size
        self.threshold = threshold
        self.entries: List[Dict[str, Any]] = []

    def _vectorize(self, text: str) -> List[float]:
        cleaned = clean_text_for_cache(text)
        return generate_deterministic_vector(cleaned)

    def get(self, query: str) -> Optional[Dict[str, Any]]:
        if not query or not query.strip():
            return None
        
        if not self.entries:
            return None

        query_vec = self._vectorize(query)

        best_score = -1.0
        best_entry = None

        for entry in self.entries:
            score = dot_product(query_vec, entry["vector"])
            if score > best_score:
                best_score = score
                best_entry = entry

        if best_entry and best_score >= self.threshold:
            print(f"[Semantic Cache] HIT vetorial! Cosine Score: {best_score:.4f} (Economia de tokens!)")
            return dict(best_entry["response"])
            
        return None

    def set(self, query: str, response: Dict[str, Any]):
        if not query or not query.strip() or not response:
            return
        
        try:
            query_vec = self._vectorize(query)
            if len(self.entries) >= self.max_size:
                self.entries.pop(0)  # FIFO Eviction
                
            self.entries.append({
                "query": query,
                "vector": query_vec,
                "response": dict(response)
            })
            print(f"[Semantic Cache] Registrado com sucesso. Tamanho: {len(self.entries)}")
        except Exception as e:
            print(f"[Semantic Cache] Erro ao registrar no cache: {e}")

coach_semantic_cache = SemanticCache(max_size=100, threshold=0.85)

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
        fallback_model = DEEPSEEK_MODEL or "deepseek-v4-flash"
    else:
        primary_model = DEEPSEEK_MODEL or "deepseek-v4-flash"
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
    context = await asyncio.to_thread(get_semantic_faq_context, req.query, FAQ_PATH)
    source = "none"
    if context:
        try:
            from supabase_rag import is_supabase_configured
            source = "supabase" if is_supabase_configured() else "local_json"
        except ImportError:
            source = "local_json"

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
    Prompts são construídos centralizadamente via prompt_templates.py.
    """
    rag_query = build_rag_query(req.prompt, req.history)
    faq_context = get_semantic_faq_context(rag_query, FAQ_PATH) if not req.system_instruction else ""

    if not is_llm_available():
        return {"response": get_mock_client_response(req.prompt, faq_context, req.client_profile), "typing_delay_ms": 1500}

    # Detectar condições de encerramento e primeira mensagem
    agent_interactions = sum(1 for m in req.history if m.sender == "agent")
    is_first_message = len(req.history) == 0
    
    # Detecção de encerramento baseada no histórico
    should_force_ending = False
    if agent_interactions >= 1 and not is_first_message:
        keywords_map = {
            "venda offline": ["salv", "navegador", "fech", "limp", "sincroniz", "off", "contingencia"],
            "ifood": ["vinc", "categori", "sincroniz", "preço", "painel", "portal"],
            "fiscal": ["csc", "sefaz", "produção", "certificado", "digital", "contador", "nfc"],
            "nfc-e": ["csc", "sefaz", "produção", "certificado", "digital", "contador", "nfc"],
            "impressora": ["largura", "bobina", "58mm", "margem", "margens", "horizontal"],
            "pagamento": ["parcial", "adicionar", "dividir", "pix", "dinheiro", "fechamento"],
            "segurança": ["cargo", "permissao", "senha", "cancelamento", "gerente", "administrador"],
            "delivery": ["ajust", "configur", "habilit", "painel", "acompanh", "loja", "chat", "cliente"]
        }
        title_lower = (req.scenario_title or "").lower()
        history_text = " ".join(m.message.lower() for m in req.history)
        lower_prompt = req.prompt.lower() if req.prompt else ""
        has_ending = any(kw in lower_prompt for kw in ["tchau", "abraco", "tarde", "finalizar", "concluir", "ajudar em algo", "disposicao"])
        should_force_ending = agent_interactions >= (req.expected_interactions or 4) - 1 or has_ending

    # Construir system instruction centralizado
    if req.system_instruction:
        system_instruction = req.system_instruction
    else:
        system_instruction = build_simulation_system_prompt(
            client_profile=req.client_profile,
            initial_problem=req.initial_problem or req.prompt,
            faq_context=faq_context,
            agent_interactions=agent_interactions,
            is_first_message=is_first_message,
            should_force_ending=should_force_ending,
            scenario_context=req.scenario_context
        )

    # Mapear histórico para papéis estruturados nativos (agent -> user, client -> assistant)
    chat_messages = []
    for msg in req.history:
        role = "user" if msg.sender == "agent" else "assistant"
        chat_messages.append({"role": role, "content": msg.message})
    
    if req.prompt:
        chat_messages.append({"role": "user", "content": req.prompt})

    response_text = await asyncio.to_thread(invoke_llm_chat, chat_messages, system_instruction)

    if not response_text:
        response_text = get_mock_client_response(req.prompt, faq_context, req.client_profile)

    # Calcular delay de digitação baseado no perfil
    typing_delay_ms = get_typing_delay_ms(req.client_profile, len(response_text))

    return {"response": response_text, "typing_delay_ms": typing_delay_ms}


@app.post("/api/chat/simulate/nudge")
async def simulate_nudge(req: NudgeRequest):
    """
    Gera uma mensagem de "cobrança" do cliente quando o atendente demora para responder.
    Usado para simular o comportamento real de WhatsApp (double-texting ativo).
    """
    nudge_msg = get_nudge_message(req.client_profile)
    if nudge_msg is None:
        return {"nudge": None, "should_nudge": False}
    return {"nudge": nudge_msg, "should_nudge": True}

@app.post("/api/chat/coach")
async def coach_assistant(req: CoachRequest):
    """
    Retorna uma sugestão perfeita de resposta para o analista estruturada sob
    as 5 Regras de Ouro Yooga, acompanhada por justificativa pedagógica.
    Prompts construídos centralizadamente via prompt_templates.py.
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

    # Construir system instruction centralizado
    if req.system_instruction:
        system_instruction = req.system_instruction
        if context and context not in system_instruction:
            system_instruction += f"\n\nContexto adicional do FAQ Yooga:\n{context}"
    else:
        system_instruction = build_coach_system_prompt(
            faq_context=context,
            required_points_hint=req.required_points_hint or ""
        )

    chat_history_str = ""
    for msg in req.history:
        role_label = "Atendente (Yooga CS)" if msg.sender == "agent" else "Cliente"
        chat_history_str += f"{role_label}: {msg.message}\n"
    chat_history_str += f"Cliente (última mensagem): {req.prompt}\nSugira a melhor resposta do Atendente Yooga no formato JSON solicitado."

    # 1. Tentar recuperar do Cache Semântico Vetorial
    cached_response = coach_semantic_cache.get(chat_history_str)
    if cached_response:
        return cached_response

    # 2. Se não encontrou, executa a chamada LLM
    parsed_json = await asyncio.to_thread(invoke_llm_json, chat_history_str, schema, system_instruction, "reasoning")

    if not validate_coach_response(parsed_json):
        parsed_json = get_mock_coach_response(context)
    else:
        clean_cache_item = dict(parsed_json)
        clean_cache_item.pop("_thinking_log", None)
        coach_semantic_cache.set(chat_history_str, clean_cache_item)

    parsed_json.pop("_thinking_log", None)
    return parsed_json

@app.post("/api/chat/audit")
async def audit_chat(req: AuditRequest):
    """
    Avalia a simulação de chat concluída usando Auditoria Multi-Agente Orquestrada.
    3 agentes paralelos (Técnico + Empatia + Consolidador) para avaliação mais precisa.
    """
    if not is_llm_available():
        return get_dynamic_offline_audit(req.history, req.goals)

    if req.system_instruction:
        system_instruction = req.system_instruction
    else:
        goals_formatted = "\n".join(f"- {g}" for g in req.goals) if req.goals else "- Solucionar o problema relatado com base no FAQ Yooga."
        system_instruction = f"""
    Você é um Auditor de Qualidade Sênior de Customer Success na Yooga.
    Sua missão é avaliar detalhadamente a transcrição do atendimento com base nas diretrizes da marca.

    ━━━ CRITÉRIOS DE AVALIAÇÃO ━━━

    **Empatia (empathy_score)**
    O analista acolheu o cliente ANTES de dar a solução técnica? Reconheceu o momento do cliente (rush, impressora travada, stress)? Usou escuta ativa? Humanizou o contato?

    **Resolução/Conhecimento Técnico (resolution_score)**
    Resolveu o problema corretamente com base no FAQ Yooga? Guiou pelos caminhos de menu exatos? Não inventou passos? Antecipou próximas dúvidas (proatividade)?

    **Tom de Voz Yooga (professionalism_score)** ← critério principal desta avaliação
    O analista seguiu o Jeito Yooga de se comunicar? Avalie POSITIVAMENTE se o atendente:
    - Foi amigável, caloroso e descontraído (arquétipo do amigo)
    - Usou linguagem simples, frases curtas, sem termos técnicos excessivos
    - Usou emojis com equilíbrio
    - Usou palavras no diminutivo (minutinhos, rapidinho) quando pertinente
    - Se comunicou em primeira pessoa do plural (nosso sistema, estamos aqui)
    - NÃO usou gerundismo ("vamos estar fazendo" → erro grave, penalizar)
    - NÃO foi frio, robótico ou padronizado demais
    - NÃO usou CAPS LOCK
    - NÃO culpou o cliente
    IMPORTANTE: ser informal, usar emojis e diminutivos é CORRETO no padrão Yooga — não penalizar por isso.

    **Agilidade/Foco (agility_score)**
    Respondeu com clareza e objetividade? Evitou enrolação? Informou o cliente sobre o que estava fazendo quando precisou de tempo?

    ━━━ OBJETIVOS DO CENÁRIO ━━━
    {goals_formatted}

    ━━━ INSTRUÇÕES PARA STRENGTHS E IMPROVEMENTS ━━━
    1. "strengths": liste de 2 a 4 pontos específicos onde o analista se destacou. Se nota > 70, NUNCA deixe vazio.
    2. "improvements": apenas críticas construtivas e erros reais. Seja específico — mencione o que exatamente poderia ser feito diferente seguindo o Tom de Voz Yooga.
    3. Se nota > 90 e sem erros reais: improvements pode ser [] ou ["Manter a excelente qualidade de atendimento"].
    4. NUNCA coloque elogios dentro de "improvements". Elogios vão EXCLUSIVAMENTE em "strengths".
    5. Um atendimento bom não precisa ser perfeito — reconheça os acertos mesmo quando há melhorias pontuais.

    ━━━ ATENÇÃO CRÍTICA ━━━
    Se não houver NENHUMA mensagem do Atendente (Yooga CS):
    - Zerar TODAS as notas (0).
    - Descrever no feedback que o atendimento foi abandonado.
    - Colocar em improvements: "Interagir com o cliente durante o atendimento".

    Seja honesto e criterioso. Nota 100 é extremamente rara. Atendimentos bons ficam entre 75–90.
    """
    _ctx = get_agent_context()
    if _ctx:
        system_instruction = f"{_ctx}\n\n---\n\n{system_instruction}"

    # Construir transcrição formatada
    chat_history_str = ""
    for msg in req.history:
        role_label = "Atendente (Yooga CS)" if msg.sender == "agent" else "Cliente"
        chat_history_str += f"{role_label}: {msg.message}\n"
    if req.prompt:
        chat_history_str += f"\n{req.prompt}\n"

    # Executar auditoria multi-agente orquestrada
    parsed_json = await run_orchestrated_audit(
        history_str=chat_history_str,
        goals=req.goals or [],
        scenario_title=req.scenario_title or "",
        faq_context=req.faq_context or "",
        checklist_section=req.checklist_section or "",
        common_mistakes_section=req.common_mistakes_section or "",
        scoring_rules_section=req.scoring_rules_section or "",
        invoke_llm_json_fn=invoke_llm_json
    )

    if not validate_audit_response(parsed_json):
        parsed_json = get_dynamic_offline_audit(req.history, req.goals)
        
    # Salvar o histórico de simulação de treino em arquivo JSON Lines (JSONL) para Fine-Tuning
    try:
        dir_path = os.path.join(os.path.dirname(__file__), "training_data")
        os.makedirs(dir_path, exist_ok=True)
        log_file_path = os.path.join(dir_path, "chat_logs.jsonl")
        
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
        print(f"[Yooga API] OK - Historico de simulacao com auditoria multi-agente salvo em: {log_file_path}")
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

# ─── Admin: leitura e edição do contexto do agente ───────────────────────────

_AGENT_CONTEXT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "src", "data", "knowledge-base", "_system", "yooga-agent-context.md"
)

@app.get("/api/admin/context")
async def get_admin_context():
    """Retorna o conteúdo atual do yooga-agent-context.md."""
    try:
        with open(_AGENT_CONTEXT_PATH, encoding="utf-8") as f:
            return {"content": f.read()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler arquivo: {e}")

class AdminContextPatch(BaseModel):
    content: str
    push: bool = False  # False = só salva localmente; True = salva + git commit + push
    commit_message: str = "fix: ajuste de critérios de avaliação via painel admin"

@app.patch("/api/admin/context")
async def patch_admin_context(body: AdminContextPatch):
    """Salva o conteúdo editado e, opcionalmente, faz git commit + push."""
    import subprocess

    try:
        with open(_AGENT_CONTEXT_PATH, "w", encoding="utf-8") as f:
            f.write(body.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar arquivo: {e}")

    # Invalida o cache para recarregar na próxima chamada
    get_agent_context.cache_clear()

    if not body.push:
        return {"saved": True, "pushed": False, "git_log": []}

    # Git: commit + push (força add mesmo se gitignored)
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    git_log = []
    try:
        subprocess.run(["git", "add", "-f", _AGENT_CONTEXT_PATH], cwd=repo_root, check=True, capture_output=True)
        result = subprocess.run(
            ["git", "commit", "-m", body.commit_message],
            cwd=repo_root, capture_output=True, text=True
        )
        git_log.append(result.stdout.strip() or result.stderr.strip())
        push_result = subprocess.run(["git", "push"], cwd=repo_root, capture_output=True, text=True)
        git_log.append(push_result.stdout.strip() or push_result.stderr.strip())
        pushed = push_result.returncode == 0
    except Exception as e:
        git_log.append(str(e))
        pushed = False

    return {"saved": True, "pushed": pushed, "git_log": git_log}

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

    # Tom de Voz Yooga — avalia aderência ao arquétipo do amigo
    professionalism_score = 80
    all_agent_text = " ".join(agent_msgs)
    tone_positives = ["😊", "😄", "minutinhos", "rapidinho", "olhadinha", "nosso", "estamos", "vamos", "tá", "né", "obrigad"]
    tone_negatives = ["vamos estar", "iremos estar", "estaremos"]  # gerundismo proibido
    bad_words = ["porra", "merda", "burro", "sei lá", "não sei"]
    professionalism_score += min(sum(1 for t in tone_positives if t in all_agent_text) * 3, 15)
    professionalism_score -= sum(5 for t in tone_negatives if t in all_agent_text)
    if any(b in all_agent_text for b in bad_words):
        professionalism_score = 30
    professionalism_score = max(0, min(professionalism_score, 100))

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
        feedback += "Excelente postura! Tom de voz alinhado ao Jeito Yooga, empatia presente e domínio técnico demonstrado."
        strengths.append("Tom de voz caloroso e alinhado ao arquétipo do amigo Yooga")
        strengths.append("Domínio dos procedimentos descritos no FAQ")
        if empathy_score >= 80:
            strengths.append("Acolhimento do cliente antes de entregar a solução técnica")
    elif overall_score >= 60:
        feedback += "Bom atendimento! Há pontos pontuais a refinar, mas a base está correta."
        strengths.append("Comunicação clara e objetiva")
        if professionalism_score >= 75:
            strengths.append("Tom de voz adequado ao padrão Yooga")
        improvements.append("Guiar o cliente passo a passo com o caminho exato do menu no sistema")
        if empathy_score < 70:
            improvements.append("Acolher o momento do cliente antes de entregar a solução técnica (ex.: 'Entendi! Minutinhos 😊')")
    else:
        feedback += "O atendimento precisa de ajustes. Foque em acolher o cliente antes de resolver e siga o Tom de Voz Yooga."
        improvements.append("Acolher o cliente antes de passar a solução técnica — reconheça o problema primeiro")
        improvements.append("Usar linguagem mais próxima e humana (Jeito Yooga: informal, caloroso, sem gerundismo)")
        improvements.append("Estudar o FAQ para guiar o cliente com os caminhos de menu corretos")

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

def map_db_to_js(entity: str, data: Any) -> Any:
    if not data:
        return data
        
    def map_item(item: Dict[str, Any]) -> Dict[str, Any]:
        if not isinstance(item, dict):
            return item
            
        item = dict(item)
            
        if entity == "db_users":
            item.pop("password", None)
            
        elif entity == "db_scenarios":
            if "module_id" in item:
                item["moduleId"] = item.pop("module_id")
                
        elif entity == "db_simulations":
            if "history" in item:
                item["messages"] = item.pop("history")
            if "audit_results" in item:
                item["evaluation"] = item.pop("audit_results")
            
            # Reconstruct duration_minutes and suggestions_used from evaluation for the frontend
            if "evaluation" in item and isinstance(item["evaluation"], dict):
                item["duration_minutes"] = item["evaluation"].get("duration_minutes", 0)
                item["suggestions_used"] = item["evaluation"].get("suggestions_used", 0)
                
        elif entity == "db_agent_performances":
            if "badges" in item and isinstance(item["badges"], dict):
                js_data = item["badges"]
                item["agent_email"] = js_data.get("agent_email")
                item["weak_areas"] = js_data.get("weak_areas")
                item["strong_areas"] = js_data.get("strong_areas")
                item["last_analysis_date"] = js_data.get("last_analysis_date")
                item["recommended_scenarios"] = js_data.get("recommended_scenarios")
                
        return item

    if isinstance(data, list):
        return [map_item(x) for x in data]
    return map_item(data)


def map_js_to_db(entity: str, data: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(data, dict):
        return data
        
    mapped = dict(data)
    
    if entity == "db_scenarios":
        if "moduleId" in mapped:
            mapped["module_id"] = mapped.pop("moduleId")
            
    elif entity == "db_simulations":
        if "messages" in mapped:
            mapped["history"] = mapped.pop("messages")
        if "evaluation" in mapped:
            mapped["audit_results"] = mapped.pop("evaluation")
            
        # Pop non-SQL fields so they don't break PostgREST on Supabase
        duration_minutes = mapped.pop("duration_minutes", None)
        suggestions_used = mapped.pop("suggestions_used", None)
        
        # Store duration_minutes and suggestions_used inside audit_results (JSONB)
        if "audit_results" not in mapped or not isinstance(mapped["audit_results"], dict):
            mapped["audit_results"] = {}
            
        if duration_minutes is not None:
            mapped["audit_results"]["duration_minutes"] = duration_minutes
        if suggestions_used is not None:
            mapped["audit_results"]["suggestions_used"] = suggestions_used
            
        # Lookup agent_id from users table if not provided
        if "agent_id" not in mapped or not mapped["agent_id"]:
            agent_email = mapped.get("created_by", "")
            if agent_email and "@" in agent_email:
                try:
                    user_res = supabase_request("users", "GET", params={"email": f"eq.{agent_email.lower()}"})
                    if user_res and len(user_res) > 0:
                        mapped["agent_id"] = user_res[0]["id"]
                except Exception as e:
                    print(f"[Yooga API Mapping] Erro ao buscar agent_id por e-mail: {e}")
            if "agent_id" not in mapped or not mapped["agent_id"]:
                mapped["agent_id"] = "local"
                
        # Lookup scenario_title from scenarios table if not provided
        if "scenario_title" not in mapped or not mapped["scenario_title"]:
            scenario_id = mapped.get("scenario_id")
            if scenario_id:
                try:
                    scen_res = supabase_request("scenarios", "GET", params={"id": f"eq.{scenario_id}"})
                    if scen_res and len(scen_res) > 0:
                        mapped["scenario_title"] = scen_res[0]["title"]
                except Exception as e:
                    print(f"[Yooga API Mapping] Erro ao buscar scenario_title por id: {e}")
            if "scenario_title" not in mapped or not mapped["scenario_title"]:
                mapped["scenario_title"] = "Cenário de Atendimento"
                
    elif entity == "db_agent_performances":
        # Resolve agent_id from agent_email (users table lookup)
        agent_email = mapped.get("agent_email", "")
        if agent_email and "@" in agent_email:
            try:
                user_res = supabase_request("users", "GET", params={"email": f"eq.{agent_email.lower()}"})
                if user_res and len(user_res) > 0:
                    mapped["agent_id"] = user_res[0]["id"]
            except Exception as e:
                print(f"[Yooga API Mapping] Erro ao buscar agent_id para performance: {e}")
        if "agent_id" not in mapped or not mapped["agent_id"]:
            mapped["agent_id"] = "local"
            
        # Store JS fields inside badges
        js_data = {
            "agent_email": mapped.get("agent_email"),
            "weak_areas": mapped.get("weak_areas"),
            "strong_areas": mapped.get("strong_areas"),
            "last_analysis_date": mapped.get("last_analysis_date"),
            "recommended_scenarios": mapped.get("recommended_scenarios")
        }
        mapped["badges"] = js_data
        
        # Remove JS fields that are not in SQL table schema
        mapped.pop("agent_email", None)
        mapped.pop("weak_areas", None)
        mapped.pop("strong_areas", None)
        mapped.pop("last_analysis_date", None)
        mapped.pop("recommended_scenarios", None)
        
    return mapped

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
        return map_db_to_js(entity, res)
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
        return map_db_to_js(entity, res)
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
            return map_db_to_js(entity, res[0])
        raise HTTPException(status_code=404, detail="Item não encontrado")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter item: {e}")

@app.post("/api/db/{entity}")
async def db_create(entity: str, data: Dict[str, Any]):
    try:
        if not isinstance(data, dict) or not data:
            raise HTTPException(status_code=400, detail="Corpo da requisição deve ser um dicionário não-vazio")
        table = get_table_name(entity)
        if entity not in ("db_users", "db_scenarios", "db_simulations", "db_company_profiles", "db_agent_performances"):
            raise HTTPException(status_code=400, detail=f"Entidade desconhecida: {entity}")
        db_data = map_js_to_db(entity, data)
        res = supabase_request(table, "POST", body=db_data)
        if res and len(res) > 0:
            return map_db_to_js(entity, res[0])
        raise HTTPException(status_code=500, detail="Erro ao criar registro")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar item: {e}")

@app.put("/api/db/{entity}/{item_id}")
async def db_update(entity: str, item_id: str, data: Dict[str, Any]):
    try:
        if not isinstance(data, dict) or not data:
            raise HTTPException(status_code=400, detail="Corpo da requisição deve ser um dicionário não-vazio")
        if entity not in ("db_users", "db_scenarios", "db_simulations", "db_company_profiles", "db_agent_performances"):
            raise HTTPException(status_code=400, detail=f"Entidade desconhecida: {entity}")
        table = get_table_name(entity)
        data.pop("created_date", None)
        db_data = map_js_to_db(entity, data)
        
        # updated_date pode ser atualizada via backend
        import datetime
        db_data["updated_date"] = datetime.datetime.utcnow().isoformat() + "Z"
        
        params = {"id": f"eq.{item_id}"}
        res = supabase_request(table, "PATCH", body=db_data, params=params)
        if res and len(res) > 0:
            return map_db_to_js(entity, res[0])
        raise HTTPException(status_code=404, detail="Item não encontrado para atualização")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar item: {e}")

@app.delete("/api/db/{entity}/{item_id}")
async def db_delete(entity: str, item_id: str):
    try:
        if entity not in ("db_users", "db_scenarios", "db_simulations", "db_company_profiles", "db_agent_performances"):
            raise HTTPException(status_code=400, detail=f"Entidade desconhecida: {entity}")
        table = get_table_name(entity)
        params = {"id": f"eq.{item_id}"}
        supabase_request(table, "DELETE", params=params)
        return {"id": item_id, "deleted": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar item: {e}")


@app.post("/api/auth/login")
async def auth_login(req: AuthLoginRequest):
    try:
        table = get_table_name("db_users")
        params = {"email": f"eq.{req.email.strip().lower()}"}
        users = supabase_request(table, "GET", params=params)
        if not users or len(users) == 0:
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

        user = users[0]
        hashed_input = hashlib.sha256(req.password.encode()).hexdigest()
        stored_hash = user.get("password", "")

        is_match = stored_hash == hashed_input
        if not is_match and stored_hash == req.password:
            is_match = True
            supabase_request(table, "PATCH", body={"password": hashed_input}, params={"id": f"eq.{user['id']}"})

        if not is_match:
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

        return {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"]
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao autenticar: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
