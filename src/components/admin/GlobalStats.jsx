import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Award, Trophy } from "lucide-react";

export default function GlobalStats({ simulations, users, scenarios, selectedAgentEmail, selectedAgentName, certifications, quizAttempts }) {
  const completedSimulations = simulations.filter(s => s.status === 'concluida');
  const averageScore = completedSimulations.length > 0
      ? Math.round(completedSimulations.reduce((acc, sim) => acc + (sim.evaluation?.overall_score || 0), 0) / completedSimulations.length)
      : 0;

  const isGlobalView = !selectedAgentEmail || selectedAgentEmail === 'all';

  // Contagem de certificados
  const filteredCerts = isGlobalView
    ? certifications
    : certifications.filter(c => c.created_by.toLowerCase() === selectedAgentEmail.toLowerCase());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            {isGlobalView ? "Agentes Ativos" : `Agente Selecionado`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-slate-900">
            {isGlobalView ? users.filter(u => u.role !== 'admin').length : selectedAgentName.split(' ')[0]}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {isGlobalView ? "Operadores no simulador" : selectedAgentEmail}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            Total de Simulações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-slate-900">{simulations.length}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{completedSimulations.length} concluídas e avaliadas</p>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-orange-500" />
            Trilhas & Certificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-orange-600">{filteredCerts.length}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Conquistas de {isGlobalView ? "toda a equipe" : "agente"}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#FF6600]" />
            Pontuação Média de CS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-green-600">{averageScore}%</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{isGlobalView ? "Média geral do time Yooga" : "Média do agente selecionado"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
