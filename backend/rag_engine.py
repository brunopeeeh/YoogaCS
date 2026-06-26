import os
import json
import math
from typing import List, Dict, Any

# Cache em memória do arquivo JSON de embeddings (evita reler 27MB do disco a cada request)
_faq_cache: Any = None
_faq_cache_mtime: float = 0
_faq_cache_miss: bool = False

def _load_faq_data(faq_path: str):
    global _faq_cache, _faq_cache_mtime, _faq_cache_miss
    if _faq_cache_miss:
        return None
    try:
        if not os.path.exists(faq_path):
            _faq_cache_miss = True
            print(f"[RAG Engine] Aviso: Base vetorial não encontrada em: {faq_path}")
            return None
        current_mtime = os.path.getmtime(faq_path)
        if _faq_cache is not None and current_mtime <= _faq_cache_mtime:
            return _faq_cache
        with open(faq_path, "r", encoding="utf-8") as f:
            _faq_cache = json.load(f)
            _faq_cache_mtime = current_mtime
    except Exception as e:
        print(f"[RAG Engine] Erro ao carregar base vetorial: {e}")
        _faq_cache_miss = True
        return None

# Palavras-chave críticas para boosting semântico
KEYWORD_BOOSTS = [
    "offline", "contingencia", "navegador", "sincroniz", "ifood", "cardapio", 
    "nfce", "nfc-e", "csc", "sefaz", "contador", "impressora", "bobina", 
    "margem", "pagamento", "dividir", "caixa", "senha", "cancelamento", "permissao"
]

def int32(val: int) -> int:
    """Força um inteiro a se comportar como um signed 32-bit integer (como o operador '| 0' do JS)."""
    val = val & 0xffffffff
    if val >= 0x80000000:
        val -= 0x100000000
    return val

def generate_deterministic_vector(text: str) -> List[float]:
    """
    Gera um vetor determinístico normalizado de 768 dimensões com base no texto.
    Este algoritmo replica exatamente a lógica JavaScript para garantir compatibilidade
    com os embeddings salvos previamente no arquivo JSON.
    """
    dim = 768
    hash_val = 0
    for char in text:
        temp = (hash_val << 5) - hash_val
        hash_val = int32(ord(char) + temp)
        
    vector = []
    for d in range(dim):
        value = math.sin(hash_val + d) * 0.1
        vector.append(value)
        
    magnitude = math.sqrt(sum(val * val for val in vector))
    if magnitude == 0:
        return vector
    return [val / magnitude for val in vector]

def dot_product(vec_a: List[float], vec_b: List[float]) -> float:
    """Calcula o produto escalar (dot product) entre dois vetores."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    return sum(a * b for a, b in zip(vec_a, vec_b))

def get_semantic_faq_context(query: str, faq_path: str) -> str:
    """
    Realiza busca semântica na base FAQ Yooga.
    Prioridade: Supabase pgvector → JSON local (fallback).
    """
    if not query or not query.strip():
        return ""

    try:
        from supabase_rag import search_knowledge, is_supabase_configured
        if is_supabase_configured():
            supabase_context = search_knowledge(query)
            if supabase_context is not None:
                if supabase_context:
                    print("[RAG Engine] Contexto recuperado via Supabase pgvector")
                return supabase_context or ""
    except ImportError:
        pass
    except Exception as exc:
        print(f"[RAG Engine] Supabase indisponível, usando fallback local: {exc}")

    return _get_semantic_faq_context_local(query, faq_path)


def _get_semantic_faq_context_local(query: str, faq_path: str) -> str:
    """Busca semântica no arquivo JSON local de embeddings."""
    clean_query = query.strip().lower()
    
    # Ignorar saudações e frases genéricas sem termos técnicos
    greetings = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "tudo bem", "opa", "ajuda", "suporte"]
    if len(clean_query) < 4 or (clean_query in greetings and "problema" not in clean_query and "erro" not in clean_query):
        return ""
        
    try:
        faq_data = _load_faq_data(faq_path)
        if not isinstance(faq_data, list) or len(faq_data) == 0:
            return ""
            
        query_vector = generate_deterministic_vector(clean_query)
        matches = []
        
        for doc in faq_data:
            embedding = doc.get("embedding", [])
            similarity = dot_product(query_vector, embedding)
            
            # Boosting Semântico por Palavras-Chave
            title_lower = doc.get("title", "").lower()
            content_lower = doc.get("content", "").lower()
            
            for kw in KEYWORD_BOOSTS:
                if kw in clean_query:
                    if kw in title_lower:
                        similarity += 0.08
                    if kw in content_lower:
                        similarity += 0.03
                        
            matches.append({
                "title": doc.get("title", ""),
                "content": doc.get("content", ""),
                "faqUrl": doc.get("faqUrl", ""),
                "similarity": similarity
            })
            
        # Ordenar por similaridade decrescente
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        
        # Filtro estrito de corte de relevância
        matched_docs = [m for m in matches if m["similarity"] > 0.15]
        if not matched_docs:
            return ""
            
        # Deduplicação inteligente e seleção dos 3 melhores artigos distintos
        unique_docs = []
        seen_titles = set()
        for doc in matched_docs:
            title_norm = doc["title"].strip().lower()
            if title_norm not in seen_titles:
                seen_titles.add(title_norm)
                unique_docs.append(doc)
            if len(unique_docs) >= 3:
                break
                
        if not unique_docs:
            return ""
            
        # Formatar contexto estruturado (truncado para economizar tokens)
        context_parts = []
        for doc in unique_docs:
            content = doc["content"]
            if len(content) > 900:
                content = content[:897].rstrip() + "..."
            part = f'[Artigo de Ajuda Yooga: "{doc["title"]}"]\nConteúdo: {content}\nLink do Artigo: {doc["faqUrl"]}'
            context_parts.append(part)
            
        return "\n\n".join(context_parts)
        
    except Exception as e:
        print(f"[RAG Engine] Erro ao buscar contexto semântico: {e}")
        return ""
