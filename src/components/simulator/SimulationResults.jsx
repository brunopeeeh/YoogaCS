
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Award, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Home,
  Clock,
  MessageSquare,
  Lightbulb
} from "lucide-react";

export default function SimulationResults({ results, scenario, onRestart, maxSuggestions }) {
  const evaluation = results.evaluation;
  
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const handleExportLog = () => {
    try {
      const logData = {
        scenario_title: scenario.title,
        client_profile: scenario.client_profile,
        difficulty_level: scenario.difficulty_level,
        overall_score: evaluation.overall_score,
        conversation: results.messages?.map(m => ({
          sender: m.sender,
          message: m.message,
          timestamp: m.timestamp
        }))
      };
      
      const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `treino_ia_${(scenario.title || 'simulacao').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar logs:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Simulação Concluída!
          </h1>
          <p className="text-slate-600">
            Aqui está sua avaliação detalhada de performance
          </p>
        </div>

        {/* Overall Score */}
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Pontuação Geral</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(evaluation.overall_score)}`}>
              {evaluation.overall_score}%
            </div>
            <div className="max-w-md mx-auto">
              <Progress 
                value={evaluation.overall_score} 
                className={`h-3 ${getScoreBg(evaluation.overall_score)}`}
              />
            </div>
            {results.suggestions_used > 0 && (
              <p className="text-sm text-slate-500 mt-3">
                Penalidade de {results.suggestions_used * 5} pontos aplicada pelo uso de {results.suggestions_used} sugestão(ões).
              </p>
            )}
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Empatia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.empathy_score)}`}>
                {evaluation.empathy_score}%
              </div>
              <Progress value={evaluation.empathy_score} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Resolução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.resolution_score)}`}>
                {evaluation.resolution_score}%
              </div>
              <Progress value={evaluation.resolution_score} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Profissionalismo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.professionalism_score)}`}>
                {evaluation.professionalism_score}%
              </div>
              <Progress value={evaluation.professionalism_score} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Agilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.agility_score)}`}>
                {evaluation.agility_score}%
              </div>
              <Progress value={evaluation.agility_score} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardContent className="flex items-center gap-3 pt-6">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Duração</p>
                <p className="text-xl font-bold">{results.duration_minutes || 0} min</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardContent className="flex items-center gap-3 pt-6">
              <MessageSquare className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Mensagens</p>
                <p className="text-xl font-bold">{results.messages?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardContent className="flex items-center gap-3 pt-6">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-600">Sugestões Usadas</p>
                <p className="text-xl font-bold">{results.suggestions_used || 0}/{maxSuggestions}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardContent className="flex items-center gap-3 pt-6">
              <TrendingUp className="w-8 h-8 text-[#FF6600]" />
              <div>
                <p className="text-sm text-slate-600">Cenário</p>
                <p className="text-sm font-semibold">{scenario.difficulty_level}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evaluation.strengths && evaluation.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-1">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">Nenhum ponto forte identificado nesta sessão.</p>
              )}
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5" />
                Áreas de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evaluation.improvements && evaluation.improvements.length > 0 ? (
                <ul className="space-y-2">
                  {evaluation.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-orange-500 mt-1">!</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">Nenhuma área de melhoria identificada. Excelente trabalho!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Feedback */}
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
          <CardHeader>
            <CardTitle>Feedback Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              {evaluation.feedback}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRestart}
            className="bg-gradient-to-r from-[#002D62] to-[#004094] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 gap-2 h-12 px-6 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Nova Simulação
          </Button>

          <Button
            onClick={handleExportLog}
            variant="secondary"
            className="bg-slate-100 text-slate-800 hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 gap-2 h-12 px-6 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            Exportar Histórico de Treino
          </Button>
          
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="gap-2 h-12 px-6 w-full sm:w-auto">
              <Home className="w-5 h-5" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
