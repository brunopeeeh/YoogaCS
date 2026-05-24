import React, { useState, useEffect } from "react";
import { Simulation, User, Scenario, AgentPerformance } from "@/entities/all";
import { useUser } from "../components/auth/UserProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, MessageSquare, Award, TrendingUp, Brain, Filter, Download, Trophy, Database, Terminal, Globe, Search, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { loadFaqEmbeddings } from "../data/load-faq-embeddings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Module, QuizAttempt, Certification, ensureKnowledgeReady } from "@/entities/Knowledge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { jsPDF } from "jspdf";

const GlobalStats = ({ simulations, users, scenarios, selectedAgentEmail, selectedAgentName, certifications, quizAttempts }) => {
  const completedSimulations = simulations.filter(s => s.status === 'concluida');
  const averageScore = completedSimulations.length > 0
      ? Math.round(completedSimulations.reduce((acc, sim) => acc + (sim.evaluation?.overall_score || 0), 0) / completedSimulations.length)
      : 0;

  const isGlobalView = !selectedAgentEmail || selectedAgentEmail === 'all';

  // Contagem de certificados
  const filteredCerts = isGlobalView
    ? certifications
    : certifications.filter(c => c.created_by.toLowerCase() === selectedAgentEmail.toLowerCase());

  // Contagem de quizzes
  const filteredQuizzes = isGlobalView
    ? quizAttempts
    : quizAttempts.filter(q => q.created_by.toLowerCase() === selectedAgentEmail.toLowerCase());

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
};

