import React, { useState } from 'react';
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Wand2, XCircle, Loader2, Lightbulb, Zap, Tag } from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";
import { Scenario, CompanyProfile, AgentPerformance } from "@/entities/all"; // Added AgentPerformance

const scenarioSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  client_profile: z.enum(["irritado", "confuso", "objetivo", "indeciso", "emotivo", "impaciente", "detalhista"]),
  initial_problem: z.string().min(10, "O problema inicial deve ter pelo menos 10 caracteres"),
  difficulty_level: z.enum(["iniciante", "intermediario", "avançado"]),
  goals: z.array(z.string()).min(3, "O cenário precisa ter pelo menos 3 objetivos").max(5),
  context: z.string().min(10, "O contexto deve ter pelo menos 10 caracteres"),
  expected_interactions: z.number().min(3).max(8).optional().default(4),
  status: z.string().default("ativo")
});

const SCENARIO_TYPES = [
  { 
    value: "funcionalidade_especifica", 
    label: "Problema com Funcionalidade Específica",
    description: "Cliente com dificuldade em usar uma funcionalidade do sistema Yooga"
  },
  { 
    value: "integracao_problema", 
    label: "Problema de Integração",
    description: "Questões com impressoras, domínios, ou outras integrações"
  },
  { 
    value: "financeiro_cobranca", 
    label: "Questão Financeira/Cobrança",
    description: "Problemas com boletos, pagamentos ou bloqueios"
  },
  { 
    value: "sugestao_melhoria", 
    label: "Sugestão de Melhoria",
    description: "Cliente propondo novas funcionalidades ou melhorias"
  },
  { 
    value: "instabilidade_sistema", 
    label: "Instabilidade do Sistema",
    description: "Sistema lento, travando ou indisponível"
  },
  { 
    value: "duvida_operacional", 
    label: "Dúvida Operacional",
    description: "Como usar determinada funcionalidade ou processo"
  }
];

