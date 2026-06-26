
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, StopCircle, Loader2, Lightbulb, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ChatInterface({ 
  scenario, 
  messages, 
  onSendMessage, 
  onEndSimulation, 
  isLoading,
  agentName,
  onRequestSuggestion,
  suggestionsUsed,
  maxSuggestions,
  prefillMessage,
  onPrefillConsumed,
  onTyping
}) {
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Consumir texto de sugestão do Coach de IA
  useEffect(() => {
    if (prefillMessage) {
      setCurrentMessage(prefillMessage);
      onPrefillConsumed?.();
      onTyping?.();
      // Focar no textarea para o agente poder editar/enviar
      textareaRef.current?.focus();
    }
  }, [prefillMessage]);

  const handleSendMessage = () => {
    if (currentMessage.trim() && !isLoading) {
      onSendMessage(currentMessage);
      setCurrentMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cálculo dinâmico se o cliente já está satisfeito/pronto para finalizar
  const agentMsgs = messages.filter(m => m.sender === 'agent');
  const historyText = messages.map(m => m.message.toLowerCase()).join(" ");

  const keywordsMap = {
    "venda offline": ["salv", "navegador", "fech", "limp", "sincroniz", "off", "contingencia"],
    "ifood": ["vinc", "categori", "sincroniz", "preço", "painel", "portal"],
    "nfc-e": ["csc", "sefaz", "produção", "certificado", "digital", "contador"],
    "impressora": ["largura", "bobina", "58mm", "margem", "margens", "horizontal"],
    "pagamento": ["parcial", "adicionar", "dividir", "pix", "dinheiro", "fechamento"],
    "segurança": ["cargo", "permissao", "senha", "cancelamento", "gerente", "administrador"]
  };

  const titleLower = (scenario?.title || "").toLowerCase();
  let keywords = ["ajuda", "suporte"];
  for (const [key, list] of Object.entries(keywordsMap)) {
    if (titleLower.includes(key)) {
      keywords = list;
      break;
    }
  }

  const hasMetTechnicalGoal = keywords.some(kw => historyText.includes(kw));
  const hasMetExpectedInteractions = agentMsgs.length >= ((scenario?.expected_interactions || 4) - 1);
  const isClientSatisfied = agentMsgs.length > 0 && (hasMetTechnicalGoal || hasMetExpectedInteractions);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scenario Info */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{scenario.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-lg">
                  Cliente {scenario.client_profile}
                </Badge>
                <Badge variant="outline">
                  {scenario.difficulty_level}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={onEndSimulation}
              variant="outline"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border-slate-200"
            >
              <StopCircle className="w-4 h-4" />
              Finalizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 overflow-hidden">
        <CardContent className="p-0">
          {/* Banner de satisfação do cliente */}
          {isClientSatisfied && (
            <div className="bg-emerald-50/80 border-b border-emerald-100/60 p-4 flex items-center justify-between gap-3 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 animate-bounce">
                  <PartyPopper className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Cliente Satisfeito!
                  </p>
                  <p className="text-xs text-emerald-600">
                    Você passou as orientações corretas ou o limite de interações foi atingido. Pode finalizar o atendimento!
                  </p>
                </div>
              </div>
              <Button 
                onClick={onEndSimulation}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-1.5 h-8 gap-1.5 shadow-sm shadow-emerald-100 rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5" />
                Finalizar Agora
              </Button>
            </div>
          )}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.sender === 'agent' 
                    ? 'bg-primary text-white rounded-l-2xl rounded-tr-2xl' 
                    : 'bg-slate-100 text-slate-900 rounded-r-2xl rounded-tl-2xl'
                } px-4 py-3 shadow-sm`}>
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'agent' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium opacity-80">
                      {message.sender === 'agent' ? agentName : 'Cliente'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                  <p className={`text-xs mt-2 opacity-60`}>
                    {format(new Date(message.timestamp), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 rounded-r-lg rounded-tl-lg px-4 py-3 shadow-sm max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4" />
                    <span className="text-xs font-medium opacity-80">Cliente</span>
                  </div>
                  <div className="flex items-center gap-2" role="status" aria-live="polite">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-slate-600">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4 bg-slate-50/50">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={currentMessage}
                  onChange={(e) => {
                    setCurrentMessage(e.target.value);
                    onTyping?.();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua resposta como agente de CS..."
                  className="flex-1 min-h-[60px] max-h-32 resize-none bg-white"
                  disabled={isLoading}
                />
                 <p className="text-xs text-slate-500 mt-2 flex justify-between">
                    <span>Shift+Enter para nova linha</span>
                    <span className="text-primary/80 font-medium">Você pode enviar várias mensagens consecutivas!</span>
                 </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="bg-primary hover:bg-yooga-primary-dark h-10 w-24 rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4 mr-2" /> Enviar
                </Button>
                <Button
                  variant="outline"
                  onClick={onRequestSuggestion}
                  disabled={isLoading || suggestionsUsed >= maxSuggestions}
                  className="h-10 w-24 rounded-xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer hover:bg-slate-100 hover:text-slate-900 border-slate-200"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Dica
                </Button>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
                {suggestionsUsed < maxSuggestions 
                  ? `${maxSuggestions - suggestionsUsed} sugestões restantes.`
                  : "Você usou todas as suas sugestões."
                }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
