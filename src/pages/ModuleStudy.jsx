import React, { useState, useEffect } from "react";
import { Module, Article, ensureKnowledgeReady } from "@/entities/Knowledge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, HelpCircle, ArrowLeft, ArrowRight, Play } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <p className="text-slate-500">Carregando material de estudo...</p>
      </div>
    );
  }

  const currentArticle = articles[selectedArticleIdx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Barra de Navegação Superior */}
        <div className="flex justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/Modules")}
            className="text-slate-600 hover:text-slate-900 rounded-xl gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Trilhas
          </Button>

          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {module?.name}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Menu Lateral de Artigos (1/4) */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white shadow-md border-slate-200/80 rounded-2xl">
              <CardHeader className="p-4">
                <CardTitle className="text-slate-800 text-base flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  Artigos de Estudo
                </CardTitle>
                <CardDescription>
                  {articles.length} tópicos cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {articles.map((article, idx) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticleIdx(idx)}
                    className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedArticleIdx === idx
                        ? "bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {idx + 1}. {article.title}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white rounded-2xl shadow-md border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="font-bold text-sm">Pronto para Testar?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Leia todos os artigos recomendados e faça o Quiz de Validação do conhecimento! A nota mínima para certificação é **80%**.
              </p>
              <Button
                onClick={() => navigate(`/ModuleQuiz?id=${moduleId}`)}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Iniciar Quiz
              </Button>
            </Card>
          </div>

          {/* Área de Leitura Principal (3/4) */}
          <div className="lg:col-span-3">
            {currentArticle ? (
              <Card className="bg-white shadow-md border-slate-200/80 rounded-2xl overflow-hidden min-h-[500px] flex flex-col justify-between">
                <div>
                  
                  {/* Cabeçalho do Artigo */}
                  <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Tópico {selectedArticleIdx + 1} de {articles.length}</span>
                      <h2 className="text-2xl font-bold text-slate-900 mt-1">{currentArticle.title}</h2>
                    </div>
                    {currentArticle.faqUrl && (
                      <a 
                        href={currentArticle.faqUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-all"
                      >
                        Ver no FAQ
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  
                  {/* Conteúdo de Texto */}
                  <CardContent className="p-8 prose prose-slate max-w-none">
                    <div className="text-slate-700 space-y-5 leading-relaxed text-base whitespace-pre-line">
                      {currentArticle.content}
                    </div>
                  </CardContent>

                </div>

                {/* Rodapé de Navegação interna dos artigos */}
                <CardContent className="p-6 pt-0 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-4 mt-auto">
                  <Button
                    variant="outline"
                    disabled={selectedArticleIdx === 0}
                    onClick={() => setSelectedArticleIdx(prev => prev - 1)}
                    className="rounded-xl border-slate-200 gap-2 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Anterior
                  </Button>

                  {selectedArticleIdx < articles.length - 1 ? (
                    <Button
                      onClick={() => setSelectedArticleIdx(prev => prev + 1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold shadow-sm"
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate(`/ModuleQuiz?id=${moduleId}`)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl gap-2 font-semibold shadow-md"
                    >
                      Ir para o Quiz
                      <Play className="w-4 h-4 fill-current" />
                    </Button>
                  )}
                </CardContent>

              </Card>
            ) : (
              <Card className="bg-white shadow-md border-slate-200/80 rounded-2xl p-8 text-center text-slate-500">
                Nenhum artigo cadastrado para este módulo.
              </Card>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
