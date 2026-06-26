import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function DetailedStats({ simulations }) {
  if (simulations.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle>Estatísticas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">
            Nenhuma simulação concluída ainda
          </p>
        </CardContent>
      </Card>
    );
  }

  const getAverageScore = (field) => {
    return Math.round(simulations.reduce((acc, sim) => acc + sim.evaluation[field], 0) / simulations.length);
  };

  const getTrend = (field) => {
    if (simulations.length < 2) return 0;
    const recent = simulations.slice(-3);
    const older = simulations.slice(-6, -3);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((acc, sim) => acc + sim.evaluation[field], 0) / recent.length;
    const olderAvg = older.reduce((acc, sim) => acc + sim.evaluation[field], 0) / older.length;
    
    return recentAvg - olderAvg;
  };

  const renderTrendIcon = (trend) => {
    if (trend > 2) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < -2) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const skills = [
    { key: 'empathy_score', label: 'Empatia' },
    { key: 'resolution_score', label: 'Resolução de Problemas' },
    { key: 'professionalism_score', label: 'Profissionalismo' },
    { key: 'agility_score', label: 'Agilidade' }
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
      <CardHeader>
        <CardTitle>Estatísticas Detalhadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {skills.map((skill) => {
            const average = getAverageScore(skill.key);
            const trend = getTrend(skill.key);
            
            return (
              <div key={skill.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">{skill.label}</span>
                  <div className="flex items-center gap-2">
                    {renderTrendIcon(trend)}
                    <span className="font-bold text-lg">{average}%</span>
                  </div>
                </div>
                <Progress value={average} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Desempenho médio</span>
                  <span>{trend > 0 ? '+' : ''}{Math.round(trend)}% tendência</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}