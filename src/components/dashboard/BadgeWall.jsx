import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award, Sparkles, Flame, GraduationCap, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { addNotification } from "@/utils/notification-manager";

const BADGES_CONFIG = [
  {
    id: "first_simulation",
    title: "Primeiro Passo",
    description: "Completou sua primeira simulação de atendimento",
    icon: Award,
    color: "text-blue-500 bg-blue-50 border-blue-100",
    glowColor: "shadow-blue-500/10 border-blue-200"
  },
  {
    id: "perfect_score",
    title: "Nota Perfeita",
    description: "Obteve 90% ou mais em uma simulação",
    icon: Sparkles,
    color: "text-amber-500 bg-amber-50 border-amber-100",
    glowColor: "shadow-amber-500/10 border-amber-200"
  },
  {
    id: "streak_three",
    title: "Consistência de CS",
    description: "Completou 3 ou mais simulações",
    icon: Flame,
    color: "text-rose-500 bg-rose-50 border-rose-100",
    glowColor: "shadow-rose-500/10 border-rose-200"
  },
  {
    id: "first_certification",
    title: "Especialista Certificado",
    description: "Conquistou seu primeiro selo oficial de trilha Yooga",
    icon: GraduationCap,
    color: "text-emerald-500 bg-emerald-50 border-emerald-100",
    glowColor: "shadow-emerald-500/10 border-emerald-200"
  },
  {
    id: "top_performer",
    title: "Top Performer Yooga",
    description: "Média de CS acima de 85% (mínimo 1 simulação)",
    icon: Trophy,
    color: "text-indigo-500 bg-indigo-50 border-indigo-100",
    glowColor: "shadow-indigo-500/10 border-indigo-200"
  }
];

export default function BadgeWall({ simulations = [], certifications = [] }) {
  const completedSims = simulations.filter(s => s.status === "concluida");
  
  // Calcular média geral
  const averageScore = completedSims.length > 0
    ? completedSims.reduce((acc, s) => acc + (s.evaluation?.overall_score ?? 0), 0) / completedSims.length
    : 0;

  // Calcular status das badges
  const earnedStatus = {
    first_simulation: completedSims.length >= 1,
    perfect_score: completedSims.some(s => (s.evaluation?.overall_score ?? 0) >= 90),
    streak_three: completedSims.length >= 3,
    first_certification: certifications.length >= 1,
    top_performer: averageScore >= 85 && completedSims.length >= 1
  };

  useEffect(() => {
    // Verificar se alguma badge foi conquistada AGORA, mas ainda não comemorada
    let triggeredConfetti = false;

    BADGES_CONFIG.forEach(badge => {
      const isEarned = earnedStatus[badge.id];
      if (isEarned) {
        // Salvar conquista permanentemente no localStorage (Opção A)
        localStorage.setItem(`yooga_earned_badge_${badge.id}`, "true");

        // Verificar se já celebramos nesta máquina/navegador
        const hasCelebrated = localStorage.getItem(`yooga_celebrated_badge_${badge.id}`);
        if (!hasCelebrated) {
          triggeredConfetti = true;
          // Marcar como celebrado para evitar disparos repetidos
          localStorage.setItem(`yooga_celebrated_badge_${badge.id}`, "true");

          // Enviar notificação de conquista desbloqueada
          addNotification(
            "Conquista Desbloqueada! 🏆",
            `Você ganhou o selo "${badge.title}": ${badge.description}`,
            "badge",
            { badgeId: badge.id }
          );
        }
      }
    });

    if (triggeredConfetti) {
      // Disparar efeito premium de confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 100 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        // Confetes caindo de posições aleatórias na parte superior da tela
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [simulations, certifications]);

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Mural de Conquistas Yooga CS
        </CardTitle>
        <CardDescription>Estude, simule atendimentos e conquiste insígnias de especialista Yooga!</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {BADGES_CONFIG.map(badge => {
            const isEarned = earnedStatus[badge.id];
            const Icon = badge.icon;

            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center justify-between transition-all duration-300 ${
                  isEarned 
                    ? `bg-white/80 border-slate-200/80 shadow-md hover:scale-[1.03] hover:shadow-lg ${badge.glowColor}`
                    : "bg-slate-50/50 border-slate-100 border-dashed opacity-50 grayscale scale-95"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 shrink-0 ${badge.color} ${isEarned ? "animate-pulse" : ""}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <h4 className="font-extrabold text-xs text-slate-900 mb-1">{badge.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal px-1 font-medium">{badge.description}</p>
                </div>

                <div className="mt-4">
                  {isEarned ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-green-50 text-green-700 uppercase tracking-wider">
                      Conquistado
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-400 uppercase tracking-wider">
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
