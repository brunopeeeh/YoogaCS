import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PerformanceChart({ simulations }) {
  const chartData = simulations
    .slice(-10) // Últimas 10 simulações
    .map((sim, index) => ({
      session: `#${index + 1}`,
      overall: sim.evaluation.overall_score,
      empathy: sim.evaluation.empathy_score,
      resolution: sim.evaluation.resolution_score,
      professionalism: sim.evaluation.professionalism_score,
      agility: sim.evaluation.agility_score,
      date: format(new Date(sim.created_date), 'dd/MM', { locale: ptBR })
    }));

  const completedSims = simulations.filter(s => s.status === "concluida" && s.evaluation);
  const lastSim = completedSims[completedSims.length - 1];
  const totalSims = completedSims.length;

  const avgEmpathy = totalSims > 0 ? Math.round(completedSims.reduce((acc, s) => acc + s.evaluation.empathy_score, 0) / totalSims) : 0;
  const avgResolution = totalSims > 0 ? Math.round(completedSims.reduce((acc, s) => acc + s.evaluation.resolution_score, 0) / totalSims) : 0;
  const avgProfessionalism = totalSims > 0 ? Math.round(completedSims.reduce((acc, s) => acc + s.evaluation.professionalism_score, 0) / totalSims) : 0;
  const avgAgility = totalSims > 0 ? Math.round(completedSims.reduce((acc, s) => acc + s.evaluation.agility_score, 0) / totalSims) : 0;

  const radarData = [
    {
      subject: 'Empatia',
      'Última Simulação': lastSim ? lastSim.evaluation.empathy_score : 0,
      'Média Geral': avgEmpathy,
    },
    {
      subject: 'Resolução',
      'Última Simulação': lastSim ? lastSim.evaluation.resolution_score : 0,
      'Média Geral': avgResolution,
    },
    {
      subject: 'Profissionalismo',
      'Última Simulação': lastSim ? lastSim.evaluation.professionalism_score : 0,
      'Média Geral': avgProfessionalism,
    },
    {
      subject: 'Agilidade',
      'Última Simulação': lastSim ? lastSim.evaluation.agility_score : 0,
      'Média Geral': avgAgility,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Evolução da Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="session" 
                className="text-slate-600"
              />
              <YAxis 
                domain={[0, 100]}
                className="text-slate-600"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="overall" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Pontuação Geral"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle>Comparativo de Habilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.slice(-5)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="session" className="text-slate-600" />
                <YAxis domain={[0, 100]} className="text-slate-600" />
                <Tooltip />
                <Bar dataKey="empathy" fill="#10b981" name="Empatia" />
                <Bar dataKey="resolution" fill="#3b82f6" name="Resolução" />
                <Bar dataKey="professionalism" fill="#8b5cf6" name="Profissionalismo" />
                <Bar dataKey="agility" fill="#f59e0b" name="Agilidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {completedSims.length > 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>Última Simulação vs Média Histórica</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid className="opacity-40" />
                  <PolarAngleAxis dataKey="subject" className="text-xs font-semibold text-slate-700" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar 
                    name="Última" 
                    dataKey="Última Simulação" 
                    stroke="#FF6600" 
                    fill="#FF6600" 
                    fillOpacity={0.25} 
                  />
                  <Radar 
                    name="Média Geral" 
                    dataKey="Média Geral" 
                    stroke="#002D62" 
                    fill="#002D62" 
                    fillOpacity={0.15} 
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl flex items-center justify-center py-12">
            <p className="text-slate-500 text-sm">Realize simulações para ver o gráfico radar.</p>
          </Card>
        )}
      </div>
    </div>
  );
}