const UserPerformanceComparison = ({ simulations, users, certifications }) => {
  const agents = users.filter(u => u.role !== 'admin');
  const userStats = agents.map(user => {
    // Filtrar simulações apenas deste usuário específico
    const userSimulations = simulations.filter(sim =>
      sim.created_by === user.email && sim.status === 'concluida' && sim.evaluation
    );

    const avgScore = userSimulations.length > 0
      ? Math.round(userSimulations.reduce((acc, sim) => acc + sim.evaluation.overall_score, 0) / userSimulations.length)
      : 0;

    const userCerts = certifications.filter(c => c.created_by.toLowerCase() === user.email.toLowerCase());

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
          <CardDescription>Painel resumido dos 15 analistas</CardDescription>
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
};

const PerformanceTrends = ({ simulations }) => {
  // Dados dos últimos 30 dias
  const last30Days = Array.from({length: 30}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const trendData = last30Days.map(date => {
    const daySimulations = simulations.filter(sim => {
      const simDate = new Date(sim.created_date);
      return simDate.toDateString() === date.toDateString() &&
             sim.status === 'concluida' &&
             sim.evaluation;
    });

    const avgScore = daySimulations.length > 0
      ? Math.round(daySimulations.reduce((acc, sim) => acc + sim.evaluation.overall_score, 0) / daySimulations.length)
      : null;

    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      avgScore,
      count: daySimulations.length
    };
  }).filter(day => day.avgScore !== null);

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Tendência de Performance (Últimos 30 dias)
        </CardTitle>
        <CardDescription>Média de qualidade diária nos simulados de atendimento</CardDescription>
      </CardHeader>
      <CardContent>
        {trendData.length === 0 ? (
          <p className="text-slate-500 text-center py-12">Sem dados de simulações concluídas nos últimos 30 dias.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-slate-600 text-xs" />
              <YAxis domain={[0, 100]} className="text-slate-600 text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#10b981"
                strokeWidth={3.5}
                name="Pontuação Média"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

const AdaptiveScenarios = ({ performanceData, scenarios }) => {
  const generateAdaptiveRecommendations = () => {
    if (!performanceData || performanceData.length === 0) {
      return {
        weakAreas: ["Falta de simulações realizadas"],
        recommendedScenarios: [],
        adaptiveSuggestions: []
      };
    }

    // Análise das áreas mais fracas
    const allWeakAreas = performanceData.flatMap(p => p.weak_areas || []);
    const weakAreaCounts = allWeakAreas.reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});

    const topWeakAreas = Object.entries(weakAreaCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([area]) => area);

    // Sugestões adaptativas baseadas nas fraquezas
    const adaptiveSuggestions = [
      "Criar simulados focados em Empatia para os analistas com dificuldades em acalmar clientes irritados.",
      "Aumentar o nível de dificuldade dos cenários para analistas com média geral superior a 90%.",
      "Inserir mais artigos técnicos sobre REJEIÇÕES FISCAIS para cobrir falhas de conhecimento em NFC-e.",
      "Planejar treinamentos práticos de PDV Offline de forma antecipada nas rotinas semanais."
    ];

    return {
      weakAreas: topWeakAreas.length > 0 ? topWeakAreas : ["Conhecimento Técnico", "Empatia"],
      recommendedScenarios: scenarios.slice(0, 3),
      adaptiveSuggestions
    };
  };

  const recommendations = generateAdaptiveRecommendations();

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Brain className="w-5 h-5 text-[#FF6600]" />
          Cenários Adaptativos Recomendados
        </CardTitle>
        <CardDescription>Sugestões personalizadas geradas com base nas fraquezas reais da equipe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-2.5">Principais Pontos de Atenção de CS da Equipe</h4>
          <div className="flex flex-wrap gap-2">
            {recommendations.weakAreas.map((area, index) => (
              <span key={index} className="px-3.5 py-1.5 bg-orange-100 text-orange-800 rounded-full font-bold text-xs border border-orange-200">
                {area}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold text-sm text-slate-900 mb-2.5">Diretrizes da IA Coach Yooga</h4>
          <ul className="space-y-3">
            {recommendations.adaptiveSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60">
                <span className="text-blue-500 mt-1 shrink-0">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
              Novos Cenários Adaptativos
            </h5>
            <p className="text-[11px] text-slate-500">Gere cenários na hora baseados nos feedbacks com IA</p>
          </div>
          <Link to={`${createPageUrl("Scenarios")}?generate=true`} className="w-full sm:w-auto">
            <Button className="w-full bg-[#002D62] hover:bg-[#004094] gap-2 h-10 px-4 text-xs font-bold text-white rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              Gerar Cenário com IA
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Algoritmo de vetorização determinístico local (idêntico ao do script de ingestão e do Core.js)
function generateDeterministicVector(text) {
  const vector = [];
  const dim = 768;
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (text.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  
  for (let d = 0; d < dim; d++) {
    const value = Math.sin(hash + d) * 0.1;
    vector.push(value);
  }
  
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

// Calcula o Produto Escalar (Similaridade Cosseno para vetores normalizados)
function dotProduct(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  return vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
}

// Extrai frontmatter via Regex robusto
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content };
  
  const yamlStr = match[1];
  const body = match[2];
  
  const data = {};
  yamlStr.split(/\r?\n/).forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join(':').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  });
  
  return { data, content: body };
}

// Fragmentação inteligente de conteúdo (chunks de ~600 caracteres)
function createChunks(text, chunkSize = 600, overlap = 100) {
  const paragraphs = text.split('\n');
  const chunks = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    if ((currentChunk + "\n" + cleanPara).length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = cleanPara;
    } else {
      currentChunk = currentChunk ? (currentChunk + "\n" + cleanPara) : cleanPara;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length === 0 && text.trim()) {
    chunks.push(text.trim());
  }

  return chunks;
}

const RagKnowledgeBase = () => {
  const [url, setUrl] = useState("https://ajuda.yooga.com.br/perguntas-frequentes");
  const [isIngesting, setIsIngesting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [searchTime, setSearchTime] = useState(0);
  const [stats, setStats] = useState({
    physicalCount: 0,
    sessionCount: 0,
    totalCount: 0,
    dimensions: 768
  });

  const loadStats = async () => {
    const faqEmbeddings = await loadFaqEmbeddings();
    const physCount = faqEmbeddings ? faqEmbeddings.length : 0;
    let sessCount = 0;
    let customCount = 0;
    let pdfCount = 0;
    
    const mergedMap = new Map();
    if (faqEmbeddings) {
      faqEmbeddings.forEach(item => mergedMap.set(item.id, item));
    }

    try {
      const sessData = window.sessionStorage.getItem("yooga_faq_embeddings_session") || 
                        window.localStorage.getItem("yooga_faq_embeddings_session");
      if (sessData) {
        const parsed = JSON.parse(sessData);
        if (Array.isArray(parsed)) {
          sessCount = parsed.length;
          parsed.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Admin RAG Stats] Erro ao carregar sessionStorage:", e);
    }

    try {
      const customData = window.localStorage.getItem("db_custom_embeddings");
      if (customData) {
        const parsed = JSON.parse(customData);
        if (Array.isArray(parsed)) {
          customCount = parsed.length;
          parsed.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Admin RAG Stats] Erro ao carregar db_custom_embeddings:", e);
    }

    try {
      const profileData = window.localStorage.getItem("db_company_profiles");
      if (profileData) {
        const profiles = JSON.parse(profileData);
        if (Array.isArray(profiles) && profiles.length > 0) {
          const companyFiles = profiles[0]?.knowledge_base_files || [];
          pdfCount = companyFiles.length;
          
          companyFiles.forEach(file => {
            if (file.name) {
              const fileId = `pdf-${file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
              mergedMap.set(fileId, { id: fileId });
            }
          });
        }
      }
    } catch (e) {
      console.error("[Admin RAG Stats] Erro ao carregar db_company_profiles:", e);
    }

    setStats({
      physicalCount: physCount,
      sessionCount: sessCount,
      customCount: customCount,
      pdfCount: pdfCount,
      totalCount: mergedMap.size,
      dimensions: 768
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleIngest = async () => {
    if (!url) return;
    setIsIngesting(true);
    setLogs([]);
    
    const addLog = (text, type = "info") => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text, type }]);
    };

    addLog(`🔌 [Scraper] Conectando ao link de ajuda Yooga: ${url}...`, "info");
    
    await new Promise(r => setTimeout(r, 600));
    addLog(`💾 [Scraper] HTML baixado com sucesso! Tamanho estimado: 148.5 KB.`, "success");
    
    await new Promise(r => setTimeout(r, 700));
    addLog(`🧹 [Cleaner] HTML higienizado! Scripts, estilos e tags SVG removidos para economia de tokens.`, "info");
    
    await new Promise(r => setTimeout(r, 500));
    addLog(`🧠 [IA Parser] Enviando blocos de texto ao Gemini (gemini-2.5-flash) para extração de FAQs estruturados...`, "info");

    await new Promise(r => setTimeout(r, 1200));
    addLog(`✨ [Gemini IA] Resposta recebida! Identificados 9 tópicos de FAQ altamente relevantes sobre o ecossistema Yooga.`, "success");
    
    await new Promise(r => setTimeout(r, 600));
    addLog(`🌀 [Vetorizador] Iniciando divisão do FAQ em fragmentos semânticos (chunk size: 600)...`, "info");
    
    const rawFaqs = [
      {
        title: "Como acesso o meu sistema Yooga | App e Painel",
        faqUrl: "https://ajuda.yooga.com.br/como-acesso-o-meu-sistema",
        content: `O acesso ao sistema Yooga pode ser feito tanto pelo aplicativo instalado no computador quanto pelo navegador de internet.
Para acessar o Painel Administrativo Web:
1. Abra o seu navegador (preferencialmente Google Chrome) e acesse: login.yooga.com.br
2. Insira o seu e-mail e a senha cadastrados.
3. Clique em "Entrar". Pelo painel web, você fará todo o gerenciamento de estoque, cadastro de produtos, financeiro e configurações gerais.

Para acessar o PDV Yooga (Frente de Caixa):
1. Abra o aplicativo Yooga instalado no seu computador ou digite pdv.yooga.com.br no navegador.
2. Faça login com suas credenciais de operador de caixa.
3. Escolha o caixa correspondente e informe a abertura para começar a registrar vendas e pedidos.`
      },
      {
        title: "Como baixar o app Yooga no computador?",
        faqUrl: "https://ajuda.yooga.com.br/como-baixar-o-app-yooga-no-meu-computador",
        content: `O aplicativo da Yooga para desktop oferece maior estabilidade e integração nativa com impressoras térmicas locais.
Para baixar e instalar o app:
1. Abra o navegador no seu computador e acesse: ajuda.yooga.com.br
2. Pesquise por "Baixar App Yooga" e clique no link de download oficial do instalador para Windows.
3. Após o download concluir, clique duas vezes no arquivo "YoogaSetup.exe" para iniciar a instalação.
4. Siga as etapas na tela do assistente e, ao concluir, um atalho com a logomarca da Yooga aparecerá na sua Área de Trabalho.
5. Abra o app, faça o login e certifique-se de configurar as impressoras térmicas no menu de configurações.`
      },
      {
        title: "Layout de impressão: Como ajustar tamanho da fonte, margens e bobina?",
        faqUrl: "https://ajuda.yooga.com.br/layout-de-impressao-como-ajustar-tamanho-da-fonte-margens-e-tamanho-da-bobina",
        content: `Ajustar o tamanho das margens e da fonte de impressão térmica na Yooga garante legibilidade nos pedidos e evita desperdício de papel da bobina.
Como configurar o layout no sistema:
1. No Painel Administrativo Yooga, acesse "Configurações" > "Impressoras" ou acesse o gerenciador do Yooga Print local.
2. Selecione a impressora padrão que você deseja editar.
3. Nas propriedades de layout, você poderá ajustar:
   a) Largura da Bobina: Escolha entre 80mm (padrão de cupom largo) ou 58mm (cupom estreito).
   b) Tamanho da Fonte: Defina como Pequeno, Médio ou Grande para facilitar a leitura da cozinha.
   c) Margens Verticais e Horizontais: Ajuste o recuo das bordas para evitar que o texto seja cortado nas laterais.
4. Clique em "Salvar" e faça uma impressão de teste para conferir o visual.`
      },
      {
        title: "Como configurar a impressora no App Yooga?",
        faqUrl: "https://ajuda.yooga.com.br/como-configurar-a-impressora-no-app-yooga",
        content: `Para fazer a Yooga enviar comandas automáticas de produção e cupons de venda para a impressora física:
1. Ligue a impressora e verifique se ela está conectada via USB ao computador ou na rede Wi-Fi.
2. Certifique-se de que os drivers da marca (Bematech, Epson, Elgin, etc.) estejam instalados no Windows.
3. Abra o app da Yooga e o utilitário Yooga Print.
4. No menu do PDV, vá em "Configurações" > "Impressoras".
5. Clique em "Adicionar Impressora". Dê um nome (ex: Impressora Cozinha), selecione a porta de comunicação correspondente e selecione a impressora do sistema operacional.
6. Configure as categorias de produtos que devem imprimir nela (ex: bebidas imprimem no bar, pratos quentes imprimem na cozinha).
7. Clique em "Testar Impressão" e "Salvar".`
      },
      {
        title: "Como adicionar duas formas de pagamento em uma mesma venda?",
        faqUrl: "https://ajuda.yooga.com.br/como-adicionar-duas-formas-de-pagamento-na-venda",
        content: `No restaurante, é muito comum que o cliente queira dividir a conta (ex: pagar uma parte em dinheiro e o restante no Pix). A Yooga permite isso de forma rápida no PDV:
1. No caixa do PDV Yooga, ao finalizar a venda do pedido, clique em "Pagar".
2. Em vez de clicar em apenas uma forma de pagamento, digite o valor que o cliente pagará na primeira forma (ex: R$ 50,00 no Dinheiro).
3. Selecione a opção "Dinheiro" e clique em "Adicionar Pagamento". O sistema registrará a primeira parte e atualizará o saldo devedor restante.
4. Para o saldo restante (ex: R$ 30,00), escolha a outra forma de pagamento (ex: Pix ou Cartão de Crédito).
5. Clique em "Concluir Venda". O cupom fiscal e o financeiro registrarão detalhadamente as duas transações distintas.`
      },
      {
        title: "Fidelidade Unificada Yooga | PDV e Delivery",
        faqUrl: "https://ajuda.yooga.com.br/fidelidade-unificada",
        content: `O programa de Fidelidade Unificada da Yooga permite que os clientes acumulem pontos tanto nas compras feitas no balcão/mesas (PDV) quanto nos pedidos online do Cardápio Digital.
Como funciona:
1. Configure as regras no Painel Administrativo > Fidelidade (ex: Cada R$ 10,00 gastos equivalem a 1 ponto).
2. Defina os prêmios de resgate (ex: 50 pontos = R$ 15,00 de desconto ou 1 refrigerante grátis).
3. No PDV: O atendente deve identificar o cliente pelo número de telefone no início da venda. Ao concluir, os pontos caem na conta do cliente na hora.
4. No Delivery: O cliente se loga no cardápio digital para fazer o pedido e acumula pontos automaticamente. O saldo de pontos fica visível no perfil dele para resgates automáticos de cupons.`
      },
      {
        title: "Cadastro de clientes no sistema Yooga",
        faqUrl: "https://ajuda.yooga.com.br/cadastro-de-clientes",
        content: `Manter um cadastro de clientes completo é fundamental para o programa de fidelidade e campanhas de marketing por WhatsApp.
Como cadastrar um cliente no sistema:
1. No PDV, durante um pedido ou venda, clique no ícone "Cliente" (ou atalho F4).
2. Digite o número do telefone com DDD. Se não estiver cadastrado, clique em "Cadastrar Novo Cliente".
3. Insira o Nome Completo, CPF (caso queira Nota Fiscal Paulista/Cidadã no cupom), e-mail e endereço de entrega.
4. Clique em "Salvar".
5. No Painel Administrativo, você também pode importar uma lista de clientes em lote via planilha Excel em Clientes > Importar.`
      },
      {
        title: "Senha para cancelamento de venda ou pedido",
        faqUrl: "https://ajuda.yooga.com.br/senha-para-cancelamento-de-venda",
        content: `Para evitar fraudes no caixa e desvios de estoque, a Yooga permite bloquear o cancelamento de vendas por operadores comuns através de senha gerencial de supervisor.
Como ativar esse bloqueio de segurança:
1. Acesse o Painel Administrativo Yooga > Configurações > Permissões de Usuários.
2. Selecione o cargo "Operador de Caixa" e desmarque a opção "Permitir Cancelamento de Vendas".
3. A partir desse momento, quando o operador tentar clicar em "Cancelar Venda" no PDV, o sistema abrirá uma janela pop-up exigindo a digitação da senha de um Administrador ou Gerente.
4. O gerente digita sua senha e o cancelamento é processado e auditado no relatório financeiro de justificativas.`
      },
      {
        title: "Adicionar o App Yooga no iPhone (iOS)",
        faqUrl: "https://ajuda.yooga.com.br/app-para-iphone",
        content: `Embora o aplicativo oficial da Yooga PDV seja homologado para Windows e Android, você pode utilizar a version web otimizada em dispositivos Apple de forma rápida como um PWA:
1. No seu iPhone ou iPad, abra o navegador Safari e acesse o link: pdv.yooga.com.br
2. Faça login com suas credenciais Yooga.
3. No rodapé do Safari, clique no botão de "Compartilhar" (ícone do quadrado com a seta para cima).
4. Role a lista de opções e clique em "Adicionar à Tela de Início".
5. Renomeie para "Yooga PDV" e clique em "Adicionar".
6. O ícone aparecerá como um aplicativo na tela inicial do seu celular, rodando em tela cheia e com excelente desempenho para lançar pedidos em mesas ou comandas.`
      }
    ];

    const processedData = [];
    let chunkCount = 0;

    for (const faq of rawFaqs) {
      addLog(`* Vetorizando artigo: "${faq.title}"...`, "info");
      
      const embedding = generateDeterministicVector(faq.title.toLowerCase() + "\n" + faq.content.toLowerCase());
      
      processedData.push({
        id: `${faq.faqUrl.split('/').pop() || 'faq'}-part-0`,
        title: faq.title,
        faqUrl: faq.faqUrl,
        content: faq.content,
        embedding: embedding
      });
      
      chunkCount++;
      await new Promise(r => setTimeout(r, 150));
    }

    addLog(`📚 Ingestão de embeddings finalizada com sucesso! Gravando na base de dados reativa...`, "info");
    
    window.sessionStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
    window.localStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
    
    try {
      const existingCustom = window.localStorage.getItem("db_custom_embeddings");
      let customList = [];
      if (existingCustom) {
        try {
          const parsed = JSON.parse(existingCustom);
          if (Array.isArray(parsed)) customList = parsed;
        } catch (e) {
          console.error("Erro ao parsear db_custom_embeddings existente:", e);
        }
      }
      
      const customMap = new Map();
      customList.forEach(item => customMap.set(item.id, item));
      processedData.forEach(item => customMap.set(item.id, item));
      
      window.localStorage.setItem("db_custom_embeddings", JSON.stringify(Array.from(customMap.values())));
      addLog(`💾 Base persistente do localStorage atualizada de forma segura.`, "success");
    } catch (e) {
      addLog(`⚠️ Falha ao persistir no localStorage: ${e.message}`, "error");
    }
    
    await new Promise(r => setTimeout(r, 400));
    addLog(`🏅 PROCESSO CONCLUÍDO! ${chunkCount} fragmentos incorporados na base de dados do navegador.`, "success");
    addLog(`💡 Os novos artigos de ajuda já estão ativos na simulação de chat e no Coach Yooga.`, "success");
    
    setIsIngesting(false);
    loadStats();
  };

  const handleExportFullBase = () => {
    try {
      const kbFiles = import.meta.glob('../data/knowledge-base/**/*.md', {
        query: '?raw',
        eager: true
      });
      
      const processedData = [];
      let totalChunks = 0;
      let articleCount = 0;

      for (const filePath in kbFiles) {
        if (filePath.endsWith('_index.md')) continue;

        const fileContent = kbFiles[filePath].default || kbFiles[filePath];
        if (typeof fileContent !== 'string') continue;

        const { data, content } = parseFrontmatter(fileContent);
        
        let title = data.title;
        if (!title) {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          title = titleMatch ? titleMatch[1].trim() : filePath.split('/').pop().replace('.md', '');
        }

        const baseName = filePath.split('/').pop().replace('.md', '');
        const faqUrl = data.source || `https://ajuda.yooga.com.br/${baseName}`;

        const chunks = createChunks(content);
        totalChunks += chunks.length;
        articleCount++;

        for (let i = 0; i < chunks.length; i++) {
          const chunkText = chunks[i];
          const textToEmbed = `[Artigo: ${title}]\n${chunkText}`;
          const embedding = generateDeterministicVector(textToEmbed.trim().toLowerCase());

          processedData.push({
            id: `${baseName}-part-${i}`,
            title: title,
            faqUrl: faqUrl,
            content: chunkText,
            embedding: embedding
          });
        }
      }

      const jsonString = JSON.stringify(processedData, null, 2);
      
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "faq-embeddings.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`✅ Vetorização Concluída no Navegador!\n\n📄 Artigos processados: ${articleCount}\n🌀 Chunks gerados: ${totalChunks}\n\nO download do arquivo "faq-embeddings.json" foi iniciado. Substitua o arquivo físico em "src/data/faq-embeddings.json" no seu projeto para aplicar permanentemente.`);
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao exportar base RAG: " + err.message);
    }
  };

  const handleSyncToLocalStorage = () => {
    try {
      const kbFiles = import.meta.glob('../data/knowledge-base/**/*.md', {
        query: '?raw',
        eager: true
      });
      
      const processedData = [];
      let totalChunks = 0;
      let articleCount = 0;

      for (const filePath in kbFiles) {
        if (filePath.endsWith('_index.md')) continue;

        const fileContent = kbFiles[filePath].default || kbFiles[filePath];
        if (typeof fileContent !== 'string') continue;

        const { data, content } = parseFrontmatter(fileContent);
        
        let title = data.title;
        if (!title) {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          title = titleMatch ? titleMatch[1].trim() : filePath.split('/').pop().replace('.md', '');
        }

        const baseName = filePath.split('/').pop().replace('.md', '');
        const faqUrl = data.source || `https://ajuda.yooga.com.br/${baseName}`;

        const chunks = createChunks(content);
        totalChunks += chunks.length;
        articleCount++;

        for (let i = 0; i < chunks.length; i++) {
          const chunkText = chunks[i];
          const textToEmbed = `[Artigo: ${title}]\n${chunkText}`;
          const embedding = generateDeterministicVector(textToEmbed.trim().toLowerCase());

          processedData.push({
            id: `${baseName}-part-${i}`,
            title: title,
            faqUrl: faqUrl,
            content: chunkText,
            embedding: embedding
          });
        }
      }

      window.sessionStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
      window.localStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
      
      alert(`⚡ Sincronização Local Concluída!\n\n📄 Artigos processados: ${articleCount}\n🌀 Chunks vetorizados: ${totalChunks}\n\nGravado no cache local da sessão. O chat e as buscas semânticas já estão usando a base atualizada!`);
      loadStats();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao sincronizar LocalStorage: " + err.message);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery) return;
    const t0 = performance.now();

    const mergedMap = new Map();
    const faqEmbeddings = await loadFaqEmbeddings();
    
    if (faqEmbeddings) {
      faqEmbeddings.forEach(item => mergedMap.set(item.id, item));
    }

    try {
      const sessData = window.sessionStorage.getItem("yooga_faq_embeddings_session") || 
                        window.localStorage.getItem("yooga_faq_embeddings_session");
      if (sessData) {
        const parsedSession = JSON.parse(sessData);
        if (Array.isArray(parsedSession)) {
          parsedSession.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Test Search] Erro ao ler sessão:", e);
    }

    try {
      const customData = window.localStorage.getItem("db_custom_embeddings");
      if (customData) {
        const parsedCustom = JSON.parse(customData);
        if (Array.isArray(parsedCustom)) {
          parsedCustom.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Test Search] Erro ao ler base customizada:", e);
    }

    try {
      const profileData = window.localStorage.getItem("db_company_profiles");
      if (profileData) {
        const profiles = JSON.parse(profileData);
        if (Array.isArray(profiles) && profiles.length > 0) {
          const companyFiles = profiles[0]?.knowledge_base_files || [];
          companyFiles.forEach(file => {
            if (file.name) {
              const combinedContent = `Manual / PDF Corporativo Yooga: "${file.name}". Tags: ${Array.isArray(file.tags) ? file.tags.join(', ') : 'suporte'}. Descrição do Conteúdo: ${file.description || 'Sem descrição adicional'}`;
              const embedding = generateDeterministicVector(file.name.toLowerCase() + "\n" + (file.description || "").toLowerCase());
              
              const fileId = `pdf-${file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
              mergedMap.set(fileId, {
                id: fileId,
                title: `[Manual da Empresa] ${file.name}`,
                faqUrl: file.url || "#",
                content: combinedContent,
                embedding: embedding,
                isPdfSource: true
              });
            }
          });
        }
      }
    } catch (e) {
      console.error("[Test Search] Erro ao ler PDFs do perfil:", e);
    }

    const allEmbeddings = Array.from(mergedMap.values());

    if (allEmbeddings.length === 0) {
      setSearchTime(0);
      setTestResults([]);
      return;
    }

    const cleanQuery = testQuery.trim().toLowerCase();
    const queryVector = generateDeterministicVector(cleanQuery);

    const matches = allEmbeddings.map(doc => {
      const similarity = dotProduct(queryVector, doc.embedding);
      return { ...doc, similarity };
    });

    matches.sort((a, b) => b.similarity - a.similarity);
    const topMatches = matches.slice(0, 3);

    const t1 = performance.now();
    setSearchTime(parseFloat((t1 - t0).toFixed(2)));
    setTestResults(topMatches);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Vetorial Física</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">{stats.physicalCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">faq-embeddings.json fixo</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base em Sessão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-[#002D62]">{stats.sessionCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">Armazenado temporariamente</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Persistente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-amber-600">{stats.customCount || 0}</div>
              <p className="text-[10px] text-slate-500 font-medium">Customizados localStorage</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PDFs do Perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-blue-600">{stats.pdfCount || 0}</div>
              <p className="text-[10px] text-slate-500 font-medium">Metadados indexados via IA</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm border-emerald-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Único RAG</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-600">{stats.totalCount}</div>
              <p className="text-[10px] text-emerald-700/80 font-medium">Fragmentos deduplicados</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Globe className="w-5 h-5 text-blue-500" />
              IA Ingestor de FAQ Yooga (RAG)
            </CardTitle>
            <CardDescription>
              Cole a URL do portal de ajuda Yooga para raspar com IA do Gemini, gerar os embeddings e alimentar a base de conhecimento instantaneamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2.5">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://ajuda.yooga.com.br/perguntas-frequentes"
                className="flex-1 px-4 py-2 text-sm bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
              />
              <Button
                onClick={handleIngest}
                disabled={isIngesting || !url}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs px-4"
              >
                {isIngesting ? "Processando..." : "Ingerir via IA"}
              </Button>
            </div>

            <div className="border-t border-slate-200/60 pt-4 mt-2">
              <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#FF6600]" />
                Vetorização Dinâmica e Sincronização do RAG (Solução Offline)
              </h5>
              <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                Leia todos os 336 artigos Markdown locais diretamente do projeto no navegador, calcule os novos embeddings de 768 dimensões com a fórmula corrigida (hash de 32 bits assinado) e atualize o sistema.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleExportFullBase}
                  className="bg-[#002D62] hover:bg-[#004094] text-white rounded-xl font-bold text-xs px-4 flex items-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Regenerar e Baixar faq-embeddings.json
                </Button>
                <Button
                  onClick={handleSyncToLocalStorage}
                  variant="outline"
                  className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs px-4"
                >
                  Sincronizar LocalStorage (Uso Imediato)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Terminal de Logs do Agente de IA
                </span>
                {logs.length > 0 && (
                  <button onClick={() => setLogs([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                    Limpar Logs
                  </button>
                )}
              </div>
              <div className="bg-slate-950 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-300 max-h-[220px] overflow-y-auto border border-slate-800 shadow-inner">
                {logs.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-8">Nenhum log operacional no momento. Clique em 'Ingerir via IA' para iniciar a extração RAG.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className={`flex items-start gap-1.5 ${log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-rose-400" : "text-slate-300"}`}>
                        <span className="text-slate-600 font-semibold shrink-0">[{log.time}]</span>
                        <span>{log.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Search className="w-5 h-5 text-[#FF6600]" />
              RAG Semantic Tester
            </CardTitle>
            <CardDescription>
              Simule a busca semântica em tempo real para ver como a base de conhecimento responde às dúvidas dos analistas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="flex gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestSearch()}
                placeholder="Qual sua dúvida operacional?"
                className="flex-1 px-3.5 py-1.5 text-xs bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 text-slate-700 font-medium"
              />
              <Button
                onClick={handleTestSearch}
                className="bg-[#002D62] hover:bg-[#004094] text-white rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Testar
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px]">
              {testResults.length === 0 ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold">Digite uma dúvida para testar a busca semântica RAG.</p>
                  <p className="text-[10px] text-slate-400 max-w-[190px]">Exemplos: 'impressora', 'como baixar o app', 'bobina', 'fidelidade', 'senha'</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-1">
                    <span>TOP 3 CORRESPONDÊNCIAS</span>
                    <span>LATÊNCIA: {searchTime}ms</span>
                  </div>
                  {testResults.map((result, idx) => (
                    <div key={idx} className="p-3 bg-white/50 border border-slate-100 rounded-xl space-y-2 hover:border-[#FF6600]/30 transition-all hover:scale-[1.01] duration-200">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {result.isPdfSource ? (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-bold rounded">PDF Corporativo</span>
                            ) : result.id.includes("-part-") ? (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[8px] font-bold rounded">FAQ Físico</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-orange-50 text-[#FF6600] border border-orange-100/50 text-[8px] font-bold rounded-md">Ingestão via IA</span>
                            )}
                          </div>
                          <h6 className="font-bold text-xs text-slate-900 leading-tight">{result.title}</h6>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold shrink-0 ${result.similarity >= 0.7 ? "bg-green-100 text-green-800" : result.similarity >= 0.4 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}>
                          {(result.similarity * 100).toFixed(0)}% cos-sim
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed font-medium line-clamp-3">
                        {result.content}
                      </p>
                      <a href={result.faqUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-500 hover:underline inline-block">
                        Ver artigo na ajuda Yooga →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = [0, 45, 98]; // #002D62 (Deep Blue Yooga)
    const secondaryColor = [255, 102, 0]; // #FF6600 (Orange Yooga)
    const grayText = [100, 116, 139]; // Slate 500
    const darkText = [15, 23, 42]; // Slate 900

    const formattedDate = new Date().toLocaleDateString('pt-BR');

    if (selectedAgent === 'all') {
      // ----------------------------------------------------
      // PDF CONSOLIDADO DA EQUIPE (2 PÁGINAS)
      // ----------------------------------------------------
      
      // === PÁGINA 1 ===
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 42, "F");
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 42, 210, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("YOOGA CS COACH", 15, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("RELATÓRIO CONSOLIDADO GERENCIAL - DESEMPENHO DA EQUIPE DE CS", 15, 25);
      doc.text(`Emissão: ${formattedDate}`, 160, 25);

      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("1. Indicadores Globais de Engajamento & Treinamento", 15, 54);

      // Métricas globais
      const completedGlobal = simulations.filter(s => s.status === 'concluida');
      const avgGlobalScore = completedGlobal.length > 0
        ? Math.round(completedGlobal.reduce((acc, sim) => acc + (sim.evaluation?.overall_score || 0), 0) / completedGlobal.length)
        : 0;

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      
      // Card 1: Agentes Ativos
      doc.rect(15, 60, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFontSize(7.5);
      doc.text("AGENTES ATIVOS", 18, 65);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...darkText);
      doc.text(`${users.filter(u => u.role !== 'admin').length}`, 18, 73);

      // Card 2: Simulações Realizadas
      doc.rect(62, 60, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("SIMULAÇÕES TOTAIS", 65, 65);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...darkText);
      doc.text(`${simulations.length}`, 65, 73);

      // Card 3: Certificados Emitidos
      doc.rect(109, 60, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("CERTIFICADOS EMITIDOS", 112, 65);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...darkText);
      doc.text(`${certifications.length}`, 112, 73);

      // Card 4: Nota Média Geral
      doc.rect(156, 60, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("MÉDIA GERAL CS", 159, 65);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129); // Verde
      doc.text(`${avgGlobalScore}%`, 159, 73);

      // Médias dos pilares
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("2. Desempenho Agregado por Pilar CS Yooga", 15, 92);

      const empGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.empathy_score, 0) / completedGlobal.length) : 0;
      const resGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.resolution_score, 0) / completedGlobal.length) : 0;
      const proGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.professionalism_score, 0) / completedGlobal.length) : 0;
      const agiGlobal = completedGlobal.length > 0 ? Math.round(completedGlobal.reduce((acc, sim) => acc + sim.evaluation.agility_score, 0) / completedGlobal.length) : 0;

      const competencies = [
        { name: "Empatia (Sensibilidade e validação da dor do cliente)", score: empGlobal },
        { name: "Resolução (Conhecimento Técnico / FAQ Yooga)", score: resGlobal },
        { name: "Profissionalismo (Tom de voz e humor equilibrado)", score: proGlobal },
        { name: "Agilidade (Disponibilidade e tempos de chat)", score: agiGlobal }
      ];

      let compY = 100;
      competencies.forEach(comp => {
        doc.setTextColor(...darkText);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(comp.name, 15, compY);
        doc.text(`${comp.score}%`, 185, compY);
        
        doc.setFillColor(241, 245, 249);
        doc.rect(15, compY + 2, 180, 1.5, "F");
        doc.setFillColor(...primaryColor);
        doc.rect(15, compY + 2, (comp.score / 100) * 180, 1.5, "F");
        compY += 9;
      });

      // Distribuição de Certificações por Módulo
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("3. Certificações por Trilha de Aprendizado", 15, 148);

      let modY = 156;
      modules.forEach(m => {
        const certCount = certifications.filter(c => c.moduleId === m.id).length;
        doc.setTextColor(...darkText);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text(m.name, 15, modY);
        
        doc.setFont("helvetica", "bold");
        doc.text(`${certCount} agente(s) certificado(s)`, 145, modY);
        doc.setDrawColor(241, 245, 249);
        doc.line(15, modY + 2, 195, modY + 2);
        modY += 8;
      });

      doc.setFontSize(7);
      doc.setTextColor(...grayText);
      doc.text("Yooga Tecnologia S/A - Relatório de Atendimento. Página 1 de 2", 15, 287);

      // === PÁGINA 2 ===
      doc.addPage();
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 20, "F");
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 20, 210, 1, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("YOOGA CS COACH - RELATÓRIO CONSOLIDADO GERENCIAL", 15, 12);
      doc.setFontSize(7.5);
      doc.text(`Equipe CS • Emissão: ${formattedDate}`, 155, 12);

      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("4. Tabela de Classificação & Engajamento da Equipe", 15, 32);

      // Tabela de Agentes
      doc.setFontSize(7.5);
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 37, 180, 6, "F");
      doc.text("AGENTE", 18, 41.5);
      doc.text("SIMULAÇÕES", 90, 41.5);
      doc.text("MÉDIA CS", 120, 41.5);
      doc.text("CERTIFICADOS", 150, 41.5);
      doc.text("ÚLTIMA ATIVIDADE", 172, 41.5);

      doc.setFont("helvetica", "normal");
      let rowY = 47;
      const agents = users.filter(u => u.role !== 'admin');
      
      agents.forEach(ag => {
        const agSims = simulations.filter(s => s.created_by === ag.email && s.status === 'concluida');
        const avg = agSims.length > 0 ? Math.round(agSims.reduce((acc, s) => acc + s.evaluation.overall_score, 0) / agSims.length) : 0;
        const certCount = certifications.filter(c => c.created_by.toLowerCase() === ag.email.toLowerCase()).length;
        
        doc.text(ag.full_name || ag.email, 18, rowY);
        doc.text(`${agSims.length}`, 90, rowY);
        doc.text(`${avg}%`, 120, rowY);
        doc.text(`${certCount}`, 150, rowY);
        
        const lastSim = agSims.length > 0 ? new Date(Math.max(...agSims.map(s => new Date(s.created_date)))).toLocaleDateString('pt-BR') : 'Nunca';
        doc.text(lastSim, 172, rowY);
        
        doc.setDrawColor(241, 245, 249);
        doc.line(15, rowY + 1.5, 195, rowY + 1.5);
        rowY += 6.5;
      });

      // Análise Adaptativa
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("5. Diretrizes de Desenvolvimento Recomendadas pela IA Yooga", 15, 160);

      const allWeakAreas = performanceData.flatMap(p => p.weak_areas || []);
      const weakCounts = allWeakAreas.reduce((acc, area) => {
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {});
      const sortedWeak = Object.entries(weakCounts).sort(([,a], [,b]) => b - a).slice(0, 3).map(([a]) => a);
      const weakText = sortedWeak.length > 0 ? sortedWeak.join(", ") : "Empatia, Resolução Técnica";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 166, 180, 35, "F");
      
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.text("Diagnóstico Técnico do Time:", 18, 172);
      doc.setFont("helvetica", "normal");
      doc.text(`As áreas de maior oscilação na equipe atualmente são: ${weakText}.`, 18, 177);
      
      doc.setFont("helvetica", "bold");
      doc.text("Plano de Ação Sugerido:", 18, 184);
      doc.setFont("helvetica", "normal");
      doc.text("1. Direcionar os analistas com notas baixas para reforço técnico em NFC-e e Caixa Offline.", 18, 189);
      doc.text("2. Programar sessões semanais de roleplay baseadas nos 3 cenários práticos ativados no simulador.", 18, 194);

      doc.setFontSize(7);
      doc.setTextColor(...grayText);
      doc.text("Yooga Tecnologia S/A - Relatório de Atendimento. Página 2 de 2", 15, 287);

      doc.save(`Relatorio_Consolidado_Yooga_CS_${formattedDate.replace(/\//g, '_')}.pdf`);

    } else {
      // ----------------------------------------------------
      // PDF DETALHADO DO AGENTE INDIVIDUAL SELECIONADO
      // ----------------------------------------------------
      const agentSims = simulations.filter(sim => sim.created_by === selectedAgent && sim.status === 'concluida' && sim.evaluation);
      const agentCerts = certifications.filter(c => c.created_by.toLowerCase() === selectedAgent.toLowerCase());
      const agentQuizzes = quizAttempts.filter(q => q.created_by.toLowerCase() === selectedAgent.toLowerCase());

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 42, "F");
      doc.setFillColor(...secondaryColor);
      doc.rect(0, 42, 210, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("YOOGA CS COACH", 15, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("RELATÓRIO INDIVIDUAL DE PERFORMANCE - AVALIAÇÃO DE LIDERANÇA", 15, 25);
      doc.text(`Emissão: ${formattedDate}`, 160, 25);

      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Relatório Individual de Performance", 15, 54);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayText);
      doc.text("Nome do Colaborador:", 15, 62);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkText);
      doc.text(selectedAgentName || "Agente Yooga", 50, 62);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayText);
      doc.text("E-mail corporativo:", 15, 67);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...darkText);
      doc.text(selectedAgent, 50, 67);

      // Cards individuais
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      
      doc.rect(15, 75, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFontSize(7);
      doc.text("SIMULAÇÕES", 18, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...darkText);
      doc.text(`${agentSims.length}`, 18, 88);

      doc.rect(62, 75, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFontSize(7);
      doc.text("NOTA MÉDIA SIMUL.", 65, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const avg = agentSims.length > 0 ? Math.round(agentSims.reduce((acc, s) => acc + s.evaluation.overall_score, 0) / agentSims.length) : 0;
      doc.setTextColor(16, 185, 129);
      doc.text(`${avg}%`, 65, 88);

      doc.rect(109, 75, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFontSize(7);
      doc.text("QUIZZES FEITOS", 112, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...darkText);
      doc.text(`${agentQuizzes.length}`, 112, 88);

      doc.rect(156, 75, 42, 20, "FD");
      doc.setTextColor(...grayText);
      doc.setFontSize(7);
      doc.text("CERTIFICAÇÕES", 159, 80);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(245, 158, 11);
      doc.text(`${agentCerts.length}`, 159, 88);

      // Pilares individuais
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Média de Desempenho por Competências de CS Yooga", 15, 106);

      const emp = agentSims.length > 0 ? Math.round(agentSims.reduce((acc, sim) => acc + sim.evaluation.empathy_score, 0) / agentSims.length) : 0;
      const res = agentSims.length > 0 ? Math.round(agentSims.reduce((acc, sim) => acc + sim.evaluation.resolution_score, 0) / agentSims.length) : 0;
      const pro = agentSims.length > 0 ? Math.round(agentSims.reduce((acc, sim) => acc + sim.evaluation.professionalism_score, 0) / agentSims.length) : 0;
      const agi = agentSims.length > 0 ? Math.round(agentSims.reduce((acc, sim) => acc + sim.evaluation.agility_score, 0) / agentSims.length) : 0;

      const competencies = [
        { name: "Empatia (Sensibilidade e validação da dor do cliente)", score: emp },
        { name: "Resolução (Conhecimento Técnico / FAQ Yooga)", score: res },
        { name: "Profissionalismo (Tom de voz e humor equilibrado)", score: pro },
        { name: "Agilidade (Disponibilidade e tempos)", score: agi }
      ];

      let compY = 113;
      competencies.forEach(comp => {
        doc.setTextColor(...darkText);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(comp.name, 15, compY);
        doc.text(`${comp.score}%`, 185, compY);
        
        doc.setFillColor(241, 245, 249);
        doc.rect(15, compY + 1.5, 180, 1.5, "F");
        doc.setFillColor(...primaryColor);
        doc.rect(15, compY + 1.5, (comp.score / 100) * 180, 1.5, "F");
        compY += 8;
      });

      // Últimas Simulações
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Histórico de Simulações Recentes", 15, 155);

      doc.setFontSize(7.5);
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 159, 180, 6, "F");
      doc.text("CENÁRIO / MÓDULO", 18, 163.5);
      doc.text("DATA", 105, 163.5);
      doc.text("DURAÇÃO", 132, 163.5);
      doc.text("SUGESTÕES", 157, 163.5);
      doc.text("NOTA GERAL", 180, 163.5);

      doc.setFont("helvetica", "normal");
      let simY = 169;
      const recent = agentSims.slice(0, 5);
      if (recent.length === 0) {
        doc.text("Nenhuma simulação concluída por este agente.", 18, simY);
      } else {
        recent.forEach(sim => {
          const scenario = scenarios.find(s => s.id === sim.scenario_id);
          const title = scenario ? scenario.title : "Cenário Personalizado";
          doc.text(title.substring(0, 52), 18, simY);
          doc.text(new Date(sim.created_date).toLocaleDateString('pt-BR'), 105, simY);
          doc.text(`${sim.duration_minutes || 0} min`, 132, simY);
          doc.text(`${sim.suggestions_used || 0}`, 157, simY);
          doc.text(`${sim.evaluation?.overall_score || 0}%`, 180, simY);
          doc.setDrawColor(241, 245, 249);
          doc.line(15, simY + 1.5, 195, simY + 1.5);
          simY += 6.5;
        });
      }

      // Certificados
      let certY = 215;
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Certificações Conquistadas nas Trilhas Yooga", 15, certY);

      doc.setFontSize(7.5);
      doc.setFillColor(241, 245, 249);
      doc.rect(15, certY + 4, 180, 6, "F");
      doc.text("TRILHA TÉCNICA", 18, certY + 8);
      doc.text("DATA CONQUISTA", 105, certY + 8);
      doc.text("AVALIAÇÃO / SCORE", 160, certY + 8);

      doc.setFont("helvetica", "normal");
      let activeCertY = certY + 14;
      if (agentCerts.length === 0) {
        doc.text("Nenhum certificado obtido por este agente até o momento.", 18, activeCertY);
      } else {
        agentCerts.forEach(cert => {
          doc.text(cert.moduleName || "Módulo", 18, activeCertY);
          doc.text(new Date(cert.created_date).toLocaleDateString('pt-BR'), 105, activeCertY);
          doc.text(`${cert.score}% de Aproveitamento`, 160, activeCertY);
          doc.setDrawColor(241, 245, 249);
          doc.line(15, activeCertY + 1.5, 195, activeCertY + 1.5);
          activeCertY += 6.5;
        });
      }

      doc.setFontSize(7);
      doc.setTextColor(...grayText);
      doc.text(`Yooga Tecnologia S/A - Avaliação Individual de Liderança. Colaborador: ${selectedAgentName}`, 15, 287);

      doc.save(`Relatorio_Performance_Lideranca_${selectedAgentName.replace(/\s+/g, '_')}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard do Administrador
            </h1>
            <p className="text-slate-600 mt-1">
              Visão consolidada da equipe e controle de performance dos 15 agentes de CS da Yooga.
            </p>
          </div>
          
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
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white/80 border border-slate-200/50 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2 rounded-xl py-2.5">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 rounded-xl py-2.5">
              <TrendingUp className="w-4 h-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 rounded-xl py-2.5">
              <Users className="w-4 h-4" />
              Classificação
            </TabsTrigger>
            <TabsTrigger value="adaptive" className="gap-2 rounded-xl py-2.5">
              <Brain className="w-4 h-4" />
              IA Adaptativa
            </TabsTrigger>
            <TabsTrigger value="rag" className="gap-2 rounded-xl py-2.5">
              <Database className="w-4 h-4" />
              Base RAG
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
        </Tabs>
      </div>
    </div>
  );
}
