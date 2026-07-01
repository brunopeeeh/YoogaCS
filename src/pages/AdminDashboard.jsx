import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Simulation, User, Scenario, AgentPerformance } from "@/entities/all";
import { useUser } from "../components/auth/UserProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, TrendingUp, Brain, Filter, Download, Database, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Module, QuizAttempt, Certification, ensureKnowledgeReady } from "@/entities/Knowledge";
import { Button } from "@/components/ui/button";
import { exportIndividualPDF, exportConsolidatedPDF } from "@/utils/pdf-generator";

// Componentes Extraídos
import GlobalStats from "../components/admin/GlobalStats";
import UserPerformanceComparison from "../components/admin/UserPerformanceComparison";
import PerformanceTrends from "../components/admin/PerformanceTrends";
import AdaptiveScenarios from "../components/admin/AdaptiveScenarios";
import RagKnowledgeBase from "../components/admin/RagKnowledgeBase";
import ImprovementsEditor from "../components/admin/ImprovementsEditor";


export default function AdminDashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const [simulations, setSimulations] = useState([]);
  const [users, setUsers] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('all');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      await ensureKnowledgeReady();
      const [simData, userData, scenarioData, perfData, modulesData, quizAttemptsData, certificationsData] = await Promise.all([
        Simulation.list(),
        User.list(),
        Scenario.list(),
        AgentPerformance.list(),
        Module.list(),
        QuizAttempt.list(),
        Certification.list()
      ]);
      setSimulations(simData);
      setUsers(userData);
      setScenarios(scenarioData);
      setPerformanceData(perfData);
      setModules(modulesData);
      setQuizAttempts(quizAttemptsData);
      setCertifications(certificationsData);
    } catch (error) {
      console.error("Erro ao carregar dados de admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading) {
      if (user && user.role === 'admin') {
        loadAdminData();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isUserLoading]);

  if (isUserLoading) {
    return <div className="p-6 text-center text-lg text-slate-700">Verificando permissões...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <div className="p-6 text-center text-red-600 text-lg font-semibold">Acesso negado. Esta página é apenas para administradores.</div>;
  }

  const filteredSimulations = selectedAgent === 'all'
    ? simulations
    : simulations.filter(sim => sim.created_by === selectedAgent);

  const selectedAgentData = users.find(u => u.email === selectedAgent);
  const selectedAgentName = selectedAgentData?.full_name || selectedAgentData?.email.split('@')[0] || '';

  const handleExportPDF = () => {
    if (selectedAgent === 'all') {
      exportConsolidatedPDF(simulations, certifications, modules, users, performanceData);
    } else {
      const agentSims = simulations.filter(sim => sim.created_by === selectedAgent);
      const agentCerts = certifications.filter(c => c.created_by.toLowerCase() === selectedAgent.toLowerCase());
      const agentQuizzes = quizAttempts.filter(q => q.created_by.toLowerCase() === selectedAgent.toLowerCase());
      exportIndividualPDF(selectedAgentData, agentSims, scenarios, agentQuizzes, agentCerts);
    }
  };

  const headerActionsEl = typeof document !== 'undefined' ? document.getElementById('layout-header-actions') : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yooga-primary/5 p-6">
      {headerActionsEl && createPortal(
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Filtro de agentes */}
          <div className="flex items-center gap-2 bg-white/80 border border-slate-200/50 rounded-2xl px-3 py-1.5 shadow-sm backdrop-blur-sm shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-44 bg-transparent border-0 focus:ring-0 p-0 text-xs font-bold text-slate-700 h-7">
                <SelectValue placeholder="Filtrar por agente..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-lg border-slate-200/60">
                <SelectItem value="all">Todos os Agentes</SelectItem>
                {users.filter(u => u.role !== 'admin').map(userItem => (
                  <SelectItem key={userItem.id} value={userItem.email}>
                    {userItem.full_name || userItem.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão de Exportar PDF */}
          <Button
            onClick={handleExportPDF}
            disabled={isLoading || (selectedAgent !== 'all' && filteredSimulations.length === 0)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-11 px-5 font-bold shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 border-0 transition-all duration-300 grow sm:grow-0 shrink-0 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>{selectedAgent === 'all' ? "Exportar Relatório Mensal" : "Exportar 1:1 Analista"}</span>
          </Button>
        </div>,
        headerActionsEl
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6 bg-white/80 border border-slate-200/50 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2 rounded-xl py-2.5">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="clean-tab-trigger">
              <TrendingUp className="w-4 h-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="analytics" className="clean-tab-trigger">
              <Users className="w-4 h-4" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="adaptive" className="clean-tab-trigger">
              <Brain className="w-4 h-4" />
              IA Adaptativa
            </TabsTrigger>
            <TabsTrigger value="rag" className="clean-tab-trigger">
              <Database className="w-4 h-4" />
              Base RAG
            </TabsTrigger>
            <TabsTrigger value="improvements" className="gap-2 rounded-xl py-2.5">
              <Wrench className="w-4 h-4" />
              Melhorias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            {isLoading ? (
              <Skeleton className="h-40 w-full rounded-2xl" />
            ) : (
              <GlobalStats
                simulations={filteredSimulations}
                users={users}
                scenarios={scenarios}
                selectedAgentEmail={selectedAgent}
                selectedAgentName={selectedAgentName}
                certifications={certifications}
                quizAttempts={quizAttempts}
              />
            )}
            {isLoading ? (
              <Skeleton className="h-64 w-full rounded-2xl" />
            ) : (
              <UserPerformanceComparison
                simulations={simulations}
                users={users}
                certifications={certifications}
              />
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 outline-none">
            {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : <PerformanceTrends simulations={filteredSimulations} />}
            {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : <UserPerformanceComparison simulations={simulations} users={users} certifications={certifications} />}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 outline-none">
            {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : <UserPerformanceComparison simulations={simulations} users={users} certifications={certifications} />}
          </TabsContent>

          <TabsContent value="adaptive" className="space-y-6 outline-none">
            {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : <AdaptiveScenarios performanceData={performanceData} scenarios={scenarios} />}
          </TabsContent>

          <TabsContent value="rag" className="space-y-6 outline-none">
            <RagKnowledgeBase />
          </TabsContent>

          <TabsContent value="improvements" className="space-y-6 outline-none">
            <ImprovementsEditor simulations={simulations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
