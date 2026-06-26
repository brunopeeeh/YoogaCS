import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Trophy } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UserPerformanceComparison({ simulations, users, certifications }) {
  const agents = users.filter(u => u.role !== 'admin');
  const userStats = agents.map(user => {
    // Filtrar simulações apenas deste usuário específico (Defesa de Case-Insensitivity e parsing JSON robusto)
    const userSimulations = simulations.filter(sim => {
      if (!sim.created_by || !user.email) return false;
      const isUser = sim.created_by.toLowerCase() === user.email.toLowerCase();
      const isDone = sim.status === 'concluida';
      
      let hasEval = false;
      if (sim.evaluation) {
        try {
          const evalObj = typeof sim.evaluation === 'string' ? JSON.parse(sim.evaluation) : sim.evaluation;
          hasEval = evalObj && typeof evalObj.overall_score !== 'undefined';
        } catch {
          hasEval = false;
        }
      }
      return isUser && isDone && hasEval;
    });

    const avgScore = userSimulations.length > 0
      ? Math.round(
          userSimulations.reduce((acc, sim) => {
            let score = 0;
            if (sim.evaluation) {
              try {
                const evalObj = typeof sim.evaluation === 'string' ? JSON.parse(sim.evaluation) : sim.evaluation;
                score = Number(evalObj.overall_score || 0);
              } catch {}
            }
            return acc + score;
          }, 0) / userSimulations.length
        )
      : 0;

    const userCerts = certifications.filter(c => c.created_by && user.email && c.created_by.toLowerCase() === user.email.toLowerCase());

    return {
      name: user.full_name || user.email.split('@')[0],
      email: user.email,
      simulations: userSimulations.length,
      avgScore,
      certsCount: userCerts.length,
      lastActivity: userSimulations.length > 0
        ? format(new Date(Math.max(...userSimulations.map(s => new Date(s.created_date)))), 'dd/MM/yyyy', { locale: ptBR })
        : 'Sem atividades'
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Ranking Gráfico */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Ranking de Performance de CS
          </CardTitle>
          <CardDescription>Pontuação média acumulada nas simulações de atendimento</CardDescription>
        </CardHeader>
        <CardContent>
          {userStats.length === 0 ? (
            <p className="text-slate-500 text-center py-12">Nenhum agente cadastrado no momento.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  className="text-slate-600 font-semibold text-xs"
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  className="text-slate-600 text-xs"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="avgScore" fill="#3b82f6" name="Pontuação Média" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Classificação da Equipe */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Trophy className="w-5 h-5 text-orange-500" />
            Classificação Geral Yooga CS
          </CardTitle>
          <CardDescription>Painel resumido dos analistas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {userStats.map((agent, index) => (
            <div key={agent.email} className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-white/40 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-800' : index === 1 ? 'bg-slate-200 text-slate-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-slate-900 truncate">{agent.name}</h5>
                  <p className="text-[10px] text-slate-500 font-medium">{agent.simulations} simulado(s) • {agent.certsCount} certificado(s)</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${agent.avgScore >= 80 ? 'bg-green-100 text-green-800' : agent.avgScore >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                {agent.avgScore}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
