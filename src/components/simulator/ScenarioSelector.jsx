
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Play, User, MessageSquare, ChevronLeft } from "lucide-react";

const profileColors = {
  "irritado": "bg-red-100 text-red-800",
  "confuso": "bg-yellow-100 text-yellow-800",
  "objetivo": "bg-blue-100 text-blue-800",
  "indeciso": "bg-sky-100 text-sky-800",
  "emotivo": "bg-pink-100 text-pink-800",
  "impaciente": "bg-orange-100 text-orange-800",
  "detalhista": "bg-green-100 text-green-800"
};

const difficultyColors = {
  "iniciante": "bg-green-100 text-green-800",
  "intermediario": "bg-yellow-100 text-yellow-800",
  "avançado": "bg-red-100 text-red-800"
};

export default function ScenarioSelector({ 
  scenarios, 
  selectedScenario, 
  onScenarioSelect, 
  agentName, 
  onStartSimulation,
  modules = []
}) {
  const canStart = selectedScenario && agentName.trim();

  // Modo Focado: Se houver um cenário selecionado, exibe apenas a tela de foco dele
  if (selectedScenario) {
    const scenarioModule = modules.find(m => m.id === selectedScenario.moduleId);
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Card Focado do Cenário */}
        <Card className="bg-white/70 backdrop-blur-md border-slate-200/80 rounded-2xl shadow-xl overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="bg-gradient-to-b from-slate-50/50 to-transparent pb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {scenarioModule && (
                <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold rounded-lg">
                  Trilha: {scenarioModule.name}
                </Badge>
              )}
              <Badge className={`${profileColors[selectedScenario.client_profile] || 'bg-slate-100 text-slate-700'} rounded-lg font-medium`}>
                Cliente {selectedScenario.client_profile}
              </Badge>
              <Badge className={`${difficultyColors[selectedScenario.difficulty_level] || 'bg-slate-100 text-slate-700'} rounded-lg font-medium`}>
                Dificuldade: {selectedScenario.difficulty_level}
              </Badge>
              {selectedScenario.expected_interactions && (
                <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 bg-white">
                  ~{selectedScenario.expected_interactions} interações
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {selectedScenario.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedScenario.description && (
              <p className="text-slate-600 text-base leading-relaxed">
                {selectedScenario.description}
              </p>
            )}

            <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/25 p-5 rounded-2xl">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Contexto Inicial do Cliente</span>
              <p className="text-slate-800 text-base font-medium leading-relaxed">
                "{selectedScenario.initial_problem}"
              </p>
            </div>

            {selectedScenario.goals && selectedScenario.goals.length > 0 && (
              <div className="space-y-3 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Objetivos e Critérios de Sucesso</span>
                <ul className="grid grid-cols-1 gap-2.5">
                  {selectedScenario.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-700 leading-relaxed text-sm">
                      <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação na altura dos olhos */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            onClick={() => onScenarioSelect(null)}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-14 px-8 text-base gap-2.5 rounded-2xl border-slate-200 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer font-semibold order-2 sm:order-1"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
            Escolher outro cenário
          </Button>

          <Button
            onClick={onStartSimulation}
            size="lg"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-14 px-10 text-lg gap-3 rounded-2xl shadow-lg shadow-emerald-600/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer text-white font-semibold order-1 sm:order-2"
          >
            <Play className="w-5.5 h-5.5 text-white fill-white" />
            Iniciar Simulação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Agent Info */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <User className="w-5 h-5 text-primary" />
          Agente em Treinamento
        </CardTitle>
      </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="agent-name" className="text-slate-700 font-medium">Nome do Agente</Label>
            <Input
              id="agent-name"
              value={agentName}
              placeholder="Nome será carregado automaticamente..."
              className="h-12 bg-slate-100 text-slate-700 border-slate-200/60 rounded-xl"
              disabled={true} // Nome não pode ser editado
            />
            <p className="text-xs text-slate-400">
              Nome obtido automaticamente da sua conta Google
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-2xl shadow-sm">
        <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <MessageSquare className="w-5 h-5 text-primary" />
          Escolha um Cenário de Treinamento
        </CardTitle>
      </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Nenhum cenário disponível
              </h3>
              <p className="text-slate-500">
                Crie alguns cenários primeiro para começar o treinamento
              </p>
            </div>
          ) : (
            <RadioGroup 
              value={selectedScenario?.id || ""} 
              onValueChange={(value) => {
                const scenario = scenarios.find(s => s.id === value);
                onScenarioSelect(scenario);
              }}
              className="space-y-4"
            >
              {scenarios.map((scenario) => {
                const isSelected = selectedScenario?.id === scenario.id;
                return (
                  <div 
                    key={scenario.id} 
                    onClick={() => {
                      const found = scenarios.find(s => s.id === scenario.id);
                      onScenarioSelect(found);
                    }}
                    className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:scale-[1.005] active:scale-[0.995] bg-white/40 hover:bg-white/90 ${
                      isSelected 
                        ? 'border-primary shadow-sm bg-gradient-to-tr from-white to-primary/15 shadow-primary/10' 
                        : 'border-slate-200/60 hover:border-slate-300'
                    }`}
                  >
                    <RadioGroupItem 
                      value={scenario.id} 
                      id={scenario.id}
                      className="mt-1 border-slate-300 text-primary focus:ring-primary"
                      checked={isSelected}
                    />
                    <div className="flex-1 space-y-2.5">
                      <Label 
                        htmlFor={scenario.id}
                        className="text-base font-semibold text-slate-900 cursor-pointer block"
                        onClick={(e) => e.preventDefault()} // Evita duplo evento com a div
                      >
                        {scenario.title}
                      </Label>
                      
                      {scenario.description && (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {scenario.description}
                        </p>
                      )}
                      
                      {(() => {
                        const scenarioModule = modules.find(m => m.id === scenario.moduleId);
                        return (
                          <div className="flex flex-wrap gap-2">
                            {scenarioModule && (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-semibold rounded-lg">
                                Trilha: {scenarioModule.name}
                              </Badge>
                            )}
                            <Badge className={`${profileColors[scenario.client_profile] || 'bg-slate-100 text-slate-700'} rounded-lg`}>
                              Cliente {scenario.client_profile}
                            </Badge>
                            <Badge className={`${difficultyColors[scenario.difficulty_level] || 'bg-slate-100 text-slate-700'} rounded-lg`}>
                              {scenario.difficulty_level}
                            </Badge>
                            {scenario.expected_interactions && (
                              <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 bg-white">
                                ~{scenario.expected_interactions} interações
                              </Badge>
                            )}
                          </div>
                        );
                      })()}
                      
                      <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl mt-2">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          <strong className="text-slate-900">Situação inicial:</strong> {scenario.initial_problem}
                        </p>
                      </div>

                      {scenario.goals && scenario.goals.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Objetivos:</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {scenario.goals.map((goal, index) => (
                              <li key={index} className="flex items-start gap-2 leading-relaxed">
                                <span className="text-yooga-accent mt-1.5 w-1.5 h-1.5 rounded-full bg-yooga-accent flex-shrink-0" />
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center py-4">
        <p className="text-sm text-slate-400">
          Selecione um cenário acima para iniciar seu treinamento de Customer Success
        </p>
      </div>
    </div>
  );
}
