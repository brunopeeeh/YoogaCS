import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function ScenarioFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (type, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select
          value={filters.difficulty}
          onValueChange={(value) => handleFilterChange('difficulty', value)}
        >
          <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Dificuldades</SelectItem>
            <SelectItem value="iniciante">Iniciante</SelectItem>
            <SelectItem value="intermediario">Intermediário</SelectItem>
            <SelectItem value="avançado">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filters.client_profile}
          onValueChange={(value) => handleFilterChange('client_profile', value)}
        >
          <SelectTrigger className="w-44 bg-white/80 backdrop-blur-sm">
            <SelectValue placeholder="Perfil do Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Perfis</SelectItem>
            <SelectItem value="irritado">Irritado</SelectItem>
            <SelectItem value="confuso">Confuso</SelectItem>
            <SelectItem value="objetivo">Objetivo</SelectItem>
            <SelectItem value="indeciso">Indeciso</SelectItem>
            <SelectItem value="emotivo">Emotivo</SelectItem>
            <SelectItem value="impaciente">Impaciente</SelectItem>
            <SelectItem value="detalhista">Detalhista</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}