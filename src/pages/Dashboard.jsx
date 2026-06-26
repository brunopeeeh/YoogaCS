import React, { useState, useEffect } from "react";
import { Scenario, Simulation } from "@/entities/all";
import { useUser } from "../components/auth/UserProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  Award // Corrected import for Users icon
} from "lucide-react";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentSimulations from "../components/dashboard/RecentSimulations";
import QuickActions from "../components/dashboard/QuickActions";

import { Certification } from "@/entities/Knowledge";
import BadgeWall from "../components/dashboard/BadgeWall";

export default function Dashboard() {
  const { user, isLoading: isUserLoading } = useUser(); // Get user from context
  const [scenarios, setScenarios] = useState([]);
  const [simulations, setSimulations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // This isLoading is for dashboard data, not user loading

  useEffect(() => {
    // Only load dashboard data if the user object is available
    if (user) {
      loadData(user.email);
    }
  }, [user]); // Re-run effect when the user object changes

  const loadData = async (userEmail) => {
    setIsLoading(true);
    try {
      const [scenariosData, simulationsData, certificationsData] = await Promise.all([
        Scenario.list("-created_date"),
        // Filter simulations only for the current user received from context
        Simulation.filter({ created_by: userEmail }, "-created_date", 100),
        Certification.filter({ created_by: userEmail }, "-created_date")
      ]);
      setScenarios(scenariosData);
      setSimulations(simulationsData);
      setCertifications(certificationsData);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      // Clear data on error to prevent displaying stale/incorrect information
      setScenarios([]);
      setSimulations([]);
      setCertifications([]);
    }
    setIsLoading(false);
  };

  const getStats = () => {
    const completedSimulations = simulations.filter(s => s.status === "concluida");
    const averageScore = completedSimulations.length > 0 
      ? Math.round(completedSimulations.reduce((acc, sim) => acc + (sim.evaluation?.overall_score || 0), 0) / completedSimulations.length)
      : 0;
    
    return {
      totalScenarios: scenarios.length,
      totalSimulations: simulations.length,
      completedSimulations: completedSimulations.length,
      averageScore
    };
  };

  const stats = getStats();

  // Optionally, show a loading state for the entire dashboard while user is loading
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <p className="text-xl text-slate-700">Carregando usuário...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Dashboard de Treinamento
            </h1>
            <p className="text-slate-600 text-lg">
              Acompanhe seu progresso e inicie novas simulações
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Scenarios")}>
              <Button variant="outline" className="gap-2 h-12 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
                <BookOpen className="w-5 h-5" />
                Explorar Cenários
              </Button>
            </Link>
            <Link to={createPageUrl("Simulator")}>
              <Button className="bg-[#002D62] hover:bg-[#004094] gap-2 h-12 px-6 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-white font-bold rounded-xl">
                <MessageSquare className="w-5 h-5" />
                Nova Simulação
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsOverview 
            title="Cenários Disponíveis"
            value={stats.totalScenarios}
            icon={BookOpen}
            gradient="from-blue-500 to-blue-600"
            description="Cenários para treinar"
          />
          <StatsOverview 
            title="Minhas Simulações"
            value={stats.totalSimulations}
            icon={MessageSquare}
            gradient="from-green-500 to-green-600"
            description="Total realizadas"
          />
          <StatsOverview 
            title="Taxa de Conclusão"
            value={`${stats.totalSimulations > 0 ? Math.round((stats.completedSimulations / stats.totalSimulations) * 100) : 0}%`}
            icon={Award}
            gradient="from-[#002D62] to-[#004094]"
            description="Simulações finalizadas"
          />
          <StatsOverview 
            title="Minha Pontuação Média"
            value={`${stats.averageScore}%`}
            icon={TrendingUp}
            gradient="from-orange-500 to-orange-600"
            description="Meu desempenho"
          />
        </div>

        {/* Mural de Conquistas */}
        {!isLoading && (
          <BadgeWall simulations={simulations} certifications={certifications} />
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentSimulations 
              simulations={simulations}
              isLoading={isLoading}
            />
          </div>
          
          <div>
            <QuickActions 
              scenarios={scenarios}
              onRefresh={() => user && loadData(user.email)} // Pass user's email for refresh
              userRole={user?.role} // Pass user's role from context
            />
          </div>
        </div>
      </div>
    </div>
  );
}
