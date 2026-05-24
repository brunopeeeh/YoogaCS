"""
Busca semântica RAG via Supabase pgvector.
Fallback automático para JSON local quando Supabase não estiver configurado.
"""
from __future__ import annotations

import os
from typing import Any, List, Optional

from rag_engine import KEYWORD_BOOSTS, generate_deterministic_vector

MAX_CONTEXT_CHARS = 900
MAX_ARTICLES = 3
MATCH_COUNT = 12
MATCH_THRESHOLD = 0.15

_supabase_client = None


def _get_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(url, key)
        return _supabase_client
    except Exception as exc:
        print(f"[Supabase RAG] Falha ao conectar: {exc}")
        return None


def is_supabase_configured() -> bool:
    return bool(os.getenv("SUPABASE_URL")) and bool(
        os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    )


def _apply_keyword_boosts(clean_query: str, matches: List[dict]) -> List[dict]:
    for doc in matches:
        title_lower = (doc.get("title") or "").lower()
        content_lower = (doc.get("content") or "").lower()
        similarity = float(doc.get("similarity") or 0)
        for kw in KEYWORD_BOOSTS:
            if kw in clean_query:
                if kw in title_lower:
                    similarity += 0.08
                if kw in content_lower:
                    similarity += 0.03
        doc["similarity"] = similarity
    matches.sort(key=lambda x: x["similarity"], reverse=True)
    return matches


def _truncate_content(content: str, max_chars: int = MAX_CONTEXT_CHARS) -> str:
    content = (content or "").strip()
    if len(content) <= max_chars:
        return content
    return content[: max_chars - 3].rstrip() + "..."


def _format_context(matches: List[dict]) -> str:
    unique_docs: List[dict] = []
    seen_titles: set[str] = set()

    for doc in matches:
        title_norm = (doc.get("title") or "").strip().lower()
        if title_norm in seen_titles:
            continue
        seen_titles.add(title_norm)
        unique_docs.append(doc)
        if len(unique_docs) >= MAX_ARTICLES:
            break

    if not unique_docs:
        return ""

    parts = []
    for doc in unique_docs:
        content = _truncate_content(doc.get("content", ""))
        parts.append(
            f'[Artigo de Ajuda Yooga: "{doc.get("title", "")}"]\n'
            f"Conteúdo: {content}\n"
            f'Link do Artigo: {doc.get("faq_url") or doc.get("faqUrl", "")}'
        )
    return "\n\n".join(parts)


def search_knowledge(query: str) -> Optional[str]:
    """Retorna contexto RAG formatado ou None se indisponível."""
    if not query or not query.strip():
        return ""

    clean_query = query.strip().lower()
    greetings = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "tudo bem", "opa", "ajuda", "suporte"]
    if len(clean_query) < 4 or (
        clean_query in greetings and "problema" not in clean_query and "erro" not in clean_query
    ):
        return ""

    client = _get_client()
    if client is None:
        return None

    try:
        query_vector = generate_deterministic_vector(clean_query)
        response = client.rpc(
            "match_knowledge_chunks",
            {
                "query_embedding": query_vector,
                "match_count": MATCH_COUNT,
                "match_threshold": MATCH_THRESHOLD,
                "filter_category": None,
            },
        ).execute()

        rows = response.data or []
        if not rows:
            return ""

        boosted = _apply_keyword_boosts(clean_query, rows)
        relevant = [m for m in boosted if m.get("similarity", 0) > MATCH_THRESHOLD]
        return _format_context(relevant)
    except Exception as exc:
        print(f"[Supabase RAG] Erro na busca: {exc}")
        return None


def get_stats() -> dict[str, Any]:
    client = _get_client()
    if client is None:
        return {"configured": False}
    try:
        response = client.rpc("knowledge_base_stats").execute()
        data = response.data
        if isinstance(data, list) and data:
            return {"configured": True, **data[0]}
        return {"configured": True, "raw": data}
    except Exception as exc:
        return {"configured": True, "error": str(exc)}
