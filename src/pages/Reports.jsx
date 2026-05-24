import React, { useState, useEffect } from "react";
import { Simulation, Scenario } from "@/entities/all";
import { useUser } from "../components/auth/UserProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Award, Calendar, CheckCircle2, Trophy, Clock, HelpCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Module, QuizAttempt, Certification, ensureKnowledgeReady } from "@/entities/Knowledge";
import { jsPDF } from "jspdf";

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

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = [0, 45, 98]; // #002D62 (Deep Blue Yooga)
    const secondaryColor = [255, 102, 0]; // #FF6600 (Orange Yooga)
    const grayText = [100, 116, 139]; // Slate 500
    const darkText = [15, 23, 42]; // Slate 900
    
    // 1. Cabeçalho Colorido
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 42, "F");
    
    // Linha decorativa Laranja
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 42, 210, 2, "F");
    
    // Texto do Cabeçalho
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("YOOGA CS COACH", 15, 18);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("PLATAFORMA INTERATIVA DE TREINAMENTO DE CUSTOMER SUCCESS", 15, 25);
    
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    doc.text(`Emissão: ${formattedDate} às ${formattedTime}`, 145, 25);
    
    // 2. Título do Relatório
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RELATÓRIO INDIVIDUAL DE PERFORMANCE - AGENTE DE CS", 15, 54);
    
    // Informações do Usuário
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayText);
    doc.text("Nome do Colaborador:", 15, 62);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkText);
    doc.text(user.full_name || "Agente Yooga", 50, 62);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayText);
    doc.text("E-mail corporativo:", 15, 67);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkText);
    doc.text(user.email, 50, 67);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayText);
    doc.text("Status de Capacitação:", 15, 72);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Verde
    doc.text(certifications.length > 0 ? `${certifications.length} Módulo(s) Certificado(s) Yooga` : "Em processo de capacitação", 50, 72);

    // 3. Grid de Métricas Consolidadas (Cards)
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setFillColor(248, 250, 252); // Slate 50
    
    // Card 1: Simulações
    doc.rect(15, 80, 42, 20, "FD");
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("SIMULAÇÕES", 18, 85);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...darkText);
    doc.text(`${simulations.length}`, 18, 93);
    
    // Card 2: Nota Média Simulações
    doc.rect(62, 80, 42, 20, "FD");
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("NOTA MÉDIA SIMUL.", 65, 85);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const avgScoreSim = completedSimulations.length > 0 
      ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.overall_score, 0) / completedSimulations.length)
      : 0;
    doc.setTextColor(16, 185, 129); // verde
    doc.text(`${avgScoreSim}%`, 65, 93);
    
    // Card 3: Quizzes Concluídos
    doc.rect(109, 80, 42, 20, "FD");
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("QUIZZES FEITOS", 112, 85);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...darkText);
    doc.text(`${quizAttempts.length}`, 112, 93);
    
    // Card 4: Certificações
    doc.rect(156, 80, 42, 20, "FD");
    doc.setTextColor(...grayText);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("CERTIFICAÇÕES", 159, 85);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(245, 158, 11); // Amarelo/Laranja
    doc.text(`${certifications.length}`, 159, 93);

    // 4. Competências de Atendimento (5 Pilares de CS Yooga)
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Média de Desempenho por Competências de CS Yooga", 15, 110);
    
    const empathy = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.empathy_score, 0) / completedSimulations.length) : 0;
    const resolution = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.resolution_score, 0) / completedSimulations.length) : 0;
    const professionalism = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.professionalism_score, 0) / completedSimulations.length) : 0;
    const agility = completedSimulations.length > 0 ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.agility_score, 0) / completedSimulations.length) : 0;
    
    const competencies = [
      { name: "Empatia (Sensibilidade e validação da dor do cliente)", score: empathy },
      { name: "Resolução (Conhecimento Técnico dos artigos do FAQ Yooga)", score: resolution },
      { name: "Profissionalismo (Tom de voz corporativo e humor equilibrado)", score: professionalism },
      { name: "Agilidade (Disponibilidade imediata e otimização de tempo)", score: agility }
    ];
    
    let compY = 117;
    competencies.forEach(comp => {
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(comp.name, 15, compY);
      doc.text(`${comp.score}%`, 185, compY);
      
      // Barra de progresso visual
      doc.setFillColor(241, 245, 249); // Fundo da barra
      doc.rect(15, compY + 1.5, 180, 1.5, "F");
      doc.setFillColor(...primaryColor); // Progresso da barra
      doc.rect(15, compY + 1.5, (comp.score / 100) * 180, 1.5, "F");
      
      compY += 8;
    });

    // 5. Histórico Recente de Simulações
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Histórico de Simulações Recentes", 15, 160);
    
    // Tabela simples
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 164, 180, 6, "F");
    doc.text("CENÁRIO / MÓDULO", 18, 168.5);
    doc.text("DATA", 105, 168.5);
    doc.text("DURAÇÃO", 132, 168.5);
    doc.text("SUGESTÕES", 157, 168.5);
    doc.text("NOTA GERAL", 180, 168.5);
    
    doc.setFont("helvetica", "normal");
    let simY = 174;
    const recentSims = completedSimulations.slice(0, 5);
    
    if (recentSims.length === 0) {
      doc.text("Nenhuma simulação de atendimento concluída ainda.", 18, simY);
    } else {
      recentSims.forEach(sim => {
        const scenario = scenarios.find(s => s.id === sim.scenario_id);
        const title = scenario ? scenario.title : "Cenário Personalizado";
        doc.text(title.substring(0, 52), 18, simY);
        doc.text(new Date(sim.created_date).toLocaleDateString('pt-BR'), 105, simY);
        doc.text(`${sim.duration_minutes || 0} min`, 132, simY);
        doc.text(`${sim.suggestions_used || 0}`, 157, simY);
        doc.text(`${sim.evaluation?.overall_score || 0}%`, 180, simY);
        doc.setDrawColor(241, 245, 249);
        doc.line(15, simY + 1.5, 195, simY + 1.5); // Linha divisória
        simY += 6.5;
      });
    }

    // 6. Certificações Ativas
    let certY = 218;
    doc.setTextColor(...darkText);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Certificações de Trilhas de Aprendizado Conquistadas", 15, certY);
    
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(241, 245, 249);
    doc.rect(15, certY + 4, 180, 6, "F");
    doc.text("MÓDULO TÉCNICO DA TRILHA", 18, certY + 8);
    doc.text("DATA CONQUISTA", 105, certY + 8);
    doc.text("AVALIAÇÃO / SCORE", 160, certY + 8);
    
    doc.setFont("helvetica", "normal");
    let activeCertY = certY + 14;
    if (certifications.length === 0) {
      doc.text("Nenhuma trilha concluída com aproveitamento >= 80% ainda.", 18, activeCertY);
    } else {
      certifications.forEach(cert => {
        doc.text(cert.moduleName || "Módulo de Treinamento", 18, activeCertY);
        doc.text(new Date(cert.created_date).toLocaleDateString('pt-BR'), 105, activeCertY);
        doc.text(`${cert.score}% de Aproveitamento`, 160, activeCertY);
        doc.setDrawColor(241, 245, 249);
        doc.line(15, activeCertY + 1.5, 195, activeCertY + 1.5);
        activeCertY += 6.5;
      });
    }

    // Rodapé de Página Única
    doc.setFontSize(7);
    doc.setTextColor(...grayText);
    doc.text("Yooga Tecnologia S/A - Sistema de Simulação de CS. Documento confidencial para fins de treinamento interno.", 15, 287);
    doc.text("Página 1 de 1", 185, 287);

    doc.save(`Relatorio_Performance_CS_${(user.full_name || user.email || 'agente').replace(/\s+/g, '_')}.pdf`);
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-slate-700">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
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
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-12 px-6 font-bold shadow-lg shadow-orange-500/10 flex items-center gap-2 border-0 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Relatório PDF</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
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
                    <Clock className="w-4 h-4 text-blue-500" />
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
                    <Award className="w-4 h-4 text-green-500" />
                    Nota Média de CS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-green-600">
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
                    <HelpCircle className="w-4 h-4 text-[#FF6600]" />
                    Quizzes Realizados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-[#FF6600]">
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
                    <Trophy className="w-4 h-4 text-orange-500" />
                    Módulos Certificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-orange-600">
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
                      <Trophy className="w-5 h-5 text-orange-500" />
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
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
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
                    <Trophy className="w-5 h-5 text-orange-500" />
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
                            <Trophy className="w-5 h-5 text-green-600 translate-x-2.5 -translate-y-2.5" />
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
                    <HelpCircle className="w-5 h-5 text-[#FF6600]" />
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
