
import React, { useState, useEffect, useRef } from "react";
import { Scenario, Simulation, CompanyProfile, AgentPerformance } from "@/entities/all";
import { useUser } from "../components/auth/UserProvider";
import { InvokeLLM, GetSemanticFaqContext } from "@/integrations/Core";
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
  const pendingAgentMessagesRef = useRef([]);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) clearTimeout(responseTimeoutRef.current);
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
    const scenarioId = searchParams.get("scenario");
    if (!scenarioId || scenarios.length === 0 || isSimulating) return;
    const match = scenarios.find(s => s.id === scenarioId);
    if (match) setSelectedScenario(match);
  }, [searchParams, scenarios, isSimulating]);

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
    const file_urls = companyProfile?.knowledge_base_files?.map(f => f.url) || [];
    const tone_of_voice = companyProfile?.tone_of_voice || "Padrão da Yooga: Disponibilidade (24h), Proatividade, Conhecimento Técnico, Empatia e Humor apropriado.";

    // Simular comportamento sazonal
    const currentHour = new Date().getHours();
    const isPeakHour = currentHour >= 8 && currentHour <= 18;
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

    // ═══ BASE DE CONHECIMENTO ESTRUTURADA (Prioridade 1) ═══
    const knowledgeBase = getKnowledgeForScenario(scenario.title);
    let faqContext = "";
    
    if (knowledgeBase) {
      faqContext = knowledgeBase.technicalContent;
    } else {
      // Fallback: RAG Semântico Local-First
      try {
        const queryText = agentMessage || scenario.initial_problem;
        faqContext = await GetSemanticFaqContext(queryText);
        
        if (!faqContext && scenario.moduleId) {
          const articles = await Article.filter({ moduleId: scenario.moduleId });
          if (articles && articles.length > 0) {
            faqContext = articles.map(a => `- Artigo: "${a.title}"\n  Conteúdo Técnico:\n  ${a.content}`).join("\n\n");
          }
        }
      } catch (err) {
        console.error("Erro ao buscar contexto RAG de FAQ:", err);
      }
    }

    const agentInteractions = messageHistory.filter(m => m.sender === 'agent').length;
    let forceEndingInstruction = "";

    if (agentInteractions >= 1) {
      const lowerAgentMsg = agentMessage ? agentMessage.toLowerCase() : "";
      
      // Mapeamento de termos de validação técnica por cenário
      const keywordsMap = {
        "venda offline": ["salv", "navegador", "fech", "limp", "sincroniz", "off", "contingencia"],
        "ifood": ["vinc", "categori", "sincroniz", "preço", "painel", "portal"],
        "fiscal": ["csc", "sefaz", "produção", "certificado", "digital", "contador", "nfc"],
        "nfc-e": ["csc", "sefaz", "produção", "certificado", "digital", "contador", "nfc"],
        "impressora": ["largura", "bobina", "58mm", "margem", "margens", "horizontal"],
        "pagamento": ["parcial", "adicionar", "dividir", "pix", "dinheiro", "fechamento"],
        "segurança": ["cargo", "permissao", "senha", "cancelamento", "gerente", "administrador"],
        "delivery": ["ajust", "configur", "habilit", "painel", "acompanh", "loja", "chat", "cliente"]
      };

      const titleLower = (scenario?.title || "").toLowerCase();
      let keywords = ["ajuda", "suporte"];
      for (const [key, list] of Object.entries(keywordsMap)) {
        if (titleLower.includes(key)) {
          keywords = list;
          break;
        }
      }

      const historyText = messageHistory.map(m => m.message.toLowerCase()).join(" ");
      const hasTechnicalMention = keywords.some(kw => historyText.includes(kw) || lowerAgentMsg.includes(kw));
      const hasEndingMention = ["obrigado", "tchau", "abraco", "tarde", "dia", "finalizar", "concluir", "ajudar em algo", "disposicao"].some(kw => lowerAgentMsg.includes(kw));

      if (hasTechnicalMention || agentInteractions >= (scenario.expected_interactions || 4) - 1 || hasEndingMention) {
        forceEndingInstruction = `
[DIRETRIZ DE ENCERRAMENTO ABSOLUTO - CRÍTICO E OBRIGATÓRIO]:
Você recebeu as orientações corretas baseadas na Central de Ajuda ou o atendimento está se aproximando do fim.
Você deve demonstrar imenso alívio e satisfação com a resposta do atendente.
Sua próxima resposta DEVE ser uma mensagem de agradecimento conclusiva e uma despedida amigável (ex: "Que alívio! Muito obrigado pela ajuda rápida, agora entendi tudo de verdade. Vou fazer exatamente esse passo a passo! Um abraço e boa semana!").
Você está terminantemente PROIBIDO de fazer novas reclamações, fingir que o erro continua ou estender o chat. Apenas se despeça.`;
      }
    }

    let firstMessageInstruction = "";
    if (messageHistory.length === 0) {
      firstMessageInstruction = `
[DIRETRIZ DE INÍCIO DE CHAT - CRÍTICA E ABSOLUTA]:
Esta é a PRIMEIRA mensagem do chat.
Você deve se comportar exatamente como um humano real iniciando um atendimento de suporte no WhatsApp:
1. Mande APENAS uma saudação inicial extremamente curta e informal (ex: "Oi, boa noite!", "Opa, tudo bem? Tem alguém aí?", "Socorro!").
2. Fica TERMINANTEMENTE PROIBIDO descrever, detalhar ou agrupar o seu problema técnico ("${scenario.initial_problem}") junto com a saudação na primeira mensagem. Não diga o que está acontecendo ainda!
3. Envie apenas a saudação curta e espere o atendente de CS responder para só então começar a explicar o problema de forma progressiva.`;
    }

    const systemInstruction = `Você é um cliente real da Yooga no chat de suporte, conversando com o atendimento de Customer Success (CS).
Seu perfil psicológico de cliente é: ${scenario.client_profile.toUpperCase()}.
Aja estritamente conforme seu perfil psicológico:
${getClientProfileInstructions(scenario.client_profile)}

Você tem o seguinte problema inicial de suporte: "${scenario.initial_problem}".
Abaixo está o FAQ técnico oficial da Yooga para sua referência. O atendente da Yooga precisa te passar orientações compatíveis com este FAQ para resolver seu problema:
${faqContext}

⚠️⚠️ DIRETRIZES CRÍTICAS DE CONVERSAÇÃO E INTERATIVIDADE (OBRIGATÓRIO):
1. **Atendimento Progressivo (Estilo WhatsApp):** Conduza a conversa de forma extremamente gradual e natural. Faça apenas uma pergunta ou comentário curto por vez. Nunca agrupe múltiplas queixas ou explicações longas na mesma resposta. Sempre espere o atendente responder ou te fazer perguntas específicas antes de avançar para o próximo passo.
2. **Foco e Reatividade Estrita:** Responda exclusivamente ao que o atendente acabou de te dizer na última mensagem. Aja como um ser humano real no chat, nunca como um assistente de IA.
3. **Anti-Vazamento de Contexto (NÃO ANTECIPE):** Nunca mencione ou discuta partes da solução (como caminhos de menu, chaves de acesso, configurações) que o atendente ainda não tiver abordado ativamente. Se o atendente apenas te cumprimentou ou fez uma pergunta inicial genérica, reaja de forma natural, simples e informal de acordo com o seu perfil, sem adivinhar a solução antes da hora.
4. **Respostas Curtas e Realistas:** Mantenha suas mensagens curtas (no máximo 2 ou 3 frases curtas por mensagem). Use abreviações comuns de chat em português (como "vc", "tb", "obg", "tá", "pra") de forma natural.
5. **Envio Consecutivo (Double Texting):** Sempre que fizer sentido para dar dinamismo, divida a sua mensagem em duas partes usando o delimitador "||" para simular o envio de mensagens consecutivas (ex: "Nossa, que dor de cabeça! || Pior que meu restaurante tá cheio...").

⚠️⚠️ RECONHECIMENTO DE SOLUÇÃO E ENCERRAMENTO (OBRIGATÓRIO):
Avalie a última mensagem enviada pelo atendente de CS:
- Se a resposta dele contiver as orientações corretas, os passos operacionais ou caminhos de menu equivalentes aos descritos no FAQ oficial fornecido acima, você DEVE aceitar a solução imediatamente.
- Fica proibido continuar teimoso, fingir que não funcionou ou fazer novas perguntas capciosas quando a instrução correta do FAQ já tiver sido repassada com clareza e empatia.
- Responda demonstrando alívio e satisfação, confirme o entendimento e despeça-se de forma amigável (ex: "Que ótimo! Muito obrigado pela ajuda rápida, agora entendi tudo de verdade. Vou fazer exatamente esse passo a passo. Um abraço e boa semana!").
${forceEndingInstruction}
${firstMessageInstruction}`;

    const prompt = `
Histórico de Conversa até o momento:
${messageHistory.length === 0 ? "Nenhuma mensagem trocada ainda. Inicie a conversa explicando o seu problema de forma natural." : messageHistory.map(m => `${m.sender === 'agent' ? 'AGENTE DE CS' : 'CLIENTE (VOCÊ)'}: ${m.message}`).join('\n')}

${messageHistory.length > 0 ? `Última mensagem do Agente de CS: "${agentMessage}"` : ""}

Abaixo está o seu contexto temporal:
- ${isPeakHour ? "Horário comercial de pico! Seu restaurante está cheio e você tem pressa." : "Horário tranquilo de baixo movimento."}
- ${isWeekend ? "Fim de semana! O movimento está intenso e você está tenso com o problema." : "Dia útil comum."}

Gere sua próxima resposta curta como o cliente Yooga no chat.`;

    try {
      const response = await InvokeLLM({
        prompt: agentMessage || "",
        system_instruction: systemInstruction,
        history: messageHistory.slice(0, -1).map(m => ({ sender: m.sender, message: m.message })),
        client_profile: scenario.client_profile,
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

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !currentSimulation) return;

    // Adicionar imediatamente a mensagem do atendente ao chat para exibição instantânea
    const agentMessage = {
      sender: "agent",
      message: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messagesRef.current, agentMessage];
    setMessages(updatedMessages);
    pendingAgentMessagesRef.current.push(messageText.trim());

    try {
      await Simulation.update(currentSimulation.id, {
        messages: updatedMessages
      });
    } catch (error) {
      console.error("Erro ao sincronizar mensagem do agente no banco:", error);
    }

    // Limpar o timeout anterior se o atendente continuar enviando mensagens consecutivas
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }

    // Debounce de 2 segundos para rodar a resposta da IA (WhatsApp Dynamics)
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
          // Simular delay de digitação dinâmico para a segunda mensagem consecutiva do cliente
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
      } catch (error) {
        console.error("Erro ao gerar resposta do cliente:", error);
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  const handleRequestSuggestion = async () => {
    if (suggestionsUsed >= MAX_SUGGESTIONS || isLoading) return;

    setIsLoading(true);
    
    const file_urls = companyProfile?.knowledge_base_files?.map(f => f.url) || [];
    const tone_of_voice = companyProfile?.tone_of_voice || "Padrão da Yooga: Disponibilidade (24h), Proatividade, Conhecimento Técnico, Empatia e Humor apropriado.";

    // ═══ BASE DE CONHECIMENTO ESTRUTURADA PARA SUGESTÃO ═══
    const knowledgeBase = getKnowledgeForScenario(selectedScenario.title);
    let faqContext = "";
    let requiredPointsHint = "";
    
    if (knowledgeBase) {
      faqContext = knowledgeBase.technicalContent;
      // Informar ao Coach quais pontos o agente AINDA NÃO cobriu
      const coverage = analyzeAgentCoverage(messages, knowledgeBase.requiredPoints);
      if (coverage.missing.length > 0) {
        requiredPointsHint = `\n\nPONTOS QUE O AGENTE AINDA NÃO COBRIU (a sugestão DEVE incluir esses pontos):\n${coverage.missing.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
      }
    } else {
      try {
        const lastClientMessage = messages.length > 0 ? messages[messages.length - 1].message : selectedScenario.initial_problem;
        faqContext = await GetSemanticFaqContext(lastClientMessage);
        if (!faqContext && selectedScenario.moduleId) {
          const articles = await Article.filter({ moduleId: selectedScenario.moduleId });
          if (articles && articles.length > 0) {
            faqContext = articles.map(a => `- Artigo: "${a.title}"\n  Conteúdo Técnico:\n  ${a.content}`).join("\n\n");
          }
        }
      } catch (err) {
        console.error("Erro ao buscar contexto RAG para sugestão:", err);
      }
    }

    const systemInstruction = `Você é um Coach Sênior e Líder de Customer Success na Yooga.
Sua missão é dar a melhor sugestão de resposta para um agente em treinamento que está no chat com um cliente Yooga.
Sua resposta e direcionamento devem focar estritamente nas 5 Regras de Ouro (Pilares) de CS da Yooga:
1. Disponibilidade
2. Proatividade
3. Conhecimento Técnico (baseado nos manuais/FAQ da Yooga)
4. Empatia
5. Humor apropriado

Abaixo está o conteúdo técnico oficial da Yooga para este cenário. Sugira instruções que guiem o agente a repassar essas orientações perfeitamente:
${faqContext}
${requiredPointsHint}

Responda APENAS com um objeto JSON válido contendo duas chaves:
- "suggested_response": O texto exato da resposta ideal em português que o agente de CS deve copiar e colar para o cliente. Use um tom empático, proativo, claro e contendo as instruções corretas do FAQ Yooga.
- "reasoning": A justificativa do porquê essa resposta é perfeita, detalhando quais pilares da Yooga ela cumpre e qual instrução técnica do FAQ ela aplica.`;

    const prompt = `
Cenário de Atendimento: "${selectedScenario.title}"
Perfil de Cliente: "${selectedScenario.client_profile}"
Diretrizes de Tom da Empresa: "${tone_of_voice}"

Conversa atual:
${messages.map(m => `${m.sender === 'agent' ? 'AGENTE EM TREINAMENTO' : 'CLIENTE'}: ${m.message}`).join('\n')}

Última mensagem do cliente: "${messages[messages.length - 1].message}"

Forneça o objeto JSON com "suggested_response" e "reasoning" em português.`;

    try {
      const response = await InvokeLLM({
        prompt: prompt,
        system_instruction: systemInstruction,
        history: messages.map(m => ({ sender: m.sender, message: m.message })),
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
    const file_urls = companyProfile?.knowledge_base_files?.map(f => f.url) || [];
    const tone_of_voice = companyProfile?.tone_of_voice || "Padrão da Yooga: Disponibilidade (24h), Proatividade, Conhecimento Técnico, Empatia e Humor apropriado.";

    // ═══ BASE DE CONHECIMENTO ESTRUTURADA PARA AVALIAÇÃO ═══
    const knowledgeBase = getKnowledgeForScenario(selectedScenario.title);
    let faqContext = "";
    let checklistSection = "";
    let scoringRulesSection = "";
    let commonMistakesSection = "";

    if (knowledgeBase) {
      faqContext = knowledgeBase.technicalContent;
      
      // Análise automática de cobertura dos pontos obrigatórios
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
      // Fallback: RAG antigo
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

    const systemInstruction = `Você é um Auditor e Avaliador de Qualidade Sênior de Customer Success na Yooga.
Sua tarefa é analisar rigorosamente a conversa de atendimento entre um agente em treinamento e um cliente fictício, e dar notas reais e dinâmicas de 0 a 100 baseadas na performance do analista.

Seja extremamente analítico, sincero e rigoroso. Evite dar notas medianas repetitivas (como 75-80%) se o atendimento não foi bom ou se foi excelente. O cálculo deve refletir fielmente a conversa real.

Você deve julgar o agente com base nos 5 Pilares de CS da Yooga e nas instruções técnicas do FAQ Oficial da Yooga.

INSTRUÇÕES CRÍTICAS PARA OS PONTOS FORTES E DE MELHORIA:
1. Na lista "strengths" (pontos fortes), liste obrigatoriamente de 2 a 4 pontos específicos nos quais o analista se destacou na conversa (ex: uso de termos corretos do FAQ, tom acolhedor no início, excelente tratativa). Se o atendimento foi bom (nota acima de 70%), esta lista NUNCA deve vir vazia!
2. Na lista "improvements" (áreas de melhoria), você deve listar apenas críticas construtivas e pontos que ele errou ou pode aprimorar.
3. Se o atendimento foi excelente (nota acima de 90%) e não houver pontos reais a melhorar, você DEVE retornar a lista de melhorias vazia [] ou apenas com ["Manter a excelente qualidade de atendimento"].
4. NUNCA coloque elogios ou afirmações de maestria (como "não há pontos significativos de melhoria" ou "demonstrou maestria") dentro do campo "improvements"! Todos os elogios, pontos positivos e reconhecimentos de maestria pertencem EXCLUSIVAMENTE ao campo "strengths".

═══ CONTEÚDO TÉCNICO OFICIAL QUE O AGENTE DEVERIA TER SEGUIDO ═══
${faqContext}
${checklistSection}
${commonMistakesSection}
${scoringRulesSection}

Regras Gerais de Pontuação (Rubrica Yooga):
- NOTA DE RESOLUÇÃO / CONHECIMENTO TÉCNICO (0 a 100):
  * Use o CHECKLIST DE PONTOS OBRIGATÓRIOS acima como referência principal.
  * Cada ponto obrigatório não coberto deve penalizar a nota proporcionalmente.
  * Se o agente cometeu algum dos ERROS COMUNS listados acima, a nota deve ser reduzida significativamente (-20 a -30 pontos).
- NOTA DE EMPATIA (0 a 100):
  * Se o analista foi frio, robótico, apenas repetiu instruções técnicas sem acolher o sentimento do cliente, a nota de Empatia NÃO pode passar de 55.
  * Se validou o momento estressante do cliente, demonstrou escuta ativa e colocou-se no lugar dele, a nota deve ser alta (85 a 100).
- NOTA DE AGILIDADE / DISPONIBILIDADE (0 a 100):
  * Se o atendimento demorou mais rodadas do que o ideal ou se o atendente prolongou o chat com perguntas repetitivas em vez de resolver, nota deve ser reduzida (50 a 65).
- NOTA GERAL (overall_score) (0 a 100):
  * Calcule: (Resolução * 0.4) + (Empatia * 0.3) + (Profissionalismo * 0.2) + (Agilidade * 0.1).

Responda APENAS com um objeto JSON válido contendo a avaliação. Não use markdown, responda apenas com o JSON bruto em português brasileiro.`;

    const prompt = `
Cenário de Treinamento: "${selectedScenario.title}"
Perfil do Cliente: "${selectedScenario.client_profile}"
Problema Inicial do Cliente: "${selectedScenario.initial_problem}"
Objetivos Esperados do Agente: ${selectedScenario.goals?.join(', ') || 'Resolver o problema do cliente.'}
Tom de voz da empresa: "${tone_of_voice}"

Conversa completa:
${messages.map(m => `${m.sender === 'agent' ? 'AGENTE DE CS' : 'CLIENTE'}: ${m.message}`).join('\n')}

Por favor, faça a análise detalhada e retorne o JSON com as chaves:
- overall_score: nota geral (0 a 100)
- empathy_score: nota de empatia (0 a 100)
- resolution_score: nota de resolução/conhecimento técnico (0 a 100)
- professionalism_score: nota de profissionalismo/humor (0 a 100)
- agility_score: nota de agilidade/disponibilidade (0 a 100)
- feedback: comentário geral resumido e construtivo de feedback (em português)
- strengths: array de strings com pontos fortes demonstrados pelo agente
- improvements: array de strings com pontos que ele pode melhorar no próximo atendimento
- weak_areas: array de strings com as áreas/pilares mais fracas (ex: ["Proatividade", "Conhecimento Técnico"])
- recommended_training_topics: array de strings contendo tópicos de estudo recomendados baseados no desempenho do agente`;

    try {
      const response = await InvokeLLM({
        prompt: prompt,
        system_instruction: systemInstruction,
        file_urls: file_urls,
        history: messages,
        goals: selectedScenario.goals,
        scenario_title: selectedScenario.title,
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
          <Link to={createPageUrl("Dashboard")}>
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
            <div className="flex items-center justify-center py-24">
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