export default function ScenarioGenerator({ onCancel, onScenarioGenerated }) {
  const [selectedType, setSelectedType] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const CONTENT_TAGS = [
    { value: "pdv", label: "PDV" },
    { value: "delivery", label: "Delivery" },
    { value: "fiscal", label: "Fiscal" },
    { value: "financeiro", label: "Financeiro" },
    { value: "estoque", label: "Estoque" }, // Added "estoque" tag
    { value: "relatorios", label: "Relatórios" },
    { value: "integracao", label: "Integração" },
    { value: "suporte", label: "Suporte" },
    { value: "configuracao", label: "Configuração" }
  ];

  const generateAndValidateScenario = async (promptText, file_urls, attempt = 1, maxAttempts = 3) => {
    try {
      const generatedData = await InvokeLLM({
        prompt: promptText,
        file_urls: file_urls,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            client_profile: { 
              type: "string", 
              enum: ["irritado", "confuso", "objetivo", "indeciso", "emotivo", "impaciente", "detalhista"]
            },
            initial_problem: { type: "string" },
            difficulty_level: { 
              type: "string", 
              enum: ["iniciante", "intermediario", "avançado"]
            },
            goals: { 
              type: "array", 
              items: { type: "string" },
              minItems: 3,
              maxItems: 5
            },
            context: { type: "string" },
            expected_interactions: { 
              type: "number", 
              minimum: 3, 
              maximum: 8 
            },
            status: { 
              type: "string",
              enum: ["ativo"],
              default: "ativo"
            }
          },
          required: ["title", "client_profile", "initial_problem", "difficulty_level", "goals", "context"]
        }
      });

      // Garantir e normalizar campos básicos
      generatedData.status = "ativo";
      if (generatedData.difficulty_level === "avancado") {
        generatedData.difficulty_level = "avançado";
      }

      // Validar com Zod
      const result = scenarioSchema.safeParse(generatedData);
      
      if (!result.success) {
        console.warn(`[Zod Validation] Falha na tentativa ${attempt}/${maxAttempts}:`, result.error.format());
        
        if (attempt < maxAttempts) {
          // Opção B: Fazer nova chamada à API/LLM automaticamente, enviando os erros de validação para a IA se auto-corrigir
          const errorsFormatted = JSON.stringify(result.error.format());
          const correctivePrompt = `${promptText}\n\n⚠️ ATENÇÃO: A tentativa anterior gerou um JSON inválido com os seguintes erros de validação Zod. Por favor, certifique-se de preencher e formatar todos os campos corretamente desta vez:\n${errorsFormatted}`;
          return await generateAndValidateScenario(correctivePrompt, file_urls, attempt + 1, maxAttempts);
        } else {
          // Esgotado, levantar erro amigável listando campos inválidos
          const invalidFields = Object.keys(result.error.format()).filter(k => k !== "_errors");
          throw new Error(`Não foi possível gerar um cenário válido após várias tentativas. Campos inválidos gerados pelo LLM: ${invalidFields.join(', ')}.`);
        }
      }

      return result.data;
    } catch (err) {
      if (attempt < maxAttempts && !err.message.includes("gerar um cenário válido")) {
        // Tentar novamente em caso de erros de rede/LLM comuns
        return await generateAndValidateScenario(promptText, file_urls, attempt + 1, maxAttempts);
      }
      throw err;
    }
  };

  const handleQuickGenerate = async (scenarioType) => {
    if (isLoading) return; // Prevent duplicate calls
    setIsLoading(true);
    setError(null);

    try {
      const profiles = await CompanyProfile.list();
      const companyProfile = profiles.length > 0 ? profiles[0] : {};
      const tone_of_voice = companyProfile.tone_of_voice || "Padrão da Yooga: proativo, empático, disponível 24h, com conhecimento técnico e humor apropriado.";
      
      // Filtrar arquivos por tags se selecionadas
      let relevantFiles = companyProfile.knowledge_base_files || [];
      if (selectedTags.length > 0) {
        relevantFiles = relevantFiles.filter(file => 
          file.tags && file.tags.some(tag => selectedTags.includes(tag))
        );
      }
      const file_urls = relevantFiles.map(f => f.url);

      const typeConfig = SCENARIO_TYPES.find(t => t.value === scenarioType);
      
      // Verificar se há dados de performance para gerar cenários adaptativos
      const performanceData = await AgentPerformance.list();
      const commonWeakAreas = getCommonWeakAreas(performanceData);
      
      const prompt = `
        Você é um especialista em Customer Success da Yooga e precisa criar um cenário de treinamento REALISTA.
        
        TIPO DE CENÁRIO: "${typeConfig.label}"
        DESCRIÇÃO: "${typeConfig.description}"
        
        TOM DE VOZ DA YOOGA: "${tone_of_voice}"
        
        ${selectedTags.length > 0 ? `FOCAR NAS ÁREAS: ${selectedTags.join(', ')}` : ''}
        
        ${commonWeakAreas.length > 0 ? `ÁREAS DE MELHORIA IDENTIFICADAS: ${commonWeakAreas.join(', ')} - crie um cenário que ajude a desenvolver essas habilidades` : ''}
        
        INSTRUÇÕES ESPECÍFICAS PARA O TIPO "${scenarioType}":
        ${getTypeSpecificInstructions(scenarioType)}
        
        Com base na base de conhecimento da Yooga (arquivos anexos), crie um cenário que:
        1. Use terminologia real da Yooga (módulo fiscal, delivery, complementos, estoque, etc.)
        2. Reflita problemas que clientes reais enfrentam
        3. Permita treinar os pilares: Disponibilidade, Proatividade, Conhecimento Técnico, Empatia, Humor
        4. Seja específico e detalhado
        ${selectedTags.length > 0 ? `5. Foque especificamente nas áreas: ${selectedTags.join(', ')}` : ''}
        ${commonWeakAreas.length > 0 ? `6. Ajude a desenvolver: ${commonWeakAreas.join(', ')}` : ''}
        
        MELHORIAS AVANÇADAS - O cliente deve:
        - Demonstrar conhecimento prévio do sistema Yooga
        - Fazer perguntas específicas sobre funcionalidades
        - Reagir ao atendimento de forma realista (termômetro Yooga)
        - Poder mencionar problemas anteriores ou experiências passadas
        - Escalar emoções baseado na qualidade do atendimento
        
        Retorne um JSON com a estrutura do cenário:
      `;

      const validatedData = await generateAndValidateScenario(prompt, file_urls);
      
      await Scenario.create(validatedData);
      onScenarioGenerated();
      onCancel();

    } catch (err) {
      console.error("Erro ao gerar cenário:", err);
      setError(err.message || "Não foi possível gerar o cenário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomGenerate = async () => {
    if (!customTopic.trim() || isLoading) return; // Prevent duplicate calls
    
    setIsLoading(true);
    setError(null);

    try {
      const profiles = await CompanyProfile.list();
      const companyProfile = profiles.length > 0 ? profiles[0] : {};
      const tone_of_voice = companyProfile.tone_of_voice || "Padrão da Yooga: proativo, empático, disponível 24h, com conhecimento técnico e humor apropriado.";
      
      // Filtrar arquivos por tags se selecionadas
      let relevantFiles = companyProfile.knowledge_base_files || [];
      if (selectedTags.length > 0) {
        relevantFiles = relevantFiles.filter(file => 
          file.tags && file.tags.some(tag => selectedTags.includes(tag))
        );
      }
      const file_urls = relevantFiles.map(f => f.url);

      // Verificar se há dados de performance para gerar cenários adaptativos
      const performanceData = await AgentPerformance.list();
      const commonWeakAreas = getCommonWeakAreas(performanceData);

      const prompt = `
        Você é um especialista em Customer Success da Yooga e precisa criar um cenário de treinamento baseado no tópico: "${customTopic}"
        
        TOM DE VOZ DA YOOGA: "${tone_of_voice}"
        
        ${selectedTags.length > 0 ? `FOCAR NAS ÁREAS: ${selectedTags.join(', ')}` : ''}
        
        ${commonWeakAreas.length > 0 ? `ÁREAS DE MELHORIA IDENTIFICADAS: ${commonWeakAreas.join(', ')} - crie um cenário que ajude a desenvolver essas habilidades` : ''}

        Com base na base de conhecimento da Yooga (arquivos anexos), crie um cenário que:
        1. Seja relacionado ao tópico "${customTopic}"
        2. Use terminologia real da Yooga
        3. Reflita situações que clientes reais enfrentam
        4. Permita treinar os 5 pilares da Yooga: Disponibilidade, Proatividade, Conhecimento Técnico, Empatia, Humor
        5. Seja específico e realista
        ${selectedTags.length > 0 ? `6. Foque especificamente nas áreas: ${selectedTags.join(', ')}` : ''}
        ${commonWeakAreas.length > 0 ? `7. Ajude a desenvolver: ${commonWeakAreas.join(', ')}` : ''}
        
        Crie um problema inicial que o cliente apresentaria de forma natural, como se fosse uma conversa real no chat de suporte.
        
        MELHORIAS AVANÇADAS - O cliente deve:
        - Demonstrar conhecimento prévio do sistema Yooga
        - Fazer perguntas específicas sobre funcionalidades
        - Reagir ao atendimento de forma realista (termômetro Yooga)
        - Poder mencionar problemas anteriores ou experiências passadas
        - Escalar emoções baseado na qualidade do atendimento

        Retorne um JSON com a estrutura completa do cenário:
      `;

      const validatedData = await generateAndValidateScenario(prompt, file_urls);
      
      await Scenario.create(validatedData);
      onScenarioGenerated();
      onCancel();

    } catch (err) {
      console.error("Erro ao gerar cenário:", err);
      setError(err.message || "Não foi possível gerar o cenário. Tente um tópico diferente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeSpecificInstructions = (type) => {
    const instructions = {
      funcionalidade_especifica: `
        - Use funcionalidades reais da Yooga: módulo fiscal, delivery, complementos, cadastro de produtos, relatórios, estoque
        - O cliente deve ter dificuldade específica em usar uma funcionalidade
        - Inclua detalhes técnicos que exigem conhecimento do sistema
        - Exemplo: "Não consigo adicionar os complementos no meu produto" ou "O módulo fiscal não está gerando as notas"
      `,
      integracao_problema: `
        - Foque em impressoras (especialmente Bematech), domínios, APIs, integrações
        - Problemas técnicos que exigem conhecimento especializado
        - Exemplo: "Minha impressora Bematech mudou de porta e não imprime mais" ou "Preciso trocar o domínio do delivery"
      `,
      financeiro_cobranca: `
        - Use o "Financeiro Humanizado" da Yooga como base
        - Problemas com boletos, sistemas bloqueados, pagamentos não identificados
        - O agente deve aplicar empatia e evitar constrangimento
        - Exemplo: "Paguei meu boleto mas o sistema ainda está bloqueado"
      `,
      sugestao_melhoria: `
        - Cliente propõe melhorias ou novas funcionalidades
        - O agente deve acolher a sugestão sem prometer prazos
        - Aplicar o princípio "A experiência do usuário é o que nos guia"
        - Exemplo: "Seria incrível ter integração com iFood" ou "Poderiam adicionar relatório de vendas por hora"
      `,
      instabilidade_sistema: `
        - Sistema lento, travando, indisponível
        - Usar as 4 etapas de instabilidade da Yooga: entender motivo, indicar ação, resolver, enviar feedback
        - Cliente pode estar em horário de pico, com pressão de atendimento
        - Exemplo: "O sistema está travando e tenho uma fila de clientes"
      `,
      duvida_operacional: `
        - Dúvidas sobre como usar funcionalidades básicas ou avançadas
        - Oportunidade de educar o cliente e agregar valor
        - Exemplo: "Como funciona o cancelamento de nota fiscal?" ou "Qual o prazo para ativar o delivery?"
      `
    };
    
    return instructions[type] || "";
  };

  const getCommonWeakAreas = (performanceData) => {
    if (!performanceData || performanceData.length === 0) return [];
    
    const allWeakAreas = performanceData.flatMap(p => p.weak_areas || []);
    const counts = allWeakAreas.reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});
    
    // Sort by count in descending order and take the top 3
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scenario-generator-title"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border-slate-100 shadow-xl">
        <CardHeader className="border-b border-slate-100">
          <CardTitle id="scenario-generator-title" className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <BrainCircuit className="w-5.5 h-5.5 text-primary" />
            Gerador Inteligente de Cenários Yooga
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Crie cenários realistas baseados nas funcionalidades e processos da Yooga
          </p>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Filtros por Tags */}
          <div>
            <h3 className="text-base font-bold text-slate-950 mb-3 flex items-center gap-2">
              <Tag className="w-4.5 h-4.5 text-green-500" />
              Focar em Áreas Específicas (Opcional)
            </h3>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  aria-pressed={selectedTags.includes(tag.value)}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag.value) 
                        ? prev.filter(t => t !== tag.value)
                        : [...prev, tag.value]
                    );
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                    selectedTags.includes(tag.value)
                      ? 'bg-primary/10 text-primary border-primary/20 shadow-sm font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Selecione as áreas para gerar cenários mais específicos. Deixe em branco para usar toda a base de conhecimento.
            </p>
          </div>

          {/* Geradores Rápidos */}
          <div>
            <h3 className="text-base font-bold text-slate-950 mb-3 flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-amber-500" />
              Cenários Rápidos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIO_TYPES.map((type) => (
                <Card 
                  key={type.value} 
                  className={`p-5 border-slate-150 rounded-xl hover:shadow-md hover:scale-[1.015] active:scale-[0.99] transition-all duration-200 flex flex-col justify-between ${isLoading ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
                >
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{type.label}</h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{type.description}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={isLoading}
                    className="w-full rounded-lg hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-semibold h-9"
                    onClick={() => handleQuickGenerate(type.value)}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Gerar Agora
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 border-t border-slate-150"></div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">OU</span>
            <div className="flex-1 border-t border-slate-150"></div>
          </div>

          {/* Gerador Personalizado */}
          <div>
            <h3 className="text-base font-bold text-slate-950 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4.5 h-4.5 text-yellow-500" />
              Cenário Personalizado
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-topic" className="text-slate-700 font-medium">Descreva o tópico ou situação específica</Label>
                <Input
                  id="custom-topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ex: Cliente quer integrar com WhatsApp Business, Dificuldade para configurar taxa de entrega, Problema com backup de dados..."
                  disabled={isLoading}
                  className="mt-1.5 h-11 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-350 focus-visible:border-slate-350"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Seja específico! A IA usará a base de conhecimento da Yooga para criar um cenário realista.
                </p>
              </div>
              <Button 
                onClick={handleCustomGenerate} 
                disabled={isLoading || !customTopic.trim()}
                className="w-full h-11 bg-gradient-to-r from-primary to-yooga-primary-dark hover:opacity-95 hover:scale-[1.015] active:scale-[0.98] transition-all duration-200 cursor-pointer text-white font-bold rounded-xl shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BrainCircuit className="w-4.5 h-4.5 mr-2" />
                )}
                Gerar Cenário Personalizado
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="rounded-xl px-5 h-11 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-semibold border-slate-200"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
