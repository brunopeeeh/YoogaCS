import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import TranscriptModal from "./TranscriptModal";

export default function ScenarioPerformance({ simulations, scenarios, autoOpenSimulationId }) {
  const [expandedScenario, setExpandedScenario] = useState(null);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  React.useEffect(() => {
    if (autoOpenSimulationId) {
      const sim = simulations.find(s => s.id === autoOpenSimulationId);
      if (sim) {
        setExpandedScenario(sim.scenario_id);
        setSelectedSimulation(sim);
        setIsModalOpen(true);
      }
    }
  }, [autoOpenSimulationId, simulations]);

  const getScenarioStats = () => {
    const stats = {};
    
    simulations.forEach(sim => {
      const scenarioId = sim.scenario_id;
      if (!stats[scenarioId]) {
        stats[scenarioId] = {
          count: 0,
          totalScore: 0,
          scenario: scenarios.find(s => s.id === scenarioId)
        };
      }
      stats[scenarioId].count += 1;
      stats[scenarioId].totalScore += sim.evaluation?.overall_score ?? 0;
    });
    
    return Object.values(stats).map(stat => ({
      ...stat,
      averageScore: Math.round(stat.totalScore / stat.count)
    })).sort((a, b) => b.count - a.count);
  };

  const scenarioStats = getScenarioStats();

  const difficultyColors = {
    "iniciante": "bg-green-100 text-green-800",
    "intermediario": "bg-yellow-100 text-yellow-800",
    "avançado": "bg-red-100 text-red-800",
    "avancado": "bg-red-100 text-red-800"
  };

  const profileColors = {
    "irritado": "bg-red-100 text-red-800",
    "confuso": "bg-yellow-100 text-yellow-800",
    "objetivo": "bg-blue-100 text-blue-800",
    "indeciso": "bg-slate-100 text-slate-800",
    "emotivo": "bg-pink-100 text-pink-800",
    "impaciente": "bg-orange-100 text-orange-800",
    "detalhista": "bg-green-100 text-green-800"
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          Performance por Cenário
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scenarioStats.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            Nenhum dado disponível
          </p>
        ) : (
          <div className="space-y-6">
            {scenarioStats.map((stat, index) => {
              const scenario = stat.scenario;
              if (!scenario) return null;
              
              const isExpanded = expandedScenario === scenario.id;
              const scenarioSims = simulations.filter(sim => sim.scenario_id === scenario.id && sim.status === 'concluida');

              return (
                <div key={index} className="p-4 rounded-xl border border-slate-200 bg-white/40 shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-900 mb-2 leading-snug">
                        {scenario.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${difficultyColors[scenario.difficulty_level]}`}>
                          {scenario.difficulty_level}
                        </Badge>
                        <Badge className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 ${profileColors[scenario.client_profile]}`}>
                          {scenario.client_profile}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-slate-900">
                        {stat.averageScore}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {stat.count} simulação{stat.count !== 1 ? 'ões' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={stat.averageScore} className="h-2 rounded-full" />
                  
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                    <span>Performance média</span>
                    <span className={stat.averageScore >= 80 ? 'text-green-600 font-bold' : stat.averageScore >= 60 ? 'text-blue-600 font-bold' : 'text-slate-600 font-bold'}>
                      {stat.averageScore >= 80 ? 'Excelente' : 
                       stat.averageScore >= 60 ? 'Bom' : 'Precisa melhorar'}
                    </span>
                  </div>

                  {/* Lista de Simulações Expandível */}
                  {scenarioSims.length > 0 && (
                    <div className="mt-4 border-t border-slate-200/50 pt-3">
                      <button
                        onClick={() => setExpandedScenario(isExpanded ? null : scenario.id)}
                        className="text-[11px] font-bold text-slate-500 flex items-center gap-1 hover:text-slate-800 transition-colors border-0 bg-transparent cursor-pointer p-0"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Ocultar Histórico de Simulações
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Ver Histórico de Simulações ({scenarioSims.length})
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {scenarioSims.map((sim, sIdx) => {
                            const simDate = new Date(sim.created_date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            });
                            const hasMessages = sim.messages && sim.messages.length > 0;

                            return (
                              <div key={sim.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white/50 hover:bg-slate-50 transition-colors">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-850">
                                      Tentativa #{scenarioSims.length - sIdx}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${sim.evaluation?.overall_score >= 80 ? "bg-green-50 text-green-700" : sim.evaluation?.overall_score >= 60 ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                                      {sim.evaluation?.overall_score ?? 0}%
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-slate-450 font-medium">
                                    <span className="flex items-center gap-0.5">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {simDate}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {sim.duration_minutes || 0} min
                                    </span>
                                  </div>
                                </div>

                                {hasMessages && (
                                  <button
                                    onClick={() => {
                                      setSelectedSimulation(sim);
                                      setIsModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 bg-[#002D62] hover:bg-[#004094] text-white rounded-lg font-bold text-[10px] flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all border-0 cursor-pointer shadow-sm shadow-blue-900/10"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    Ver Transcrição
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <TranscriptModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSimulation(null);
        }}
        simulation={selectedSimulation}
        scenarioName={selectedSimulation ? scenarios.find(s => s.id === selectedSimulation.scenario_id)?.title : ""}
      />
    </Card>
  );
}