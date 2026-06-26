/**
 * integrations/Core - substitui a ponte de comunicação do simulador.
 *
 * Se comunica com o backend em Python (FastAPI) rodando localmente na porta 8000.
 * Caso o servidor backend esteja inacessível ou offline, realiza a degradação suave
 * (graceful degradation) acionando o RAG local-first e os fallbacks em JavaScript.
 */

import { Message } from "../types";
import { loadFaqEmbeddings } from "../data/load-faq-embeddings";

const BACKEND_URL = "http://localhost:8000";
// @ts-ignore
const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || "";

interface InvokeLLMProps {
  prompt: string;
  response_json_schema?: any;
  system_instruction?: string;
  history?: Message[];
  client_profile?: string;
  goals?: string[];
  scenario_title?: string;
}

/**
 * Invoca o LLM. Primeiro tenta chamar a API do backend Python (FastAPI).
 * Caso falhe por queda de rede ou servidor offline, executa o fallback em JS local.
 */
export async function InvokeLLM({
  prompt,
  response_json_schema,
  system_instruction,
  history = [],
  client_profile = "irritado",
  goals = [],
  scenario_title = ""
}: InvokeLLMProps): Promise<any> {
  const schemaProps = Object.keys(response_json_schema?.properties || {});

  // 1. Identificar o tipo de requisição
  const isCoach = schemaProps.includes("suggested_response");
  const isAudit = schemaProps.includes("overall_score");
  const isScenarioGen = schemaProps.includes("title") && schemaProps.includes("initial_problem");

  // 2. Tentar comunicação com o backend em Python (FastAPI)
  try {
    let endpoint = "/api/chat/simulate";
    let body: any = {};

    if (isScenarioGen) {
      endpoint = "/api/scenarios/generate";
      body = { prompt, system_instruction, response_json_schema };
    } else if (isCoach) {
      endpoint = "/api/chat/coach";
      body = { prompt, history, system_instruction };
    } else if (isAudit) {
      endpoint = "/api/chat/audit";
      body = { history, goals, scenario_title, system_instruction, prompt };
    } else {
      body = { prompt, history, system_instruction, client_profile };
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (BACKEND_API_KEY) {
      headers["X-API-Key"] = BACKEND_API_KEY;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[Core Client] Requisição para ${endpoint} expirou após 60s. Abortando...`);
      controller.abort();
    }, 60000);

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      console.info(`[Core Client] ✅ Resposta processada com sucesso via Backend Python (${endpoint})`);
      if (isCoach || isAudit || isScenarioGen) {
        return data;
      }
      return data.response;
    } else {
      console.warn(`[Core Client] Servidor Python retornou status ${res.status}. Iniciando fallback local.`);
    }
  } catch (err) {
    console.warn("[Core Client] Não foi possível conectar ao backend Python (Servidor Offline). Iniciando fallback em JavaScript.");
  }

  // 3. Fallbacks Locais (Se o backend estiver offline)
  const context = await GetSemanticFaqContext(prompt);

  if (isScenarioGen) {
    return {
      title: "Cenário gerado offline",
      description: "Cenário de treinamento gerado localmente (backend indisponível).",
      client_profile: client_profile || "irritado",
      initial_problem: prompt.slice(0, 300) || "Preciso de ajuda com um problema no sistema Yooga.",
      difficulty_level: "intermediario",
      goals: [
        "Demonstrar empatia com o cliente",
        "Aplicar o procedimento técnico do FAQ Yooga",
        "Confirmar que o cliente entendeu a solução"
      ],
      context: "Gerado em modo offline — revise e edite antes de publicar.",
      expected_interactions: 4,
      status: "ativo"
    };
  }

  if (isCoach) {
    let suggestedResponse = "Entendo sua situação. Vou verificar isso para você agora mesmo e retorno com a solução em breve. Pode me dar mais detalhes sobre o que está acontecendo?";
    let reasoning = "Resposta empática que demonstra disponibilidade (pilar Yooga) e proatividade ao solicitar mais informações para resolver o problema com precisão.";

    if (context) {
      const matchTitle = context.match(/\[Artigo de Ajuda Yooga: "([^"]+)"\]/);
      const articleTitle = matchTitle ? matchTitle[1] : "Central de Ajuda Yooga";
      const cleanContent = context.split("\n")[1]?.replace("Conteúdo: ", "") || "";

      suggestedResponse = `Olá! Compreendo sua dúvida em relação a "${articleTitle}". Baseado no procedimento oficial da Yooga: ${cleanContent.slice(0, 180)}... Recomendamos seguir esses passos para resolver na sua operação!`;
      reasoning = `Fallback simulado enriquecido dinamicamente via busca semântica offline do RAG para o artigo "${articleTitle}".`;
    }

    return { suggested_response: suggestedResponse, reasoning };
  }

  if (isAudit) {
    const agentMsgs = history.filter(m => m.sender === "agent").map(m => m.message.toLowerCase());
    if (agentMsgs.length === 0) {
      return {
        overall_score: 0,
        empathy_score: 0,
        resolution_score: 0,
        professionalism_score: 0,
        agility_score: 0,
        feedback: "O atendimento foi finalizado/abandonado sem nenhuma interação ou mensagem enviada pelo atendente. Por favor, interaja com o cliente para receber uma avaliação realista.",
        strengths: [],
        improvements: ["Iniciar o atendimento enviando mensagens ao cliente", "Demonstrar acolhimento à dúvida"],
        weak_areas: ["Resolução", "Disponibilidade", "Empatia"],
        recommended_training_topics: ["Princípios básicos de CS Yooga", "Como interagir com clientes"]
      };
    }

    // Calcular notas dinâmicas básicas baseando-se nas metas do cenário
    let goalsMet = 0;
    if (goals && goals.length > 0) {
      goals.forEach(goal => {
        const goalLower = goal.toLowerCase();
        const words = goalLower.split(" ").filter(w => w.length > 4 && !["sobre", "quando", "forma", "entre", "após", "antes", "deve", "podem"].includes(w));
        if (words.length > 0) {
          const matches = words.filter(w => agentMsgs.some(msg => msg.includes(w))).length;
          if (matches / words.length >= 0.3) {
            goalsMet++;
          }
        } else if (agentMsgs.some(msg => msg.includes(goalLower.slice(0, 12)))) {
          goalsMet++;
        }
      });
    }

    const resolutionScore = goals && goals.length > 0 ? Math.min(40 + Math.round((goalsMet / goals.length) * 60), 100) : 80;

    const empathyKws = ["desculpe", "compreendo", "entendo", "sinto muito", "peço desculpas", "vamos resolver", "certo", "perfeito", "claro", "correria", "acalmar", "tranquilo", "ajudar", "confusão", "poxa"];
    const empathyMatches = empathyKws.filter(kw => agentMsgs.some(msg => msg.includes(kw))).length;
    const empathyScore = Math.min(60 + empathyMatches * 10, 100);

    const professionalismScore = agentMsgs.some(msg => msg.length > 100) ? 95 : 85;

    let agilityScore = 60;
    if (agentMsgs.length <= 1) agilityScore = 100;
    else if (agentMsgs.length <= 2) agilityScore = 95;
    else if (agentMsgs.length <= 4) agilityScore = 85;
    else if (agentMsgs.length <= 6) agilityScore = 75;

    const overallScore = Math.round((resolutionScore * 0.4) + (empathyScore * 0.3) + (professionalismScore * 0.2) + (agilityScore * 0.1));

    const strengths = ["Excelente domínio técnico e clareza nas instruções", "Ótima postura empática e escuta ativa"];
    const improvements = overallScore >= 90 ? [] : ["Refinar o roteiro para acelerar o fechamento do ticket"];

    return {
      overall_score: overallScore,
      empathy_score: empathyScore,
      resolution_score: resolutionScore,
      professionalism_score: professionalismScore,
      agility_score: agilityScore,
      feedback: `Análise de fallback local concluída. ${overallScore >= 80 ? "Excelente postura! Demonstrou ótimo domínio técnico e tratativa acolhedora." : "Atendimento satisfatório, atente-se para seguir o FAQ de forma detalhada."}`,
      strengths,
      improvements,
      weak_areas: overallScore < 70 ? ["Resolução"] : ["Proatividade"],
      recommended_training_topics: ["Gestão de tempo no caixa", "Procedimentos de impressoras Yooga"]
    };
  }

  // Fallback para simulação regular do cliente
  return getSimulatedClientMessage(prompt, context, client_profile);
}

/**
 * Converte arquivos para base64.
 */
export async function UploadFile({ file }: { file: File }): Promise<{ file_url: string }> {
  if (!file) return { file_url: "" };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ file_url: typeof reader.result === "string" ? reader.result : "" });
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

// ─── Respostas Simuladas do Cliente (Fallback Offline) ──────────────────────

function getSimulatedClientMessage(prompt: string, context: string, clientProfile: string): string {
  let topic = "";
  if (context) {
    const matchTitle = context.match(/\[Artigo de Ajuda Yooga: "([^"]+)"\]/);
    if (matchTitle) {
      topic = matchTitle[1];
    }
  }

  const profiles: Record<string, string[]> = {
    irritado: [
      topic ? `Isso é inadmissível! Estou tentando configurar o "${topic}" aqui no Yooga e não funciona de jeito nenhum!` : "Isso é inadmissível! Já faz dias que estou com esse problema e ninguém resolve!",
      "Preciso de uma solução AGORA. Não tenho tempo para ficar esperando.",
      "Cada vez que ligo é a mesma coisa. Quando vão resolver de verdade?"
    ],
    confuso: [
      topic ? `Eu vi as instruções sobre "${topic}", mas confesso que não entendi muito bem o passo a passo...` : "Eu tentei fazer o que você disse, mas não entendi muito bem o segundo passo...",
      "Desculpa, pode repetir? Não tenho muito conhecimento de informática.",
      "Então eu clico onde exatamente? Estou vendo várias opções aqui."
    ],
    objetivo: [
      topic ? `Qual o prazo para resolver o problema com o "${topic}"?` : "Qual o prazo para resolver isso?",
      "Preciso de um passo a passo claro para corrigir o problema.",
      "Certo, e qual é a solução definitiva?"
    ],
    indeciso: [
      topic ? `Não sei se deve tentar integrar o "${topic}" agora ou ver depois com meu técnico...` : "Hmm, não sei se devo fazer isso agora ou esperar...",
      "Talvez seja melhor eu tentar de outro jeito primeiro, o que você acha?",
      "Ah sim, mas também estava pensando em outra opção..."
    ],
    emotivo: [
      topic ? `Nossa, muito obrigado pela ajuda com o "${topic}"! 😊 Tava com medo de travar minha operação.` : "Nossa, que alívio falar com vocês! 😊 Esse problema tava me deixando muito estressada.",
      "Obrigada pela atenção! A Yooga sempre me ajuda quando preciso ❤️",
      "Fico tão ansiosa quando acontece isso no sistema..."
    ],
    impaciente: [
      topic ? `Pode me explicar logo a solução para o "${topic}"? Estou no meio do expediente!` : "Pode ser mais rápido? Estou no meio do expediente!",
      "Já tentei isso! Próximo passo?",
      "Não tenho tempo para isso agora. Me diga a solução direta."
    ],
    detalhista: [
      topic ? `Entendi as especificações do "${topic}". Mas qual o próximo passo exato para garantir que o sistema funcione?` : "Entendido. E depois que eu fizer isso, qual o próximo passo exato?",
      "Você pode me enviar isso por escrito também? Preciso documentar.",
      "E esse processo vale para todos os módulos ou só para esse específico?"
    ]
  };

  const clientProfileLower = clientProfile.trim().toLowerCase();
  if (clientProfileLower && profiles[clientProfileLower]) {
    const messages = profiles[clientProfileLower];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const generic = [
    topic ? `Preciso de ajuda em relação a "${topic}". Você pode me orientar melhor?` : "Certo, entendi. E como faço para resolver isso?",
    "Obrigado pela informação. Vou tentar aqui.",
    "Ok, mas preciso que me ajude a resolver isso, por favor.",
    "Hmm, deixa eu testar aqui e já te falo se funcionou."
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

// ─── RAG Local-First (Similaridade Cosseno / Produto Escalar) ──────────────────

function generateDeterministicVector(text: string): number[] {
  const vector: number[] = [];
  const dim = 768;
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (text.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  
  for (let d = 0; d < dim; d++) {
    const value = Math.sin(hash + d) * 0.1;
    vector.push(value);
  }
  
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}

function dotProduct(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  return vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
}

export async function GetSemanticFaqContext(promptText: string): Promise<string> {
  if (!promptText) return "";

  const cleanPrompt = promptText.trim().toLowerCase();
  const genericGreetings = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "tudo bem", "opa", "ajuda", "suporte"];
  if (cleanPrompt.length < 4 || (genericGreetings.includes(cleanPrompt) && !cleanPrompt.includes("problema") && !cleanPrompt.includes("erro"))) {
    return "";
  }

  // 1. Priorizar busca vetorial no backend (Supabase pgvector)
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (BACKEND_API_KEY) {
      headers["X-API-Key"] = BACKEND_API_KEY;
    }
    const res = await fetch(`${BACKEND_URL}/api/rag/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: promptText })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.context) {
        console.info(`[Core Client] RAG via backend (${data.source}, ${data.chars} chars)`);
        return data.context;
      }
      return "";
    }
  } catch {
    console.warn("[Core Client] Backend RAG indisponível, usando fallback local.");
  }

  // 2. Fallback local (JSON + sessionStorage)
  try {
    const faqEmbeddings = await loadFaqEmbeddings();
    let allEmbeddings = Array.isArray(faqEmbeddings) ? [...faqEmbeddings] : [];
    const mergedMap = new Map();
    allEmbeddings.forEach(item => mergedMap.set(item.id, item));

    if (typeof window !== "undefined") {
      try {
        const sessionData = window.sessionStorage.getItem("yooga_faq_embeddings_session") ||
                            window.localStorage.getItem("yooga_faq_embeddings_session");
        if (sessionData) {
          const parsedSession = JSON.parse(sessionData);
          if (Array.isArray(parsedSession)) {
            parsedSession.forEach(item => mergedMap.set(item.id, item));
          }
        }
      } catch {}

      try {
        const customData = window.localStorage.getItem("db_custom_embeddings");
        if (customData) {
          const parsedCustom = JSON.parse(customData);
          if (Array.isArray(parsedCustom)) {
            parsedCustom.forEach(item => mergedMap.set(item.id, item));
          }
        }
      } catch {}
    }

    allEmbeddings = Array.from(mergedMap.values());
    if (allEmbeddings.length === 0) return "";

    const queryVector = generateDeterministicVector(cleanPrompt);
    const matches = allEmbeddings.map((doc: any) => {
      let similarity = dotProduct(queryVector, doc.embedding);
      const docTitleLower = (doc.title || "").toLowerCase();
      const docContentLower = (doc.content || "").toLowerCase();
      
      const keywords = [
        "offline", "contingencia", "navegador", "sincroniz", "ifood", "cardapio", 
        "nfce", "nfc-e", "csc", "sefaz", "contador", "impressora", "bobina", 
        "margem", "pagamento", "dividir", "caixa", "senha", "cancelamento", "permissao"
      ];

      keywords.forEach(kw => {
        if (cleanPrompt.includes(kw)) {
          if (docTitleLower.includes(kw)) similarity += 0.08;
          if (docContentLower.includes(kw)) similarity += 0.03;
        }
      });

      return { ...doc, similarity };
    });

    matches.sort((a, b) => b.similarity - a.similarity);
    const matchedDocs = matches.filter(m => m.similarity > 0.15);
    if (matchedDocs.length === 0) return "";

    const uniqueDocs = [];
    const seenTitles = new Set();
    for (const doc of matchedDocs) {
      const normalizedTitle = (doc.title || "").trim().toLowerCase();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueDocs.push(doc);
      }
      if (uniqueDocs.length >= 3) break;
    }

    if (uniqueDocs.length === 0) return "";

    const truncate = (text: string, max = 900) =>
      text.length <= max ? text : `${text.slice(0, max - 3).trim()}...`;

    return uniqueDocs
      .map(doc => `[Artigo de Ajuda Yooga: "${doc.title}"]\nConteúdo: ${truncate(doc.content)}\nLink do Artigo: ${doc.faqUrl}`)
      .join("\n\n");
  } catch (error) {
    console.error("[GetSemanticFaqContext] Erro ao buscar contexto semântico:", error);
    return "";
  }
}
