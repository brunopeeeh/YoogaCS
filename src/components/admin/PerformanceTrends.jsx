import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PerformanceTrends({ simulations }) {
  // Dados dos últimos 30 dias
  const last30Days = Array.from({length: 30}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const trendData = last30Days.map(date => {
    const daySimulations = simulations.filter(sim => {
      const simDate = new Date(sim.created_date);
      return simDate.toDateString() === date.toDateString() &&
             sim.status === 'concluida' &&
             sim.evaluation;
    });

    const avgScore = daySimulations.length > 0
      ? Math.round(daySimulations.reduce((acc, sim) => acc + sim.evaluation.overall_score, 0) / daySimulations.length)
      : null;

    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      avgScore,
      count: daySimulations.length
    };
  }).filter(day => day.avgScore !== null);

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Tendência de Performance (Últimos 30 dias)
        </CardTitle>
        <CardDescription>Média de qualidade diária nos simulados de atendimento</CardDescription>
      </CardHeader>
      <CardContent>
        {trendData.length === 0 ? (
          <p className="text-slate-500 text-center py-12">Sem dados de simulações concluídas nos últimos 30 dias.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-slate-600 text-xs" />
              <YAxis domain={[0, 100]} className="text-slate-600 text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#10b981"
                strokeWidth={3.5}
                name="Pontuação Média"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
