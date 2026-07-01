import React, { useState, useEffect } from "react";
import { Module, Quiz, QuizAttempt, Certification, ensureKnowledgeReady } from "@/entities/Knowledge";
import { useUser } from "../components/auth/UserProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RefreshCw, 
  Award, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function ModuleQuiz() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id");
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();

  const [module, setModule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!moduleId) {
        navigate("/Modules");
        return;
      }
      setIsLoading(true);
      try {
        await ensureKnowledgeReady();
        const [moduleData, allQuizzes] = await Promise.all([
          Module.get(moduleId),
          Quiz.list()
        ]);

        if (!moduleData) {
          navigate("/Modules");
          return;
        }

        // Buscar quiz associado a este módulo
        const moduleQuiz = allQuizzes.find(q => q.moduleId === moduleId);
        
        setModule(moduleData);
        if (moduleQuiz && moduleQuiz.questions && moduleQuiz.questions.length > 0) {
          setQuestions(moduleQuiz.questions);
        } else {
          // Quiz padrão se não achar nenhum
          setQuestions([
            {
              question: "Como o sistema Yooga lida com problemas de oscilação de internet?",
              options: [
                "Para de funcionar por completo até que a internet volte.",
                "Entra em modo offline automaticamente, salva tudo em cache local e sincroniza assim que a rede restabelecer.",
                "Exclui o banco de dados local para evitar conflitos fiscais.",
                "Redireciona todas as chamadas para o celular do suporte."
              ],
              answerIndex: 1
            }
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar quiz:", error);
      }
      setIsLoading(false);
    };

    loadQuizData();
  }, [moduleId, navigate]);

  const handleOptionSelect = (optionIdx) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;

    const currentQuestion = questions[currentQuestionIdx];
    const isCorrect = selectedOption === currentQuestion.answerIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    if (!user) return;

    // Calcular a porcentagem final de acertos
    const finalScorePct = Math.round((score / questions.length) * 100);

    try {
      // Salvar a tentativa no LocalStorage
      await QuizAttempt.create({
        moduleId,
        score: finalScorePct,
        totalQuestions: questions.length,
        correctAnswers: score,
        created_by: user.email
      });

      // Se passou com >= 80%, concede a certificação
      if (finalScorePct >= 80) {
        // Verificar se já possui certificação
        const currentCerts = await Certification.list();
        const alreadyCertified = currentCerts.some(c => c.moduleId === moduleId && c.created_by.toLowerCase() === user.email.toLowerCase());
        
        if (!alreadyCertified) {
          await Certification.create({
            moduleId,
            moduleName: module.name,
            score: finalScorePct,
            created_by: user.email
          });
          
          toast({
            title: "Parabéns! 🎉",
            description: `Você conquistou a certificação oficial em "${module.name}" com ${finalScorePct}% de acertos!`,
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error("Erro ao salvar resultado do quiz:", error);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3" role="status" aria-live="polite">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 animate-pulse">Preparando o teste de conhecimento...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const finalPercentage = Math.round((score / questions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Barra superior com botão voltar */}
        {!isFinished && (
          <div className="flex justify-between items-center gap-4 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/ModuleStudy?id=${moduleId}`)}
              className="text-slate-600 hover:text-slate-900 rounded-xl gap-2 font-bold text-xs h-9 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Sair do Quiz
            </Button>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200/50 font-bold px-3 py-1 rounded-lg text-[10px]">
              Questão {currentQuestionIdx + 1} de {questions.length}
            </Badge>
          </div>
        )}

        {/* Card Principal */}
        <Card className="bg-white shadow-lg border-slate-200/60 rounded-3xl overflow-hidden">
          
          {!isFinished ? (
            /* Tela do Quiz Ativo */
            <div>
              {/* Progresso sutil */}
              <div className="w-full bg-slate-100 h-1.5">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-r-full"
                  style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
                ></div>
              </div>

              <CardHeader className="p-6 md:p-8">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg w-fit">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Certificação de Conhecimento</span>
                </div>
                <CardTitle className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                  {currentQuestion?.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-0 space-y-3">
                {currentQuestion?.options.map((option, idx) => {
                  let buttonStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700";
                  
                  if (selectedOption === idx) {
                    buttonStyle = "border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-500/10 font-bold";
                  }

                  if (isAnswered) {
                    if (idx === currentQuestion.answerIndex) {
                      buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-500/10";
                    } else if (selectedOption === idx) {
                      buttonStyle = "border-rose-500 bg-rose-50 text-rose-900 font-semibold ring-2 ring-rose-500/10";
                    } else {
                      buttonStyle = "border-slate-100 bg-slate-50/20 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-2xl text-xs md:text-sm border transition-all duration-200 flex items-center justify-between gap-3 leading-snug font-medium cursor-pointer ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 font-extrabold border ${
                          selectedOption === idx ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-200/50"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isAnswered && idx === currentQuestion.answerIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && selectedOption === idx && idx !== currentQuestion.answerIndex && (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </CardContent>

              <CardContent className="p-6 md:p-8 pt-0 border-t border-slate-100 bg-slate-50/20 flex justify-end">
                {!isAnswered ? (
                  <Button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOption === null}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6 font-bold text-xs shadow-sm disabled:opacity-50 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    Confirmar Resposta
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-6 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {currentQuestionIdx < questions.length - 1 ? "Próxima Pergunta" : "Ver Resultado"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </div>
          ) : (
            /* Tela de Resultado Final */
            <div className="p-8 text-center space-y-6">
              
              {finalPercentage >= 80 ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-2 animate-bounce">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Certificação Conquistada!</h2>
                  <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-semibold">
                    Excelente trabalho! Você obteve **{finalPercentage}%** de aproveitamento e agora está certificado no módulo **{module?.name}**.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 border border-slate-200 text-slate-400 mb-2">
                    <Award className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Quase lá!</h2>
                  <p className="text-slate-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-semibold">
                    Você obteve **{finalPercentage}%** de aproveitamento. Para se certificar, é necessário atingir no mínimo **80%** de acertos.
                  </p>
                </div>
              )}

              {/* Placar de acertos */}
              <div className="max-w-xs mx-auto grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-xl font-black text-slate-800">{score} / {questions.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Acertos</div>
                </div>
                <div>
                  <div className="text-xl font-black text-slate-800">{finalPercentage}%</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Aproveitamento</div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={handleRestartQuiz}
                  variant="outline"
                  className="rounded-xl border-slate-200 font-bold text-xs h-11 gap-2 flex items-center justify-center hover:bg-slate-50"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-hover" />
                  Tentar Novamente
                </Button>
                
                <Button
                  onClick={() => navigate("/Modules")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-bold text-xs px-6 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Voltar para Trilhas
                </Button>
              </div>

            </div>
          )}

        </Card>
      </div>
    </div>
  );
}
