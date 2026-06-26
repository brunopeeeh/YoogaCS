import React, { useState, useEffect } from "react";
import { Simulation, Scenario } from "@/entities/all";
import { useUser } from "../components/auth/UserProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Award, Calendar, CheckCircle2, Trophy, Clock, HelpCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Module, QuizAttempt, Certification, ensureKnowledgeReady } from "@/entities/Knowledge";
import { exportIndividualPDF } from "@/utils/pdf-generator";

import PerformanceChart from "../components/reports/PerformanceChart";
import DetailedStats from "../components/reports/DetailedStats";
import ScenarioPerformance from "../components/reports/ScenarioPerformance";

export default function Reports() {
  const { user, isLoading: isUserLoading } = useUser();
  const [simulations, setSimulations] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [autoOpenSimId, setAutoOpenSimId] = useState(null);

  useEffect(() => {
    if (!isLoading && simulations.length > 0) {
      const openId = sessionStorage.getItem("yooga_open_transcript_id");
      if (openId) {
        setActiveTab("scenarios");
        setAutoOpenSimId(openId);
        sessionStorage.removeItem("yooga_open_transcript_id");
      }
    }
  }, [isLoading, simulations]);

  useEffect(() => {
    if (user) {
      loadData(user.email);
    } else if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  const loadData = async (userEmail) => {
    setIsLoading(true);
    try {
      await ensureKnowledgeReady();
      const [simulationsData, scenariosData, modulesData, quizAttemptsData, certificationsData] = await Promise.all([
        Simulation.filter({ created_by: userEmail }, "-created_date"),
        Scenario.list("-created_date"),
        Module.list(),
        QuizAttempt.filter({ created_by: userEmail }, "-created_date"),
        Certification.filter({ created_by: userEmail }, "-created_date")
      ]);
      
      setSimulations(simulationsData);
      setScenarios(scenariosData);
      setModules(modulesData);
      setQuizAttempts(quizAttemptsData);
      setCertifications(certificationsData);
    } catch (error) {
      console.error("Erro ao carregar dados do relatório:", error);
      setSimulations([]);
      setScenarios([]);
      setModules([]);
      setQuizAttempts([]);
      setCertifications([]);
    }
    setIsLoading(false);
  };

  const completedSimulations = simulations.filter(s => s.status === "concluida" && s.evaluation);

  const handleExportPDF = () => {
    if (!user) return;
    exportIndividualPDF(user, simulations, scenarios, quizAttempts, certifications);
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="w-12 h-12 border-4 border-yooga-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-slate-700">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header com botão de Exportar PDF */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Meus Relatórios de Performance
            </h1>
            <p className="text-slate-600 mt-1">
              Acompanhe sua evolução, quizzes finalizados e certificações de Customer Success.
            </p>
            {user && (
              <p className="text-sm font-medium text-slate-500 mt-1">
                Relatório de: {user.full_name || user.email}
              </p>
            )}
          </div>
          
          <Button 
            onClick={handleExportPDF} 
            disabled={completedSimulations.length === 0 && quizAttempts.length === 0}
            className="bg-yooga-accent hover:bg-yooga-accent/90 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-yooga-accent/10 flex items-center gap-2 border-0 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Relatório PDF</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white/80 border border-slate-200/50 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2 rounded-xl py-2.5">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 rounded-xl py-2.5">
              <TrendingUp className="w-4 h-4" />
              Evolução & Gráficos
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2 rounded-xl py-2.5">
              <Trophy className="w-4 h-4" />
              Trilhas & Quizzes
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="gap-2 rounded-xl py-2.5">
              <Award className="w-4 h-4" />
              Por Cenário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-yooga-primary" />
                    Minhas Simulações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {simulations.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    {completedSimulations.length} concluídas e avaliadas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yooga-secondary" />
                    Nota Média de CS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-yooga-secondary">
                    {completedSimulations.length > 0 
                      ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.overall_score, 0) / completedSimulations.length)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Desempenho geral nos simulados
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-yooga-accent" />
                    Quizzes Realizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-yooga-accent">
                    {quizAttempts.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Testes de conhecimento efetuados
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-yooga-accent" />
                    Módulos Certificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-yooga-accent">
                    {certifications.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Aproveitamento técnico ≥ 80%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DetailedStats simulations={completedSimulations} />
              </div>
              <div className="space-y-6">
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yooga-accent" />
                      Certificações Ativas
                    </CardTitle>
                    <CardDescription>Trilhas de conhecimento Yooga concluídas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {certifications.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-slate-500 text-sm">Nenhuma certificação ainda.</p>
                        <p className="text-xs text-slate-400 mt-1">Conclua quizzes com nota ≥ 80% para conquistar.</p>
                      </div>
                    ) : (
                      certifications.map((cert) => (
                        <div key={cert.id} className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-green-50/30">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-yooga-secondary shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-slate-950 truncate">{cert.moduleName}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Nota: {cert.score}% • {new Date(cert.created_date).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 outline-none">
            <PerformanceChart simulations={completedSimulations} />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Card de Certificações Detalhadas */}
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yooga-accent" />
                    Selo Oficial Yooga CS
                  </CardTitle>
                  <CardDescription>Módulos de suporte técnico concluídos com aproveitamento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {certifications.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="font-semibold text-slate-800">Nenhum certificado emitido</h3>
                      <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Estude os materiais e passe nas avaliações teóricas dos módulos para garantir seu selo oficial!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="p-4 rounded-2xl border-2 border-green-500/20 bg-green-50/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-yooga-secondary translate-x-2.5 -translate-y-2.5" />
                          </div>
                          <div className="text-xs font-bold text-green-700 tracking-wider uppercase mb-1.5">Certificado</div>
                          <h4 className="font-extrabold text-sm text-slate-900 mb-1 leading-snug">{cert.moduleName}</h4>
                          <p className="text-xs text-slate-500">Nota: <strong className="text-green-700">{cert.score}%</strong></p>
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(cert.created_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabela de Histórico de Quizzes */}
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-yooga-accent" />
                    Histórico de Quizzes Efetuados
                  </CardTitle>
                  <CardDescription>Lista completa de tentativas de validação teórica</CardDescription>
                </CardHeader>
                <CardContent>
                  {quizAttempts.length === 0 ? (
                    <div className="text-center py-12">
                      <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">Você ainda não realizou nenhum quiz de trilha.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs text-slate-500 font-semibold bg-slate-50/50">
                            <th className="py-2.5 px-3">Trilha / Módulo</th>
                            <th className="py-2.5 px-3 text-center">Score</th>
                            <th className="py-2.5 px-3 text-center">Aproveitamento</th>
                            <th className="py-2.5 px-3">Data</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {quizAttempts.map((attempt) => {
                            const mod = modules.find(m => m.id === attempt.moduleId);
                            const name = mod ? mod.name : "Módulo";
                            const isApproved = attempt.score >= 80;
                            return (
                              <tr key={attempt.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="py-3 px-3 font-semibold text-slate-900">{name}</td>
                                <td className="py-3 px-3 text-center font-medium text-slate-700">{attempt.correctAnswers}/{attempt.totalQuestions}</td>
                                <td className="py-3 px-3 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {attempt.score}% {isApproved ? '✓' : '✗'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-500 text-xs">{new Date(attempt.created_date).toLocaleDateString('pt-BR')}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6 outline-none">
            <ScenarioPerformance 
              simulations={completedSimulations}
              scenarios={scenarios}
              autoOpenSimulationId={autoOpenSimId}
            />
          </TabsContent>
        </Tabs>

        {completedSimulations.length === 0 && quizAttempts.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-sm mt-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Seu painel está pronto!
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-sm">
              Realize sua primeira simulação de atendimento ou responda a um quiz da trilha para gerar dados de performance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
