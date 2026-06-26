#!/usr/bin/env python3
"""
Importa a base vetorial Yooga (faq-embeddings.json + metadados markdown) para o Supabase.

Uso:
  py -3.12 scripts/ingest-supabase-vectors.py
  py -3.12 scripts/ingest-supabase-vectors.py --dry-run
  py -3.12 scripts/ingest-supabase-vectors.py --from-markdown

Requer no .env:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from dotenv import load_dotenv

load_dotenv(ROOT / ".env")

EMBEDDINGS_PATH = ROOT / "src" / "data" / "faq-embeddings.json"
KNOWLEDGE_BASE_DIR = ROOT / "src" / "data" / "knowledge-base"
BATCH_SIZE = 100


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    meta: dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip().strip('"').strip("'")
    return meta


def load_markdown_metadata() -> dict[str, dict[str, str]]:
    """Mapeia slug do artigo -> category/source."""
    mapping: dict[str, dict[str, str]] = {}
    if not KNOWLEDGE_BASE_DIR.exists():
        return mapping

    for md_path in KNOWLEDGE_BASE_DIR.rglob("*.md"):
        if md_path.name == "_index.md":
            continue
        try:
            raw = md_path.read_text(encoding="utf-8")
        except OSError:
            continue
        meta = parse_frontmatter(raw)
        slug = md_path.stem
        category = meta.get("category") or md_path.parent.name.replace("-", " ").title()
        mapping[slug] = {
            "category": category,
            "source": meta.get("source", ""),
            "title": meta.get("title", slug),
        }
    return mapping


def extract_article_id(chunk_id: str) -> tuple[str, int]:
    match = re.match(r"^(.*)-part-(\d+)$", chunk_id)
    if match:
        return match.group(1), int(match.group(2))
    return chunk_id, 0


def estimate_tokens(text: str) -> int:
    return max(1, len(text.split()))


def load_embeddings_json() -> list[dict[str, Any]]:
    if not EMBEDDINGS_PATH.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {EMBEDDINGS_PATH}")
    with EMBEDDINGS_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("faq-embeddings.json deve ser uma lista de chunks")
    return data


def build_records(chunks: list[dict[str, Any]], md_meta: dict[str, dict[str, str]]):
    articles: dict[str, dict[str, Any]] = {}
    records: list[dict[str, Any]] = []
    seen_chunk_ids: set[str] = set()

    for chunk in chunks:
        chunk_id = chunk["id"]
        if chunk_id in seen_chunk_ids:
            continue
        seen_chunk_ids.add(chunk_id)
        article_id, chunk_index = extract_article_id(chunk_id)
        slug_meta = md_meta.get(article_id, {})
        category = slug_meta.get("category")
        faq_url = chunk.get("faqUrl") or slug_meta.get("source") or ""

        if article_id not in articles:
            articles[article_id] = {
                "id": article_id,
                "title": chunk.get("title", article_id),
                "faq_url": faq_url,
                "category": category,
                "source_slug": article_id,
                "chunk_count": 0,
            }
        articles[article_id]["chunk_count"] += 1

        embedding = chunk.get("embedding")
        if not embedding or len(embedding) != 768:
            print(f"[AVISO] Chunk {chunk_id} ignorado: embedding inválido")
            continue

        content = chunk.get("content", "")
        records.append({
            "id": chunk_id,
            "article_id": article_id,
            "chunk_index": chunk_index,
            "title": chunk.get("title", ""),
            "faq_url": faq_url,
            "category": category,
            "content": content,
            "content_tokens": estimate_tokens(content),
            "embedding": embedding,
        })

    return list(articles.values()), records


def get_supabase_client():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError(
            "Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env"
        )
    from supabase import create_client
    return create_client(url, key)


def upsert_batches(client, table: str, rows: list[dict[str, Any]], dry_run: bool) -> int:
    total = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        if dry_run:
            total += len(batch)
            continue
        client.table(table).upsert(batch, on_conflict="id").execute()
        total += len(batch)
        print(f"  -> {table}: {total}/{len(rows)}")
    return total


def run(dry_run: bool = False) -> None:
    print("=== INGESTÃO SUPABASE — BASE VETORIAL YOOGA ===")
    chunks = load_embeddings_json()
    md_meta = load_markdown_metadata()
    articles, records = build_records(chunks, md_meta)

    print(f"Artigos: {len(articles)}")
    print(f"Chunks válidos: {len(records)}")
    print(f"Metadados markdown: {len(md_meta)} arquivos")

    if dry_run:
        print("[DRY-RUN] Nenhum dado enviado ao Supabase.")
        return

    client = get_supabase_client()

    print("\n1/2 Upsert knowledge_articles...")
    upsert_batches(client, "knowledge_articles", articles, dry_run=False)

    print("\n2/2 Upsert knowledge_chunks...")
    upsert_batches(client, "knowledge_chunks", records, dry_run=False)

    stats = client.rpc("knowledge_base_stats").execute()
    print("\n=== CONCLUÍDO ===")
    print(json.dumps(stats.data, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Importa FAQ Yooga para Supabase pgvector")
    parser.add_argument("--dry-run", action="store_true", help="Apenas simula, sem gravar")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
