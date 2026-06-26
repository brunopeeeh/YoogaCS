import React, { useState, useEffect } from "react";
import { Module, Quiz, QuizAttempt, Certification, ensureKnowledgeReady } from "@/entities/Knowledge";
import { useUser } from "../components/auth/UserProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, HelpCircle, RefreshCw, Award, ArrowRight } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <p className="text-slate-500">Preparando as questões...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const finalPercentage = Math.round((score / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Barra superior com botão voltar */}
        {!isFinished && (
          <div className="flex justify-between items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/ModuleStudy?id=${moduleId}`)}
              className="text-slate-600 hover:text-slate-900 rounded-xl gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Sair do Quiz
            </Button>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Questão {currentQuestionIdx + 1} de {questions.length}
            </Badge>
          </div>
        )}

        {/* Card Principal */}
        <Card className="bg-white shadow-xl border-slate-200/80 rounded-3xl overflow-hidden">
          
          {!isFinished ? (
            /* Tela do Quiz Ativo */
            <div>
              {/* Progresso sutil */}
              <div className="w-full bg-slate-100 h-2">
                <div 
                  className="bg-orange-500 h-2 transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx) / questions.length) * 100}%` }}
                ></div>
              </div>

              <CardHeader className="p-6 md:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Validando Conhecimento Yooga</span>
                </div>
                <CardTitle className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                  {currentQuestion?.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-0 space-y-3">
                {currentQuestion?.options.map((option, idx) => {
                  let buttonStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700";
                  
                  if (selectedOption === idx) {
                    buttonStyle = "border-orange-500 bg-orange-50/50 text-orange-900 ring-2 ring-orange-500/20";
                  }

                  if (isAnswered) {
                    if (idx === currentQuestion.answerIndex) {
                      buttonStyle = "border-green-500 bg-green-50/70 text-green-900 font-semibold ring-2 ring-green-500/20";
                    } else if (selectedOption === idx) {
                      buttonStyle = "border-red-500 bg-red-50/70 text-red-900 ring-2 ring-red-500/20";
                    } else {
                      buttonStyle = "border-slate-100 bg-slate-50/30 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-2xl text-sm md:text-base border transition-all duration-200 flex items-center justify-between gap-3 ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswered && idx === currentQuestion.answerIndex && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      )}
                      {isAnswered && selectedOption === idx && idx !== currentQuestion.answerIndex && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </CardContent>

              <CardContent className="p-6 md:p-8 pt-0 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                {!isAnswered ? (
                  <Button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOption === null}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 px-6 font-semibold shadow-md disabled:opacity-50"
                  >
                    Responder
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-semibold shadow-md flex items-center gap-1.5"
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
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 border border-green-200 text-green-600 mb-2 animate-bounce">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Certificação Conquistada!</h2>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    Excelente trabalho! Você obteve **{finalPercentage}%** de aproveitamento e agora está certificado no módulo **{module?.name}**.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-slate-500 mb-2">
                    <Award className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900">Quase lá!</h2>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                    Você obteve **{finalPercentage}%** de aproveitamento. Para se certificar, é necessário atingir no mínimo **80%** de acerto. Que tal revisar o material e tentar de novo?
                  </p>
                </div>
              )}

              {/* Placar de acertos */}
              <div className="max-w-xs mx-auto grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{score} / {questions.length}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Acertos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{finalPercentage}%</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Aproveitamento</div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  onClick={handleRestartQuiz}
                  variant="outline"
                  className="rounded-xl border-slate-200 font-medium h-11 gap-2 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </Button>
                
                <Button
                  onClick={() => navigate("/Modules")}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold px-6 shadow-md"
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
