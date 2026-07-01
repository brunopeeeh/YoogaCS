import React, { useState, useEffect } from "react";
import { Module, Article, ensureKnowledgeReady } from "@/entities/Knowledge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  ExternalLink, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  Play
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ModuleStudy() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id");
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [articles, setArticles] = useState([]);
  const [selectedArticleIdx, setSelectedArticleIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadModuleData = async () => {
      if (!moduleId) {
        navigate("/Modules");
        return;
      }
      setIsLoading(true);
      try {
        await ensureKnowledgeReady();
        const [moduleData, allArticles] = await Promise.all([
          Module.get(moduleId),
          Article.list()
        ]);

        if (!moduleData) {
          navigate("/Modules");
          return;
        }

        // Filtrar artigos locais vinculados ao módulo
        const moduleArticles = allArticles.filter(art => art.moduleId === moduleId);
        
        setModule(moduleData);
        setArticles(moduleArticles);
        setSelectedArticleIdx(0);
      } catch (error) {
        console.error("Erro ao carregar dados do estudo:", error);
      }
      setIsLoading(false);
    };

    loadModuleData();
  }, [moduleId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3" role="status" aria-live="polite">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Carregando material de estudo...</p>
      </div>
    );
  }

  const currentArticle = articles[selectedArticleIdx];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Barra de Navegação Superior */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/Modules")}
            className="text-slate-600 hover:text-slate-900 rounded-xl gap-2 font-bold text-xs h-9 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Trilhas
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trilha Ativa:</span>
            <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200/50 font-bold px-3 py-1 rounded-lg">
              {module?.name}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Menu Lateral de Artigos (1/4) */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <Card className="bg-white shadow-sm border-slate-200/60 rounded-2xl overflow-hidden">
              <CardHeader className="p-4 md:p-5 bg-slate-50/40 border-b border-slate-100">
                <CardTitle className="text-slate-800 text-sm font-extrabold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                  Lições da Trilha
                </CardTitle>
                <CardDescription className="text-[11px] font-medium text-slate-400">
                  {articles.length} tópicos para leitura
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 space-y-1 max-h-[350px] overflow-y-auto">
                {articles.map((article, idx) => {
                  const isSelected = selectedArticleIdx === idx;
                  return (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticleIdx(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-start gap-2.5 leading-snug ${
                        isSelected
                          ? "bg-indigo-50/80 text-indigo-700 shadow-sm border-l-4 border-indigo-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 font-extrabold ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{article.title}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Chamada para o Quiz */}
            <Card className="bg-slate-900 text-white rounded-2xl shadow-md border-slate-800 p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                  <h3 className="font-extrabold text-sm tracking-tight">Quiz de Validação</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Após ler todas as lições, faça o teste para receber a sua certificação. A nota mínima é **80%**.
                </p>
              </div>

              <Button
                onClick={() => navigate(`/ModuleQuiz?id=${moduleId}`)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm relative z-10 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                Iniciar Quiz
              </Button>
            </Card>
          </div>

          {/* Área de Leitura Principal (3/4) */}
          <div className="lg:col-span-3">
            {currentArticle ? (
              <Card className="bg-white shadow-sm border-slate-200/60 rounded-2xl overflow-hidden min-h-[500px] flex flex-col justify-between">
                <div>
                  
                  {/* Cabeçalho do Artigo */}
                  <div className="p-5 md:p-6 bg-slate-50/40 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                        Tópico {selectedArticleIdx + 1} de {articles.length}
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mt-1.5">
                        {currentArticle.title}
                      </h2>
                    </div>
                    {currentArticle.faqUrl && (
                      <a 
                        href={currentArticle.faqUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200/40 px-3.5 py-1.5 rounded-xl transition-all shadow-sm shrink-0"
                      >
                        Ver no FAQ Yooga
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  
                  {/* Conteúdo de Texto */}
                  <CardContent className="p-6 md:p-8">
                    <div className="text-slate-700 space-y-5 leading-relaxed text-sm md:text-base whitespace-pre-line max-w-4xl font-medium">
                      {currentArticle.content}
                    </div>
                  </CardContent>

                </div>

                {/* Rodapé de Navegação interna */}
                <CardContent className="p-4 md:p-5 border-t border-slate-100 bg-slate-50/20 flex justify-between gap-4 mt-auto">
                  <Button
                    variant="outline"
                    disabled={selectedArticleIdx === 0}
                    onClick={() => setSelectedArticleIdx(prev => prev - 1)}
                    className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold gap-1.5 h-10 hover:border-slate-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Anterior
                  </Button>

                  {selectedArticleIdx < articles.length - 1 ? (
                    <Button
                      onClick={() => setSelectedArticleIdx(prev => prev + 1)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold gap-1.5 h-10 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Próxima Lição
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/ModuleQuiz?id=${moduleId}`)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white rounded-xl text-xs font-bold gap-1.5 h-10 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Iniciar o Quiz
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </Button>
                  )}
                </CardContent>

              </Card>
            ) : (
              <Card className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-8 text-center text-slate-500">
                Nenhuma lição cadastrada para este módulo.
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
