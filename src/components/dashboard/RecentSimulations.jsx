import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Clock, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  "em_andamento": "bg-blue-100 text-blue-800",
  "concluida": "bg-green-100 text-green-800", 
  "abandonada": "bg-red-100 text-red-800"
};

const statusLabels = {
  "em_andamento": "Em Andamento",
  "concluida": "Concluída",
  "abandonada": "Abandonada"
};

export default function RecentSimulations({ simulations, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Simulações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <MessageSquare className="w-6 h-6" />
          Simulações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {simulations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500">Nenhuma simulação realizada ainda</p>
            <p className="text-sm text-slate-400">Inicie sua primeira simulação para ver os resultados aqui</p>
          </div>
        ) : (
          <div className="space-y-4">
            {simulations.map((simulation) => (
              <div key={simulation.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 bg-white/40 hover:bg-white/60 transition-all duration-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    {simulation.agent_name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(simulation.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    {simulation.evaluation && (
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {simulation.evaluation.overall_score}% de pontuação
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[simulation.status]}>
                    {statusLabels[simulation.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}