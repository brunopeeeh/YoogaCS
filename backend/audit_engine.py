"""
audit_engine.py — Motor de Auditoria Multi-Agente Orquestrada.

Executa 3 sub-avaliações em paralelo para uma auditoria mais precisa e imparcial:
1. Agente Técnico: avalia resolution_score + agility_score
2. Agente de Tom/Empatia: avalia empathy_score + professionalism_score
3. Consolidador: gera overall_score, feedback, strengths, improvements
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, Callable

from prompt_templates import (
    build_technical_audit_prompt,
    build_empathy_audit_prompt,
    build_consolidation_audit_prompt
)


async def run_orchestrated_audit(
    history_str: str,
    goals: List[str],
    scenario_title: str,
    faq_context: str,
    checklist_section: str,
    common_mistakes_section: str,
    scoring_rules_section: str,
    invoke_llm_json_fn: Callable,
) -> Dict[str, Any]:
    """
    Executa auditoria multi-agente com 3 sub-avaliações paralelas.
    
    Args:
        history_str: Transcrição formatada da conversa
        goals: Objetivos do cenário
        scenario_title: Título do cenário
        faq_context: Conteúdo técnico do FAQ
        checklist_section: Checklist de pontos obrigatórios formatado
        common_mistakes_section: Seção de erros comuns formatada
        scoring_rules_section: Critérios de pontuação formatados
        invoke_llm_json_fn: Função para invocar LLM com resposta JSON (sync)
        invoke_llm_text_fn: Função para invocar LLM com resposta texto (sync, opcional)
    
    Returns:
        Dicionário com a auditoria consolidada completa
    """
    
    # ═══ Schemas JSON para cada agente ═══
    
    technical_schema = {
        "type": "object",
        "properties": {
            "resolution_score": {"type": "integer"},
            "agility_score": {"type": "integer"},
            "technical_feedback": {"type": "string"},
            "points_covered": {"type": "array", "items": {"type": "string"}},
            "points_missing": {"type": "array", "items": {"type": "string"}},
            "mistakes_found": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["resolution_score", "agility_score", "technical_feedback", "points_covered", "points_missing", "mistakes_found"]
    }
    
    empathy_schema = {
        "type": "object",
        "properties": {
            "empathy_score": {"type": "integer"},
            "professionalism_score": {"type": "integer"},
            "tone_feedback": {"type": "string"},
            "positive_indicators": {"type": "array", "items": {"type": "string"}},
            "negative_indicators": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["empathy_score", "professionalism_score", "tone_feedback", "positive_indicators", "negative_indicators"]
    }
    
    consolidation_schema = {
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
    
    # ═══ Construir prompts dos especialistas ═══
    
    technical_system = build_technical_audit_prompt(
        faq_context, checklist_section, common_mistakes_section, scoring_rules_section
    )
    empathy_system = build_empathy_audit_prompt()
    
    technical_prompt = f"""Conversa completa do atendimento a ser avaliada tecnicamente:
{history_str}

Avalie e retorne o JSON com as notas técnicas."""
    
    empathy_prompt = f"""Conversa completa do atendimento a ser avaliada quanto ao tom e empatia:
{history_str}

Avalie e retorne o JSON com as notas de empatia e profissionalismo."""
    
    # ═══ Fase 1: Executar os dois agentes especialistas em PARALELO ═══
    
    print("[Audit Engine] Fase 1: Disparando Agente Técnico + Agente de Empatia em paralelo...")
    
    async def run_technical():
        return await asyncio.to_thread(
            invoke_llm_json_fn, technical_prompt, technical_schema, technical_system
        )
    
    async def run_empathy():
        return await asyncio.to_thread(
            invoke_llm_json_fn, empathy_prompt, empathy_schema, empathy_system
        )
    
    try:
        technical_result, empathy_result = await asyncio.gather(
            run_technical(),
            run_empathy()
        )
    except Exception as e:
        print(f"[Audit Engine] Erro na Fase 1 (paralela): {e}")
        technical_result = {}
        empathy_result = {}
    
    # Validar resultados dos especialistas
    if not technical_result or "resolution_score" not in technical_result:
        print("[Audit Engine] Agente Técnico falhou. Usando defaults.")
        technical_result = {
            "resolution_score": 70,
            "agility_score": 75,
            "technical_feedback": "Avaliação técnica indisponível.",
            "points_covered": [],
            "points_missing": [],
            "mistakes_found": []
        }
    
    if not empathy_result or "empathy_score" not in empathy_result:
        print("[Audit Engine] Agente de Empatia falhou. Usando defaults.")
        empathy_result = {
            "empathy_score": 70,
            "professionalism_score": 75,
            "tone_feedback": "Avaliação de tom indisponível.",
            "positive_indicators": [],
            "negative_indicators": []
        }
    
    print(f"[Audit Engine] Fase 1 concluída — Técnico: {technical_result.get('resolution_score')}/100, Empatia: {empathy_result.get('empathy_score')}/100")
    
    # ═══ Fase 2: Consolidador final ═══
    
    print("[Audit Engine] Fase 2: Disparando Agente Consolidador...")
    
    consolidation_system = build_consolidation_audit_prompt(
        technical_result, empathy_result, goals, scenario_title
    )
    
    consolidation_prompt = f"""Com base nas análises dos dois especialistas acima, consolide o relatório final da auditoria.

Conversa original:
{history_str}

Retorne o JSON consolidado final."""
    
    try:
        consolidated = await asyncio.to_thread(
            invoke_llm_json_fn, consolidation_prompt, consolidation_schema, consolidation_system, "reasoning"
        )
    except Exception as e:
        print(f"[Audit Engine] Erro na Fase 2 (consolidação): {e}")
        consolidated = {}
    
    if not consolidated or "overall_score" not in consolidated:
        print("[Audit Engine] Consolidador falhou. Montando resultado manual.")
        res = technical_result.get("resolution_score", 70)
        emp = empathy_result.get("empathy_score", 70)
        pro = empathy_result.get("professionalism_score", 75)
        agi = technical_result.get("agility_score", 75)
        overall = int((res * 0.4) + (emp * 0.3) + (pro * 0.2) + (agi * 0.1))
        
        consolidated = {
            "overall_score": overall,
            "empathy_score": emp,
            "resolution_score": res,
            "professionalism_score": pro,
            "agility_score": agi,
            "feedback": f"{technical_result.get('technical_feedback', '')} {empathy_result.get('tone_feedback', '')}",
            "strengths": empathy_result.get("positive_indicators", ["Atendimento realizado"]),
            "improvements": [f"Ponto técnico faltando: {p}" for p in technical_result.get("points_missing", [])[:3]],
            "weak_areas": ["Resolução"] if res < 70 else (["Empatia"] if emp < 70 else ["Proatividade"]),
            "recommended_training_topics": ["Conhecimento de produto Yooga"]
        }
    
    print(f"[Audit Engine] Auditoria multi-agente concluída — Score Final: {consolidated.get('overall_score')}/100")
    return consolidated
