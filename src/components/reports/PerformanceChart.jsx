import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
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

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
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
    </div>
  );
}