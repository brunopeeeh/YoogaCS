import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Check, Copy, X } from "lucide-react";

export default function SuggestionModal({ suggestionData, onClose, onUseSuggestion }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestionData.suggested_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggestion-modal-title"
    >
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl flex flex-col"
        style={{ maxHeight: "88vh" }}
      >
        {/* Card ocupa toda a altura disponível do wrapper */}
        <div className="w-full flex flex-col bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl border border-slate-200/80 overflow-hidden"
          style={{ maxHeight: "88vh" }}>

          {/* Header — fixo, não cresce */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 shrink-0">
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <span id="suggestion-modal-title" className="text-base font-bold text-slate-900">
                Sugestão do Coach de IA
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo — cresce e tem scroll quando necessário; min-h-0 é essencial */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Resposta Sugerida
            </p>
            <div className="relative p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-slate-800 text-sm leading-relaxed pr-8 whitespace-pre-wrap">
                {suggestionData.suggested_response}
              </p>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Copiar resposta sugerida"
                className="absolute top-2 right-2 h-7 w-7 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                onClick={handleCopy}
              >
                {copied
                  ? <Check className="w-4 h-4 text-emerald-600" />
                  : <Copy className="w-4 h-4 text-slate-500" />}
              </Button>
            </div>
          </div>

          {/* Footer — fixo, não cresce */}
          <div className="flex gap-3 border-t border-slate-100 px-5 py-4 shrink-0 bg-white">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={() => onUseSuggestion(suggestionData.suggested_response)}
              className="flex-1 bg-[#002D62] hover:bg-[#004094] text-white rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4 mr-2" />
              Usar esta Sugestão
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}