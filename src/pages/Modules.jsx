import React, { useState, useEffect } from "react";
import { Module, QuizAttempt, Certification, ensureKnowledgeReady } from "@/entities/Knowledge";
import { useUser } from "../components/auth/UserProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Clock, ArrowRight, PlayCircle, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Modules() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModulesAndProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        await ensureKnowledgeReady();
        const [modulesData, attemptsData, certsData] = await Promise.all([
          Module.list(),
          QuizAttempt.list(), // Listar todas e filtrar localmente para consistência
          Certification.list()
        ]);

        // Filtrar tentativas e certificações do usuário ativo
        const userAttempts = attemptsData.filter(a => a.created_by.toLowerCase() === user.email.toLowerCase());
        const userCerts = certsData.filter(c => c.created_by.toLowerCase() === user.email.toLowerCase());

        setModules(modulesData);
        setAttempts(userAttempts);
        setCertifications(userCerts);
      } catch (error) {
        console.error("Erro ao carregar trilhas:", error);
      }
      setIsLoading(false);
    };

    loadModulesAndProgress();
  }, [user]);

  const getModuleStatus = (moduleId) => {
    // Verificar se o agente possui certificação para este módulo
    const isCertified = certifications.some(c => c.moduleId === moduleId);
    if (isCertified) {
      const cert = certifications.find(c => c.moduleId === moduleId);
      return { status: "certified", badge: "Certificado", color: "bg-green-100 text-green-800 border-green-200", score: cert.score };
    }

    // Verificar se o agente já tentou fazer o quiz desse módulo
    const moduleAttempts = attempts.filter(a => a.moduleId === moduleId);
    if (moduleAttempts.length > 0) {
      const bestAttempt = Math.max(...moduleAttempts.map(a => a.score));
      return { status: "in_progress", badge: "Em Progresso", color: "bg-blue-100 text-blue-800 border-blue-200", bestScore: bestAttempt };
    }

    return { status: "not_started", badge: "Não Iniciado", color: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  const getModuleGradients = (index) => {
    const gradients = [
      "from-[#002D62] to-[#004094]",
      "from-orange-500 to-amber-600",
      "from-[#FF6600] to-[#FF8533]",
      "from-teal-500 to-emerald-600",
      "from-rose-500 to-red-600"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner do Cabeçalho */}
        <div className="bg-gradient-to-r from-slate-900 via-[#002D62] to-slate-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF6600]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Trilhas de Aprendizado</h1>
              <p className="text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
                Estude os principais tópicos da nossa central de ajuda do FAQ Yooga, realize os quizzes de validação e conquiste suas certificações de especialista!
              </p>
            </div>
            
            <div className="flex gap-4 items-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10">
              <Trophy className="w-10 h-10 text-amber-400 shrink-0" />
              <div>
                <div className="text-2xl font-bold text-white">{certifications.length}</div>
                <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">Certificações Ganhas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Listagem de Módulos */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Trilhas de Treinamento Disponíveis
          </h2>

          {isLoading ? (
            <div className="text-center py-12 text-slate-500">
              Carregando módulos da Yooga...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module, idx) => {
                const state = getModuleStatus(module.id);
                const gradient = getModuleGradients(idx);

                return (
                  <Card key={module.id} className="bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between rounded-2xl overflow-hidden">
                    
                    {/* Topo do Card com Cor Temática */}
                    <div className={`h-2.5 bg-gradient-to-r ${gradient}`}></div>
                    
                    <CardHeader className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <Badge variant="outline" className={`font-semibold rounded-lg px-2.5 py-0.5 border ${state.color}`}>
                          {state.badge}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{module.estimated_time || "30 min"}</span>
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1">
                        {module.name}
                      </CardTitle>
                      
                      <CardDescription className="text-slate-600 text-sm leading-relaxed mt-2 line-clamp-3">
                        {module.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0 flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                      {/* Mostrar pontuação se tiver tentativas */}
                      {state.status === "certified" && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span>Módulo certificado com aproveitamento de {state.score}%!</span>
                        </div>
                      )}
                      {state.status === "in_progress" && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Melhor pontuação atual: {state.bestScore}% (Meta: 80%)</span>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-2">
                        {state.status === "certified" ? (
                          <Button 
                            variant="outline" 
                            onClick={() => navigate(`/ModuleStudy?id=${module.id}`)}
                            className="w-full sm:w-auto border-green-200 hover:bg-green-50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-green-700 rounded-xl gap-2 font-medium cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Revisar Trilha
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => navigate(`/ModuleStudy?id=${module.id}`)}
                            className={`w-full sm:w-auto bg-gradient-to-r ${gradient} hover:opacity-90 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-white rounded-xl gap-2 font-semibold shadow-md cursor-pointer`}
                          >
                            <PlayCircle className="w-4 h-4" />
                            {state.status === "in_progress" ? "Continuar Trilha" : "Iniciar Trilha"}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>

                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
