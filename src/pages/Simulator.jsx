
import React, { useState, useEffect, useRef } from "react";
import { Scenario, Simulation, CompanyProfile, AgentPerformance } from "@/entities/all";
import { useUser } from "../components/auth/UserProvider";
import { InvokeLLM, GetSemanticFaqContext, NudgeClient } from "@/integrations/Core";
import { getKnowledgeForScenario, analyzeAgentCoverage } from "@/data/yooga-knowledge-base";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Module, Article, ensureKnowledgeReady } from "@/entities/Knowledge";
import { addNotification } from "@/utils/notification-manager";

import ScenarioSelector from "../components/simulator/ScenarioSelector";
import ChatInterface from "../components/simulator/ChatInterface";
import SimulationResults from "../components/simulator/SimulationResults";
import SuggestionModal from "../components/simulator/SuggestionModal";

export default function Simulator() {
  const { user, isLoading: isUserLoading } = useUser();
  const [searchParams] = useSearchParams();
  const deepLinkScenarioId = searchParams.get("scenario");
  const [scenarios, setScenarios] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [simulationResults, setSimulationResults] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionsUsed, setSuggestionsUsed] = useState(0);
  const [modules, setModules] = useState([]);
  const [prefillMessage, setPrefillMessage] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const MAX_SUGGESTIONS = 2;

  const responseTimeoutRef = useRef(null);
  const nudgeTimerRef = useRef(null);
  const pendingAgentMessagesRef = useRef([]);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  // Effect to set agent name when user data is available from the context
  useEffect(() => {
    if (user) {
      const userName = user.full_name || user.email.split('@')[0] || user.email;
      setAgentName(userName);
    }
  }, [user]);

  // Effect to load initial data (scenarios, company profile)
  useEffect(() => {
    loadInitialData();
  }, []);

  // Deep link: ?scenario=<id>
  useEffect(() => {
    if (!deepLinkScenarioId || scenarios.length === 0 || isSimulating) return;
    const match = scenarios.find(s => s.id === deepLinkScenarioId);
    if (match) setSelectedScenario(match);
  }, [deepLinkScenarioId, scenarios, isSimulating]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      await ensureKnowledgeReady();
      const [scenariosData, profilesData, modulesData] = await Promise.all([
        Scenario.filter({ status: "ativo" }, "-created_date"),
        CompanyProfile.list(),
        Module.list()
      ]);
      setScenarios(scenariosData);
      setModules(modulesData);
      if (profilesData.length > 0) {
        setCompanyProfile(profilesData[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const startSimulation = async () => {
    if (!selectedScenario || !agentName.trim()) return;

    setIsSimulating(true);
    setMessages([]);
    setSuggestionsUsed(0);
    setSuggestion(null);
    setIsLoading(true); // Exibe loading durante a geração da saudação inicial

    try {
      const simulation = await Simulation.create({
        scenario_id: selectedScenario.id,
        agent_name: agentName.trim(),
        messages: [],
        status: "em_andamento",
        created_by: user?.email?.toLowerCase() || 'local'
      });

      setCurrentSimulation(simulation);

      // Gerar saudação inicial dinâmica e curta
      const clientMessage = await generateClientResponse(null, [], selectedScenario);

      const newMessages = [{
        sender: "client",
        message: clientMessage,
        timestamp: new Date().toISOString()
      }];

      setMessages(newMessages);

      await Simulation.update(simulation.id, {
        messages: newMessages
      });
    } catch (error) {
      console.error("Erro ao iniciar simulação:", error);
      setIsSimulating(false);
      setCurrentSimulation(null);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateClientResponse = async (agentMessage, messageHistory, scenario) => {
    if (!scenario) return "Olá! Como posso ajudar?";
    const knowledgeBase = getKnowledgeForScenario(scenario.title);
    const scenarioContext = scenario.context || knowledgeBase?.defaultContext || null;

    try {
      const response = await InvokeLLM({
        prompt: agentMessage || "",
        history: messageHistory.slice(0, -1).map(m => ({ sender: m.sender, message: m.message })),
        client_profile: scenario.client_profile,
        initial_problem: scenario.initial_problem,
        scenario_title: scenario.title,
        scenario_context: scenarioContext,
        expected_interactions: scenario.expected_interactions || 4,
        response_json_schema: {} // Empty schema = simulate endpoint
      });
      return response;
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      return "Desculpe, deu uma oscilada na minha internet aqui. O que você me orienta a fazer?";
    }
  };

  const getClientProfileInstructions = (profile) => {
    const instructions = {
      irritado: "Demonstre frustração, seja direto, pode usar linguagem mais incisiva. Questione prazos e eficiência. Escalará rapidamente se não for bem atendido.",
      confuso: "Faça muitas perguntas, peça esclarecimentos, demonstre dificuldade em entender processos técnicos. Seja hesitante.",
      objetivo: "Seja direto, pragmático, focado na solução. Quer respostas rápidas e claras. Pode fazer perguntas técnicas específicas.",
      indeciso: "Demonstre incerteza, mude de opinião, peça múltiplas opções. Pode voltar atrás em decisões.",
      emotivo: "Use emojis, seja expressivo, demonstre gratidão quando bem atendido. Pode ficar mais sensível com problemas.",
      impaciente: "Pressione por rapidez, mencione pressa, pode interromper explicações longas. 'Preciso resolver isso agora!'",
      detalhista: "Faça perguntas específicas, queira entender processos completos, peça documentação ou passos detalhados."
    };
    return instructions[profile] || "Seja natural e realista conforme seu perfil de cliente.";
  };

  const sendMessage = async (messageText, imageUrl = null) => {
    if (!messageText.trim() && !imageUrl) return;
    if (!currentSimulation) return;

    const agentMessage = {
      sender: "agent",
      message: messageText.trim(),
      ...(imageUrl ? { image_url: imageUrl } : {}),
      timestamp: new Date().toISOString()
    };

    // Acumula mensagens no ref para evitar race condition entre chamadas rápidas
    const updatedMessages = [...(messagesRef.current || []), agentMessage];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    pendingAgentMessagesRef.current.push(messageText.trim());

    // Fire-and-forget para não bloquear chamadas consecutivas do usuário
    Simulation.update(currentSimulation.id, { messages: updatedMessages })
      .catch(err => console.error("Erro ao sincronizar mensagem:", err));

    // Limpar timers anteriores se o atendente continuar enviando mensagens consecutivas
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
    }

    // Debounce de 12 segundos para rodar a resposta da IA (WhatsApp Dynamics - mais tempo para o analista digitar em sequência)
    responseTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);

      try {
        // Agrupar todas as mensagens do atendente pendentes enviadas nesta rodada
        const accumulatedText = pendingAgentMessagesRef.current.join(" \n ");
        pendingAgentMessagesRef.current = [];

        const clientResponse = await generateClientResponse(accumulatedText, messagesRef.current, selectedScenario);

        // Suporte ao "Double Texting" delimitado por ||
        const parts = clientResponse.split("||").map(p => p.trim()).filter(Boolean);

        let currentList = [...messagesRef.current];

        for (let i = 0; i < parts.length; i++) {
          // Delay de digitação dinâmico para segunda mensagem consecutiva do cliente
          if (i > 0) {
            setIsLoading(true);
            const delay = Math.min(2500, Math.max(1000, parts[i].length * 35));
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          const partMessage = {
            sender: "client",
            message: parts[i],
            timestamp: new Date().toISOString()
          };

          currentList = [...currentList, partMessage];
          setMessages(currentList);

          await Simulation.update(currentSimulation.id, {
            messages: currentList
          });
        }

        // Iniciar timer de nudge (20s) para perfis impacientes/irritados
        nudgeTimerRef.current = setTimeout(async () => {
          try {
            const result = await NudgeClient({
              client_profile: selectedScenario.client_profile,
              history: messagesRef.current.map(m => ({ sender: m.sender, message: m.message })),
              scenario_title: selectedScenario.title
            });
            if (result.should_nudge && result.nudge) {
              const nudgeMessage = {
                sender: "client",
                message: result.nudge,
                timestamp: new Date().toISOString()
              };
              const updatedList = [...messagesRef.current, nudgeMessage];
              setMessages(updatedList);
              await Simulation.update(currentSimulation.id, { messages: updatedList });
            }
          } catch (err) {
            console.warn("Nudge timer error:", err);
          }
        }, 60000);

      } catch (error) {
        console.error("Erro ao gerar resposta do cliente:", error);
      } finally {
        setIsLoading(false);
      }
    }, 12000);
  };

  const handleAgentTyping = () => {
    // Se não há simulação em andamento ou a IA está pensando/processando, ignora
    if (!currentSimulation || isLoading) return;

    // Se o timer de nudge está ativo, vamos reiniciá-lo por mais 60 segundos
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
    }
    
    // Só reagendar se a última mensagem no chat for do cliente
    const lastMsg = messagesRef.current[messagesRef.current.length - 1];
    if (lastMsg && lastMsg.sender === "client") {
      nudgeTimerRef.current = setTimeout(async () => {
        try {
          const result = await NudgeClient({
            client_profile: selectedScenario.client_profile,
            history: messagesRef.current.map(m => ({ sender: m.sender, message: m.message })),
            scenario_title: selectedScenario.title
          });
          if (result.should_nudge && result.nudge) {
            const nudgeMessage = {
              sender: "client",
              message: result.nudge,
              timestamp: new Date().toISOString()
            };
            const updatedList = [...messagesRef.current, nudgeMessage];
            setMessages(updatedList);
            await Simulation.update(currentSimulation.id, { messages: updatedList });
          }
        } catch (err) {
          console.warn("Nudge timer error:", err);
        }
      }, 60000);
    }
  };

  const handleRequestSuggestion = async () => {
    if (suggestionsUsed >= MAX_SUGGESTIONS || isLoading || !selectedScenario) return;

    setIsLoading(true);
    
    const tone_of_voice = companyProfile?.tone_of_voice || "Padrão da Yooga: Disponibilidade (24h), Proatividade, Conhecimento Técnico, Empatia e Humor apropriado.";

    const knowledgeBase = getKnowledgeForScenario(selectedScenario.title);
    let requiredPointsHint = "";
    
    if (knowledgeBase) {
      const coverage = analyzeAgentCoverage(messages, knowledgeBase.requiredPoints);
      if (coverage.missing.length > 0) {
        requiredPointsHint = `\n\nPONTOS QUE O AGENTE AINDA NÃO COBRIU (a sugestão DEVE incluir esses pontos):\n${coverage.missing.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
      }
    }

    const lastMessage = messages.length > 0 ? messages[messages.length - 1].message : "Nenhuma mensagem ainda.";

    const prompt = `
Cenário de Atendimento: "${selectedScenario.title}"
Perfil de Cliente: "${selectedScenario.client_profile}"
Diretrizes de Tom da Empresa: "${tone_of_voice}"

Conversa atual:
${messages.map(m => `${m.sender === 'agent' ? 'AGENTE EM TREINAMENTO' : 'CLIENTE'}: ${m.message}`).join('\n')}

Última mensagem do cliente: "${lastMessage}"

Forneça o objeto JSON com "suggested_response" e "reasoning" em português.`;

    try {
      const response = await InvokeLLM({
        prompt: prompt,
        history: messages.map(m => ({ sender: m.sender, message: m.message })),
        scenario_title: selectedScenario.title,
        required_points_hint: requiredPointsHint,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_response: { type: "string" },
            reasoning: { type: "string" }
          },
          required: ["suggested_response", "reasoning"]
        }
      });
      setSuggestion(response);
      setSuggestionsUsed(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao gerar sugestão:", error);
      setSuggestion({
        suggested_response: "Desculpe, não consegui obter uma sugestão do Coach de IA no momento.",
        reasoning: "Houve um erro de comunicação com os servidores de IA."
      });
    }
    setIsLoading(false);
  };

  const clearSuggestion = () => {
    setSuggestion(null);
  };

  const endSimulation = async () => {
    if (!currentSimulation) return;

    setIsLoading(true);

    try {
      const evaluation = await generateEvaluation();

      const finalScore = Math.max(0, (evaluation.overall_score || 0) - (suggestionsUsed * 5));
      evaluation.overall_score = finalScore;

      const endTime = new Date();
      const startTime = new Date(currentSimulation.created_date);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

      await Simulation.update(currentSimulation.id, {
        status: "concluida",
        duration_minutes: durationMinutes,
        evaluation: evaluation,
        suggestions_used: suggestionsUsed,
        messages: messages
      });

      addNotification(
        "Simulação Concluída!",
        `Você obteve nota ${evaluation.overall_score}% no cenário "${selectedScenario?.title || 'Cenário'}".`,
        "simulation",
        { simulationId: currentSimulation.id }
      );

      setSimulationResults({
        ...currentSimulation,
        messages: messages,
        evaluation,
        duration_minutes: durationMinutes,
        suggestions_used: suggestionsUsed
      });

      setIsSimulating(false);
    } catch (error) {
      console.error("Erro ao finalizar simulação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEvaluation = async () => {
    if (!selectedScenario) {
      return {
        overall_score: 50,
        empathy_score: 50,
        resolution_score: 50,
        professionalism_score: 50,
        agility_score: 50,
        feedback: "Cenário não disponível para avaliação.",
        strengths: [],
        improvements: ["Selecione um cenário para avaliação"],
        weak_areas: [],
        recommended_training_topics: []
      };
    }
    const knowledgeBase = getKnowledgeForScenario(selectedScenario.title);
    let faqContext = "";
    let checklistSection = "";
    let scoringRulesSection = "";
    let commonMistakesSection = "";

    if (knowledgeBase) {
      faqContext = knowledgeBase.technicalContent;
      
      const coverage = analyzeAgentCoverage(messages, knowledgeBase.requiredPoints);

      checklistSection = `

═══ CHECKLIST DE PONTOS OBRIGATÓRIOS (${coverage.covered.length}/${knowledgeBase.requiredPoints.length} cobertos = ${coverage.coveragePercent}%) ═══
PONTOS QUE O AGENTE COBRIU:
${coverage.covered.length > 0 ? coverage.covered.map(p => `  ✅ ${p}`).join('\n') : '  (Nenhum ponto coberto)'}

PONTOS QUE O AGENTE NÃO COBRIU:
${coverage.missing.length > 0 ? coverage.missing.map(p => `  ❌ ${p}`).join('\n') : '  (Todos os pontos foram cobertos! Excelente!)'}

IMPORTANTE: Use essa análise de cobertura como BASE PRINCIPAL para a nota de resolution_score.
- Cobertura 100% = nota de resolução entre 90-100
- Cobertura 80%+ = nota de resolução entre 75-89
- Cobertura 50-79% = nota de resolução entre 50-74
- Cobertura abaixo de 50% = nota de resolução entre 0-49`;

      if (knowledgeBase.commonMistakes) {
        commonMistakesSection = `\n\n═══ ERROS COMUNS A VERIFICAR (penalizam a nota) ═══\n${knowledgeBase.commonMistakes.map(m => `  ⚠️ ${m}`).join('\n')}`;
      }

      if (knowledgeBase.scoringCriteria) {
        const sc = knowledgeBase.scoringCriteria;
        scoringRulesSection = `\n\n═══ CRITÉRIOS DE PONTUAÇÃO ESPECÍFICOS DESTE CENÁRIO ═══
- RESOLUÇÃO: ${sc.resolution}
- EMPATIA: ${sc.empathy}
- AGILIDADE: ${sc.agility}
- PROFISSIONALISMO: ${sc.professionalism}`;
      }
    } else {
      try {
        faqContext = await GetSemanticFaqContext(selectedScenario.initial_problem);
        if (!faqContext && selectedScenario.moduleId) {
          const articles = await Article.filter({ moduleId: selectedScenario.moduleId });
          if (articles && articles.length > 0) {
            faqContext = articles.map(a => `- Artigo: "${a.title}"\n  Conteúdo Técnico:\n  ${a.content}`).join("\n\n");
          }
        }
      } catch (err) {
        console.error("Erro ao buscar contexto RAG para avaliação:", err);
      }
    }

    try {
      const response = await InvokeLLM({
        prompt: `Cenário: "${selectedScenario.title}" | Perfil: "${selectedScenario.client_profile}" | Problema: "${selectedScenario.initial_problem}"`,
        history: messages,
        goals: selectedScenario.goals,
        scenario_title: selectedScenario.title,
        faq_context: faqContext,
        checklist_section: checklistSection,
        common_mistakes_section: commonMistakesSection,
        scoring_rules_section: scoringRulesSection,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number", minimum: 0, maximum: 100 },
            empathy_score: { type: "number", minimum: 0, maximum: 100 },
            resolution_score: { type: "number", minimum: 0, maximum: 100 },
            professionalism_score: { type: "number", minimum: 0, maximum: 100 },
            agility_score: { type: "number", minimum: 0, maximum: 100 },
            feedback: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            weak_areas: { type: "array", items: { type: "string" } },
            recommended_training_topics: { type: "array", items: { type: "string" } }
          },
          required: ["overall_score", "empathy_score", "resolution_score", "professionalism_score", "agility_score", "feedback", "strengths", "improvements", "weak_areas", "recommended_training_topics"]
        }
      });

      // Salvar análise de performance do agente
      try {
        if (user) {
          await AgentPerformance.create({
            agent_email: user.email,
            weak_areas: response.weak_areas || [],
            strong_areas: response.strengths || [],
            last_analysis_date: new Date().toISOString(),
            recommended_scenarios: response.recommended_training_topics || []
          });
        }
      } catch (perfError) {
        console.log("Erro ao salvar performance:", perfError);
      }

      return response;
    } catch (error) {
      console.error("Erro ao gerar avaliação:", error);
      return {
        overall_score: 75,
        empathy_score: 75,
        resolution_score: 75,
        professionalism_score: 75,
        agility_score: 75,
        feedback: "Avaliação indisponível no momento devido a erro de IA.",
        strengths: ["Manteve profissionalismo"],
        improvements: ["Pratique mais cenários com o FAQ da Yooga"],
        weak_areas: [],
        recommended_training_topics: []
      };
    }
  };

  const resetSimulation = () => {
    if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    pendingAgentMessagesRef.current = [];
    setSelectedScenario(null);
    setCurrentSimulation(null);
    setMessages([]);
    setIsSimulating(false);
    setSimulationResults(null);
    setSuggestionsUsed(0);
    setSuggestion(null);
    // Manter o nome do usuário após reset, usando o user do hook
    if (user) {
      const userName = user.full_name || user.email.split('@')[0] || user.email;
      setAgentName(userName);
    }
  };

  if (simulationResults) {
    return (
      <SimulationResults 
        results={simulationResults}
        scenario={selectedScenario}
        onRestart={resetSimulation}
        maxSuggestions={MAX_SUGGESTIONS}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")} aria-label="Voltar para Dashboard">
            <Button variant="outline" size="icon" className="h-12 w-12">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Simulador de Atendimento
            </h1>
            <p className="text-slate-600 mt-1">
              Pratique suas habilidades com simulações realistas
            </p>
          </div>
        </div>

        {!isSimulating ? (
          isLoadingData ? (
            <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
          <ScenarioSelector 
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onScenarioSelect={setSelectedScenario}
            agentName={agentName}
            onStartSimulation={startSimulation}
            modules={modules}
          />
          )
        ) : (
          <ChatInterface 
            scenario={selectedScenario}
            messages={messages}
            onSendMessage={sendMessage}
            onEndSimulation={endSimulation}
            isLoading={isLoading}
            agentName={agentName}
            onRequestSuggestion={handleRequestSuggestion}
            suggestionsUsed={suggestionsUsed}
            maxSuggestions={MAX_SUGGESTIONS}
            prefillMessage={prefillMessage}
            onPrefillConsumed={() => setPrefillMessage("")}
            onTyping={handleAgentTyping}
          />
        )}

        {suggestion && (
          <SuggestionModal
            suggestionData={suggestion}
            onClose={clearSuggestion}
            onUseSuggestion={(text) => {
              setPrefillMessage(text);
              clearSuggestion();
            }}
          />
        )}
      </div>
    </div>
  );
}
