import React, { useEffect, useRef } from "react";
import { X, MessageSquare, Clock, Calendar } from "lucide-react";

export default function TranscriptModal({ isOpen, onClose, simulation, scenarioName }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Pequeno timeout para garantir que o modal renderizou antes de rolar
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen, simulation]);

  if (!isOpen || !simulation) return null;

  const messages = simulation.messages || [];
  const score = simulation.evaluation?.overall_score ?? 0;
  const dateStr = new Date(simulation.created_date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#002D62] text-white p-5 flex justify-between items-start border-b border-blue-900/30">
          <div className="space-y-1.5 pr-6">
            <span className="text-[10px] font-extrabold tracking-wider bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full uppercase">
              Replay da Transcrição
            </span>
            <h3 className="text-base font-bold leading-tight">{scenarioName || "Simulação de Atendimento"}</h3>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-200/80 pt-1 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dateStr}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {simulation.duration_minutes || 0} min de duração
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-center justify-center bg-white/10 rounded-2xl px-3 py-1.5 border border-white/15">
              <span className="text-[9px] font-bold text-blue-200 uppercase">Score CS</span>
              <span className="text-base font-black text-green-400">{score}%</span>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white/80 hover:text-white cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4 min-h-[300px]">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2.5">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-semibold">Nenhuma mensagem registrada nesta simulação.</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAgent = msg.sender === "agent";
              return (
                <div 
                  key={index}
                  className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                    {isAgent ? "Agente (Você)" : "Cliente"}
                  </span>
                  
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm ${
                      isAgent 
                        ? "bg-[#002D62] text-white rounded-tr-none" 
                        : "bg-white text-slate-800 border border-slate-200/50 rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[#002D62] hover:bg-[#004094] text-white rounded-xl text-xs font-bold px-5 h-10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0"
          >
            Fechar Transcrição
          </button>
        </div>
      </div>
    </div>
  );
}
