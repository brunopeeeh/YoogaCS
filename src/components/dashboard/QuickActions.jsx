
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, BookOpen, Zap, ArrowRight, Sparkles } from "lucide-react";

const profileColors = {
  "irritado": "bg-red-100 text-red-800",
  "confuso": "bg-yellow-100 text-yellow-800",
  "objetivo": "bg-blue-100 text-blue-800",
  "indeciso": "bg-slate-100 text-slate-800",
  "emotivo": "bg-pink-100 text-pink-800",
  "impaciente": "bg-orange-100 text-orange-800",
  "detalhista": "bg-green-100 text-green-800"
};

const difficultyColors = {
  "iniciante": "bg-green-100 text-green-800",
  "intermediario": "bg-yellow-100 text-yellow-800",
  "avançado": "bg-red-100 text-red-800",
  "avancado": "bg-red-100 text-red-800"
};

export default function QuickActions({ scenarios, onRefresh, userRole }) {
  const activeScenarios = scenarios.filter(s => s.status === "ativo").slice(0, 3);
  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to={createPageUrl("Simulator")}>
            <Button className="w-full justify-between bg-gradient-to-r from-yooga-primary to-yooga-primary-dark hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-white">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Nova Simulação
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          
          <Link to={createPageUrl("Scenarios")}>
            <Button variant="outline" className="w-full justify-between hover:scale-[1.01] active:scale-[0.99] transition-all">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {isAdmin ? "Gerenciar Cenários" : "Explorar Cenários"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
 
          {isAdmin && (
            <Link to={`${createPageUrl("Scenarios")}?generate=true`}>
              <Button variant="outline" className="w-full justify-between border-purple-200 hover:bg-purple-50/50 hover:text-yooga-primary text-slate-700 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer">
                <span className="flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4 text-yooga-accent" />
                  Gerar Cenário com IA
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
 
      {/* Featured Scenarios */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Cenários em Destaque
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeScenarios.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">Nenhum cenário ativo</p>
              <Link to={createPageUrl("Scenarios")}>
                <Button variant="link" className="text-yooga-primary p-0 h-auto">
                  Criar primeiro cenário
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeScenarios.map((scenario) => (
                <div key={scenario.id} className="p-3 rounded-lg border border-slate-200/60 bg-white/40">
                  <h4 className="font-medium text-slate-900 text-sm mb-2">
                    {scenario.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge className={`text-xs ${profileColors[scenario.client_profile]}`}>
                      {scenario.client_profile}
                    </Badge>
                    <Badge className={`text-xs ${difficultyColors[scenario.difficulty_level]}`}>
                      {scenario.difficulty_level}
                    </Badge>
                  </div>
                  <Link to={`${createPageUrl("Simulator")}?scenario=${scenario.id}`}>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Praticar Agora
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
