import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ScenarioPerformance({ simulations, scenarios }) {
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
      stats[scenarioId].totalScore += sim.evaluation.overall_score;
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
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
      <CardHeader>
        <CardTitle>Performance por Cenário</CardTitle>
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
              
              return (
                <div key={index} className="p-4 rounded-lg border border-slate-200 bg-white/40">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {scenario.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={difficultyColors[scenario.difficulty_level]}>
                          {scenario.difficulty_level}
                        </Badge>
                        <Badge className={profileColors[scenario.client_profile]}>
                          {scenario.client_profile}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        {stat.averageScore}%
                      </div>
                      <div className="text-sm text-slate-500">
                        {stat.count} simulação{stat.count !== 1 ? 'ões' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={stat.averageScore} className="h-2" />
                  
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Performance média</span>
                    <span>
                      {stat.averageScore >= 80 ? 'Excelente' : 
                       stat.averageScore >= 60 ? 'Bom' : 'Precisa melhorar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}