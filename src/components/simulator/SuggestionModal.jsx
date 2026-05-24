import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Check, Copy, X } from "lucide-react";

export default function SuggestionModal({ suggestionData, onClose, onUseSuggestion }) {
  const [copied, setCopied] = React.useState(false);

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <Card className="w-full bg-white shadow-2xl rounded-2xl border-slate-200/80">
          <CardHeader className="border-b border-slate-100 p-6">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-[#FF6600]" />
              </div>
              Sugestão do Coach de IA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resposta Sugerida:</h3>
              <div className="relative p-4 bg-slate-50/80 rounded-xl border border-slate-200/50">
                <p className="text-slate-800 text-sm leading-relaxed pr-6">{suggestionData.suggested_response}</p>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 h-7 w-7 hover:bg-slate-200/60 rounded-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Justificativa do Coach:</h3>
              <p className="text-sm text-slate-700 p-4 bg-blue-50/50 rounded-xl border border-blue-100/60 leading-relaxed">
                {suggestionData.reasoning}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-6">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
            <Button 
              onClick={() => onUseSuggestion(suggestionData.suggested_response)} 
              className="bg-[#002D62] hover:bg-[#004094] text-white rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm shadow-blue-900/10"
            >
              <Check className="w-4 h-4 mr-2" />
              Usar esta Resposta
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}