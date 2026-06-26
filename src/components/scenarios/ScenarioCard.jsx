
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Play, Clock, ShieldOff, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const profileColors = {
  "irritado": "bg-red-100 text-red-800 border-red-200",
  "confuso": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "objetivo": "bg-blue-100 text-blue-800 border-blue-200",
  "indeciso": "bg-slate-100 text-slate-800 border-slate-200",
  "emotivo": "bg-pink-100 text-pink-800 border-pink-200",
  "impaciente": "bg-orange-100 text-orange-800 border-orange-200",
  "detalhista": "bg-green-100 text-green-800 border-green-200"
};

const difficultyColors = {
  "iniciante": "bg-green-100 text-green-800 border-green-200",
  "intermediario": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "avançado": "bg-red-100 text-red-800 border-red-200",
  "avancado": "bg-red-100 text-red-800 border-red-200"
};

const statusColors = {
  "ativo": "bg-green-100 text-green-800 border-green-200",
  "inativo": "bg-gray-100 text-gray-800 border-gray-200",
  "rascunho": "bg-yellow-100 text-yellow-800 border-yellow-200"
};

export default function ScenarioCard({ scenario, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg hover:scale-[1.015] active:scale-[0.98] transition-all duration-200 cursor-pointer h-full flex flex-col rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
              {scenario.title}
            </CardTitle>
            <Badge className={`text-xs ${statusColors[scenario.status]} rounded-full font-medium px-2.5 py-0.5 border`}>
              {scenario.status}
            </Badge>
          </div>
          {scenario.description && (
            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
              {scenario.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4 flex-grow">
          <div className="flex flex-wrap gap-2">
            <Badge className={`text-xs border ${profileColors[scenario.client_profile]} rounded-full font-medium px-2.5 py-0.5`}>
              {scenario.client_profile}
            </Badge>
            <Badge className={`text-xs border ${difficultyColors[scenario.difficulty_level]} rounded-full font-medium px-2.5 py-0.5`}>
              {scenario.difficulty_level}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-slate-700">Problema:</span>
              <p className="text-slate-600 mt-1 line-clamp-2">
                {scenario.initial_problem}
              </p>
            </div>
            
            {scenario.expected_interactions && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                ~{scenario.expected_interactions} interações esperadas
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-4 pt-0">
          <div className="flex flex-wrap gap-2 pt-2 border-t mt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(scenario)}
                className="flex-1 gap-1 h-9 rounded-lg hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </Button>
            )}

            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Tem certeza que deseja excluir permanentemente este cenário?")) {
                    onDelete(scenario.id);
                  }
                }}
                className="flex-1 gap-1 h-9 border-red-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </Button>
            )}
            
            {scenario.status === "ativo" && (
              <Link to={`${createPageUrl("Simulator")}?scenario=${scenario.id}`} className="flex-1 min-w-[90px]">
                <Button 
                  size="sm" 
                  className="w-full gap-1 h-9 bg-gradient-to-r from-primary to-yooga-primary-dark hover:opacity-95 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 cursor-pointer text-white rounded-lg font-bold"
                >
                  <Play className="w-3.5 h-3.5" />
                  Praticar
                </Button>
              </Link>
            )}

            {!onEdit && scenario.status !== "ativo" && (
               <div className="flex-1 text-center text-sm text-slate-500 flex items-center justify-center gap-2 h-9">
                 <ShieldOff className="w-4 h-4" />
                 <span>Indisponível</span>
               </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
