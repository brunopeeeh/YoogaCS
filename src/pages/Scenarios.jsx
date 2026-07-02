
import React, { useState, useEffect } from "react";
import { Scenario } from "@/entities/all";
import { ensureKnowledgeReady } from "@/entities/Knowledge";
import { useUser } from "../components/auth/UserProvider";
import { Button } from "@/components/ui/button";
import { Plus, Search, BrainCircuit, X, Monitor, Truck, Plug, FileText, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";

const TRAILS = [
  { id: "all",          label: "Todos",        icon: LayoutGrid },
  { id: "PDV",          label: "PDV",           icon: Monitor    },
  { id: "Delivery",     label: "Delivery",      icon: Truck      },
  { id: "Integrações",  label: "Integrações",   icon: Plug       },
  { id: "Fiscal",       label: "Fiscal",        icon: FileText   },
];

function getTrail(scenario) {
  const title = scenario?.title || "";
  if (/^PDV:|Venda Offline|^Caixa:/i.test(title))                        return "PDV";
  if (/^Delivery:/i.test(title))                                          return "Delivery";
  if (/^Fiscal:|NFC-e|Inventário Fiscal/i.test(title))                   return "Fiscal";
  if (/Integra[çc]|iFood|KDS|WhatsApp|PIX Online|Rob[ôo]/i.test(title)) return "Integrações";
  return "Outros";
}

import ScenarioCard from "../components/scenarios/ScenarioCard";
import ScenarioForm from "../components/scenarios/ScenarioForm";
import ScenarioFilters from "../components/scenarios/ScenarioFilters";
import ScenarioGenerator from "../components/scenarios/ScenarioGenerator";

export default function Scenarios() {
  const { user, isLoading: isUserLoading } = useUser();
  const [scenarios, setScenarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    difficulty: "all",
    client_profile: "all",
    status: "all"
  });
  const [activeTrail, setActiveTrail] = useState("all");
  const userRole = user?.role || 'user'; // Derived from the central user context

  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    // Only load scenarios once user data is available (not loading)
    if (!isUserLoading && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadScenarios();

      // Checar se veio query parameter para abrir o gerador de IA automaticamente
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get("generate") === "true" && user?.role === 'admin') {
        setShowGenerator(true);
        // Limpar o parâmetro da URL de forma elegante para evitar reabertura indesejada no F5
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [isUserLoading]); // Only depend on loading state, not user object reference

  const loadScenarios = async () => {
    setIsLoading(true);
    let data;
    try {
      await ensureKnowledgeReady();
      if (user?.role === 'admin') {
        // Admin sees all scenarios
        data = await Scenario.list("-created_date");
      } else {
        // Regular users only see published scenarios with 'ativo' status
        data = await Scenario.filter({ status: "ativo" });
      }
      setScenarios(data);
    } catch (error) {
      console.error("Failed to load scenarios:", error);
      setScenarios([]); // Clear scenarios on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (scenarioData) => {
    if (editingScenario) {
      await Scenario.update(editingScenario.id, scenarioData);
    } else {
      await Scenario.create(scenarioData);
    }
    setShowForm(false);
    setEditingScenario(null);
    loadScenarios();
  };

  const handleDelete = async (scenarioId) => {
    try {
      await Scenario.delete(scenarioId);
      loadScenarios();
    } catch (error) {
      console.error("Failed to delete scenario:", error);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveTrail("all");
    setFilters({
      difficulty: "all",
      client_profile: "all",
      status: "all"
    });
  };

  const handleEdit = (scenario) => {
    if (userRole !== 'admin') return;
    setEditingScenario(scenario);
    setShowForm(true);
  };

  const filteredScenarios = scenarios.filter(scenario => {
    if (!scenario) return false;
    const title = scenario.title || "";
    const description = scenario.description || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filters.difficulty === "all" ||
      scenario.difficulty_level === filters.difficulty ||
      (filters.difficulty === "avançado" && scenario.difficulty_level === "avancado");
    const matchesClientProfile = filters.client_profile === "all" || scenario.client_profile === filters.client_profile;
    const matchesStatus = filters.status === "all" || scenario.status === filters.status;
    const matchesTrail = activeTrail === "all" || getTrail(scenario) === activeTrail;

    return matchesSearch && matchesDifficulty && matchesClientProfile && matchesStatus && matchesTrail;
  });

  // console.log("UserRole in Scenarios:", userRole); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yooga-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Cenários de Treinamento
            </h1>
            <p className="text-slate-600">
              {userRole === 'admin' 
                ? "Crie, gerencie e gere cenários de treinamento com IA"
                : "Explore os cenários disponíveis para praticar"}
            </p>
          </div>
          {userRole === 'admin' && (
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowGenerator(true)}
                variant="outline"
                className="gap-2 h-12 px-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <BrainCircuit className="w-5 h-5" />
                Gerar com IA
              </Button>
              <Button 
                onClick={() => { setEditingScenario(null); setShowForm(true); }}
                className="bg-primary hover:bg-yooga-primary-dark gap-2 h-12 px-6 shadow-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-white font-bold"
              >
                <Plus className="w-5 h-5" />
                Novo Cenário
              </Button>
            </div>
          )}
        </div>

        {/* Trail filter — horizontal pill bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TRAILS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTrail === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTrail(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer select-none
                  ${isActive
                    ? "bg-primary text-white border-primary shadow-md scale-[1.03]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:text-primary hover:shadow-sm"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id !== "all" && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {scenarios.filter(s => getTrail(s) === id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search and secondary Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar cenários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-slate-200/60"
            />
          </div>
          
          <ScenarioFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Form Modals */}
        <AnimatePresence>
          {showForm && userRole === 'admin' && (
            <ScenarioForm
              scenario={editingScenario}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingScenario(null);
              }}
            />
          )}
          {showGenerator && userRole === 'admin' && (
            <ScenarioGenerator
              onCancel={() => setShowGenerator(false)}
              onScenarioGenerated={() => {
                setShowGenerator(false);
                loadScenarios();
              }}
            />
          )}
        </AnimatePresence>

        {/* Scenarios Grid / Skeleton Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="h-6 bg-slate-200 rounded-lg w-2/3"></div>
                  <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-200 rounded-lg w-5/6"></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                  <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="h-8 bg-slate-200 rounded-lg w-20"></div>
                  <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredScenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onEdit={userRole === 'admin' ? handleEdit : undefined}
                  onDelete={userRole === 'admin' ? handleDelete : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredScenarios.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm max-w-lg mx-auto mt-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Nenhum cenário encontrado
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {scenarios.length === 0 
                ? (userRole === 'admin' ? "Comece criando seu primeiro cenário de treinamento ou gere um com IA" : "Não há cenários disponíveis no momento.")
                : "Não encontramos resultados para os filtros selecionados ou termo de busca digitado."
              }
            </p>
            {scenarios.length > 0 ? (
              <Button 
                onClick={handleResetFilters}
                className="bg-primary hover:bg-yooga-primary-dark gap-2 h-11 px-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white font-bold inline-flex items-center cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
                Limpar Filtros e Busca
              </Button>
            ) : (
              userRole === 'admin' && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-primary hover:bg-yooga-primary-dark rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-white font-bold px-5 h-11 inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Cenário
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
