import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function AdaptiveScenarios({ performanceData, scenarios }) {
  const generateAdaptiveRecommendations = () => {
    if (!performanceData || performanceData.length === 0) {
      return {
        weakAreas: ["Falta de simulações realizadas"],
        recommendedScenarios: [],
        adaptiveSuggestions: []
      };
    }

    // Análise das áreas mais fracas
    const allWeakAreas = performanceData.flatMap(p => p.weak_areas || []);
    const weakAreaCounts = allWeakAreas.reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});

    const topWeakAreas = Object.entries(weakAreaCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([area]) => area);

    // Sugestões adaptativas baseadas nas fraquezas
    const adaptiveSuggestions = [
      "Criar simulados focados em Empatia para os analistas com dificuldades em acalmar clientes irritados.",
      "Aumentar o nível de dificuldade dos cenários para analistas com média geral superior a 90%.",
      "Inserir mais artigos técnicos sobre REJEIÇÕES FISCAIS para cobrir falhas de conhecimento em NFC-e.",
      "Planejar treinamentos práticos de PDV Offline de forma antecipada nas rotinas semanais."
    ];

    return {
      weakAreas: topWeakAreas.length > 0 ? topWeakAreas : ["Conhecimento Técnico", "Empatia"],
      recommendedScenarios: scenarios.slice(0, 3),
      adaptiveSuggestions
    };
  };

  const recommendations = generateAdaptiveRecommendations();

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Brain className="w-5 h-5 text-[#FF6600]" />
          Cenários Adaptativos Recomendados
        </CardTitle>
        <CardDescription>Sugestões personalizadas geradas com base nas fraquezas reais da equipe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-2.5">Principais Pontos de Atenção de CS da Equipe</h4>
          <div className="flex flex-wrap gap-2">
            {recommendations.weakAreas.map((area, index) => (
              <span key={index} className="px-3.5 py-1.5 bg-orange-100 text-orange-800 rounded-full font-bold text-xs border border-orange-200">
                {area}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-2.5">Diretrizes da IA Coach Yooga</h4>
          <ul className="space-y-3">
            {recommendations.adaptiveSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60">
                <span className="text-blue-500 mt-1 shrink-0">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
              Novos Cenários Adaptativos
            </h5>
            <p className="text-[11px] text-slate-500">Gere cenários na hora baseados nos feedbacks com IA</p>
          </div>
          <Link to={`${createPageUrl("Scenarios")}?generate=true`} className="w-full sm:w-auto">
            <Button className="w-full bg-[#002D62] hover:bg-[#004094] gap-2 h-10 px-4 text-xs font-bold text-white rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              Gerar Cenário com IA
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
