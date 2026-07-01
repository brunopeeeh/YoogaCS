import React, { useState, useEffect } from "react";
import { Module, QuizAttempt, Certification, Article, Quiz, ensureKnowledgeReady } from "@/entities/Knowledge";
import { useUser } from "../components/auth/UserProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  Trophy, 
  LayoutGrid, 
  List, 
  Search, 
  Award, 
  Sparkles, 
  BookOpenCheck,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Modules() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [articles, setArticles] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Busca, Filtro e Visualização
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'not_started', 'in_progress', 'certified'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'time'
  const [viewMode, setViewMode] = useState("grid"); // 'grid', 'list'

  useEffect(() => {
    const loadModulesAndProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        await ensureKnowledgeReady();
        const [modulesData, attemptsData, certsData, articlesData, quizzesData] = await Promise.all([
          Module.list(),
          QuizAttempt.list(),
          Certification.list(),
          Article.list(),
          Quiz.list()
        ]);

        // Filtrar tentativas e certificações do usuário ativo
        const userAttempts = attemptsData.filter(a => a.created_by.toLowerCase() === user.email.toLowerCase());
        const userCerts = certsData.filter(c => c.created_by.toLowerCase() === user.email.toLowerCase());

        setModules(modulesData);
        setAttempts(userAttempts);
        setCertifications(userCerts);
        setArticles(articlesData);
        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Erro ao carregar trilhas:", error);
      }
      setIsLoading(false);
    };

    loadModulesAndProgress();
  }, [user]);

  // Função auxiliar para retornar informações de status e cores de um módulo
  const getModuleStatus = (moduleId) => {
    const isCertified = certifications.some(c => c.moduleId === moduleId);
    if (isCertified) {
      const cert = certifications.find(c => c.moduleId === moduleId);
      return { 
        status: "certified", 
        badge: "Certificado", 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30", 
        score: cert.score 
      };
    }

    const moduleAttempts = attempts.filter(a => a.moduleId === moduleId);
    if (moduleAttempts.length > 0) {
      const bestAttempt = Math.max(...moduleAttempts.map(a => a.score));
      return { 
        status: "in_progress", 
        badge: "Em Progresso", 
        color: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30", 
        bestScore: bestAttempt 
      };
    }

    return { 
      status: "not_started", 
      badge: "Não Iniciado", 
      color: "bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/30" 
    };
  };

  const getModuleGradients = (index) => {
    const gradients = [
      "from-blue-600 to-indigo-700",
      "from-orange-500 to-amber-600",
      "from-violet-600 to-purple-700",
      "from-teal-500 to-emerald-600",
      "from-rose-500 to-red-600"
    ];
    return gradients[index % gradients.length];
  };

  // Cálculo das estatísticas gerais para o Dashboard
  const totalModulesCount = modules.length;
  const certifiedModulesCount = modules.filter(m => getModuleStatus(m.id).status === 'certified').length;
  const inProgressModulesCount = modules.filter(m => getModuleStatus(m.id).status === 'in_progress').length;
  
  // Cálculo da Média de Aproveitamento
  const attemptedModuleIds = [...new Set(attempts.map(a => a.moduleId))];
  const scoresSum = attemptedModuleIds.reduce((sum, mId) => {
    const moduleAttempts = attempts.filter(a => a.moduleId === mId);
    const best = Math.max(...moduleAttempts.map(a => a.score));
    return sum + best;
  }, 0);
  const averageScore = attemptedModuleIds.length > 0 ? Math.round(scoresSum / attemptedModuleIds.length) : 0;

  // Filtragem e Ordenação das Trilhas
  const filteredAndSortedModules = modules
    .filter(module => {
      const matchesSearch = 
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      const state = getModuleStatus(module.id);
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "not_started" && state.status === "not_started") ||
        (statusFilter === "in_progress" && state.status === "in_progress") ||
        (statusFilter === "certified" && state.status === "certified");
        
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "time") {
        const timeA = parseInt(a.estimated_time) || 0;
        const timeB = parseInt(b.estimated_time) || 0;
        return timeA - timeB;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Cabeçalho Compacto & Premium */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
                <Sparkles className="w-3 h-3" />
                Academia de Sucesso Yooga
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Trilhas de Aprendizado</h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl leading-relaxed">
              Estude os principais tópicos da nossa central de ajuda, realize os quizzes de validação e conquiste suas certificações de especialista do suporte!
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 relative z-10 shrink-0 shadow-inner">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{certifications.length}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Certificações Ganhas</div>
            </div>
          </div>
        </div>

        {/* Dashboard de Estatísticas Gerais (Nova Funcionalidade) */}
        {!isLoading && totalModulesCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Progresso Global */}
            <Card className="bg-white border-slate-100 shadow-sm hover:shadow transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1.5 w-full">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progresso do Treinamento</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{certifiedModulesCount}</span>
                    <span className="text-xs font-bold text-slate-400">/ {totalModulesCount} concluídos</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(certifiedModulesCount / totalModulesCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Aproveitamento Médio */}
            <Card className="bg-white border-slate-100 shadow-sm hover:shadow transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aproveitamento nos Quizzes</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{averageScore}%</span>
                    <span className="text-xs font-bold text-slate-400">Média Geral</span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Meta de aprovação: 80%</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Status Rápido */}
            <Card className="bg-white border-slate-100 shadow-sm hover:shadow transition-all rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status das Trilhas</span>
                  <div className="flex gap-4 mt-1">
                    <div>
                      <span className="text-lg font-black text-slate-800">{inProgressModulesCount}</span>
                      <span className="text-[11px] font-semibold text-blue-500 ml-1.5">Em Andamento</span>
                    </div>
                    <div className="border-l border-slate-100 pl-4">
                      <span className="text-lg font-black text-slate-800">{totalModulesCount - certifiedModulesCount - inProgressModulesCount}</span>
                      <span className="text-[11px] font-semibold text-slate-500 ml-1.5">Não Iniciados</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estude no seu próprio ritmo</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Barra de Ações Interativa (Busca, Filtro, Ordenação e Layout Toggle) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              type="text" 
              placeholder="Buscar por trilha..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl text-slate-700 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro de Status */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5 border border-slate-200/40">
              <button 
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "all" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Todas
              </button>
              <button 
                onClick={() => setStatusFilter("not_started")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "not_started" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Não Iniciadas
              </button>
              <button 
                onClick={() => setStatusFilter("in_progress")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "in_progress" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Em Progresso
              </button>
              <button 
                onClick={() => setStatusFilter("certified")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "certified" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Certificadas
              </button>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 outline-none hover:border-slate-300 cursor-pointer"
              >
                <option value="name">Ordenar por Nome</option>
                <option value="time">Ordenar por Duração</option>
              </select>
            </div>

            <div className="w-[1px] h-6 bg-slate-200 hidden sm:block"></div>

            {/* Alternador de Layout */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Visualização em Grade"
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-lg ${viewMode === "grid" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Visualização em Lista"
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 rounded-lg ${viewMode === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Listagem de Módulos */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3" role="status" aria-live="polite">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-slate-500 animate-pulse">Carregando módulos da Yooga...</p>
            </div>
          ) : filteredAndSortedModules.length === 0 ? (
            <Card className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
              <CardContent className="p-0 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-2">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nenhuma trilha encontrada</h3>
                <p className="text-slate-500 text-xs md:text-sm">
                  Não encontramos trilhas que correspondem à sua busca ou filtro. Tente redefinir os parâmetros acima!
                </p>
                <Button 
                  onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            /* VISUALIZAÇÃO EM GRADE: 3 Colunas Super Compacta e Premium */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAndSortedModules.map((module, idx) => {
                const state = getModuleStatus(module.id);
                const gradient = getModuleGradients(idx);
                const articleCount = articles.filter(art => art.moduleId === module.id).length;
                const quiz = quizzes.find(q => q.moduleId === module.id);
                const questionCount = quiz?.questions?.length || 0;

                return (
                  <Card 
                    key={module.id} 
                    onClick={() => navigate(`/ModuleStudy?id=${module.id}`)}
                    className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer flex flex-col justify-between rounded-2xl overflow-hidden group"
                  >
                    <div>
                      {/* Topo do Card Temático */}
                      <div className={`h-1.5 bg-gradient-to-r ${gradient}`}></div>
                      
                      <CardHeader className="p-5 pb-3">
                        <div className="flex justify-between items-center gap-3 mb-2.5">
                          <Badge variant="outline" className={`font-bold rounded-lg text-[10px] px-2 py-0.5 border ${state.color} shrink-0`}>
                            {state.badge}
                          </Badge>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{module.estimated_time || "30 min"}</span>
                          </div>
                        </div>
                        
                        <CardTitle className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">
                          {module.name}
                        </CardTitle>
                        
                        <CardDescription className="text-slate-500 text-xs leading-relaxed mt-2 line-clamp-2 min-h-[32px]">
                          {module.description}
                        </CardDescription>
                      </CardHeader>
                    </div>

                    <CardContent className="p-5 pt-3 flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40">
                      {/* Estatísticas Dinâmicas do Módulo */}
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold bg-slate-100/50 p-2 rounded-xl">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          {articleCount} Lições
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-slate-400" />
                          {questionCount} Pergunta{questionCount !== 1 ? 's' : ''} no Quiz
                        </span>
                      </div>

                      {/* Informações Adicionais / Pontuações */}
                      {state.status === "certified" && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 leading-none">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span>Certificado com {state.score}%</span>
                        </div>
                      )}
                      {state.status === "in_progress" && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 leading-none">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Melhor nota: {state.bestScore}% (Meta: 80%)</span>
                        </div>
                      )}
                      {state.status === "not_started" && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 leading-none">
                          <PlayCircle className="w-4 h-4 shrink-0" />
                          <span>Pronto para iniciar</span>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <Button 
                          size="sm"
                          className={`w-full bg-gradient-to-r ${gradient} hover:opacity-95 text-white rounded-xl text-xs font-bold h-9 gap-1.5 shadow-sm`}
                        >
                          {state.status === "certified" ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Revisar Conteúdo
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5" />
                              {state.status === "in_progress" ? "Continuar" : "Iniciar"}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* VISUALIZAÇÃO EM LISTA: Alta Densidade de Informação */
            <Card className="bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden divide-y divide-slate-100">
              {filteredAndSortedModules.map((module, idx) => {
                const state = getModuleStatus(module.id);
                const gradient = getModuleGradients(idx);
                const articleCount = articles.filter(art => art.moduleId === module.id).length;
                const quiz = quizzes.find(q => q.moduleId === module.id);
                const questionCount = quiz?.questions?.length || 0;

                return (
                  <div 
                    key={module.id} 
                    onClick={() => navigate(`/ModuleStudy?id=${module.id}`)}
                    className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  >
                    {/* Lateral esquerda com indicador visual e título */}
                    <div className="flex items-center gap-4 w-full md:w-3/5">
                      <div className={`w-2.5 h-10 rounded-full bg-gradient-to-b ${gradient} shrink-0`}></div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={`font-bold rounded-lg text-[9px] px-2 py-0 border ${state.color} shrink-0`}>
                            {state.badge}
                          </Badge>
                          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {module.estimated_time || "30 min"}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {module.name}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-1 md:line-clamp-2">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    {/* Centro com Contadores e Estatísticas */}
                    <div className="flex items-center gap-4 shrink-0 md:justify-center w-full md:w-auto">
                      <div className="flex items-center gap-4 bg-slate-100/50 px-3 py-1.5 rounded-xl border border-slate-200/20 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-[10px]">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {articleCount} lições
                        </span>
                        <span className="w-[1px] h-3.5 bg-slate-200"></span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                          {questionCount} questões
                        </span>
                      </div>

                      {state.status === "certified" && (
                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1 leading-none">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aprovado com {state.score}%</span>
                        </div>
                      )}
                      {state.status === "in_progress" && (
                        <div className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1 leading-none">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Nota atual: {state.bestScore}%</span>
                        </div>
                      )}
                    </div>

                    {/* Botão de Ação à Direita */}
                    <div className="shrink-0 flex items-center justify-end w-full md:w-auto">
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 group-hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/40 rounded-xl px-3 py-1 text-xs font-bold flex items-center gap-1.5 h-9"
                      >
                        {state.status === "certified" ? "Revisar" : "Estudar"}
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
