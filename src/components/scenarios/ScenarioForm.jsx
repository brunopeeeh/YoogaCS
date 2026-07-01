import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { Module, ensureKnowledgeReady } from "@/entities/Knowledge";

export default function ScenarioForm({ scenario, onSubmit, onCancel }) {
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_profile: 'objetivo',
    initial_problem: '',
    difficulty_level: 'iniciante',
    goals: [],
    context: '',
    expected_interactions: 5,
    status: 'ativo',
    moduleId: '',
  });
  const [newGoal, setNewGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadModules = async () => {
      try {
        await ensureKnowledgeReady();
        const data = await Module.list();
        setModules(data);
      } catch (err) {
        console.error("Failed to load modules in form:", err);
      }
    };
    loadModules();
  }, []);

  useEffect(() => {
    if (scenario) {
      setFormData({
        title: scenario.title || '',
        description: scenario.description || '',
        client_profile: scenario.client_profile || 'objetivo',
        initial_problem: scenario.initial_problem || '',
        difficulty_level: scenario.difficulty_level || 'iniciante',
        goals: scenario.goals || [],
        context: scenario.context || '',
        expected_interactions: scenario.expected_interactions || 5,
        status: scenario.status || 'ativo',
        moduleId: scenario.moduleId || '',
      });
    }
  }, [scenario]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData(prev => ({ ...prev, goals: [...prev.goals, newGoal.trim()] }));
      setNewGoal('');
    }
  };

  const removeGoal = (index) => {
    setFormData(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        role="dialog" aria-modal="true" aria-labelledby="scenario-form-title" className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 id="scenario-form-title" className="text-xl font-bold text-slate-900">
            {scenario ? 'Editar Cenário' : 'Novo Cenário'}
          </h2>
          <button
            onClick={onCancel}
            aria-label="Fechar formulário"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Ex: Cliente insatisfeito com entrega"
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Descreva o cenário de forma geral..."
              className="rounded-xl"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Trilha de Aprendizado (Opcional)</Label>
            <Select value={formData.moduleId || 'none'} onValueChange={v => handleChange('moduleId', v === 'none' ? null : v)}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecione uma trilha de aprendizado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem trilha vinculada</SelectItem>
                {modules.map(mod => (
                  <SelectItem key={mod.id} value={mod.id}>
                    {mod.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Perfil do Cliente *</Label>
              <Select value={formData.client_profile} onValueChange={v => handleChange('client_profile', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            <div className="space-y-2">
              <Label>Dificuldade *</Label>
              <Select value={formData.difficulty_level} onValueChange={v => handleChange('difficulty_level', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_problem">Problema Inicial *</Label>
            <Textarea
              id="initial_problem"
              value={formData.initial_problem}
              onChange={e => handleChange('initial_problem', e.target.value)}
              placeholder="Descreva a situação/problema que o cliente apresentará..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexto Adicional</Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={e => handleChange('context', e.target.value)}
              placeholder="Informações extras sobre o produto, histórico do cliente..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected_interactions">Interações Esperadas</Label>
              <Input
                id="expected_interactions"
                type="number"
                min={1}
                max={50}
                value={formData.expected_interactions}
                onChange={e => handleChange('expected_interactions', parseInt(e.target.value) || 5)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Objetivos do Cenário</Label>
            <div className="flex gap-2">
              <Input
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                placeholder="Adicionar objetivo..."
              />
              <Button type="button" variant="outline" onClick={addGoal} aria-label="Adicionar objetivo">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.goals.length > 0 && (
              <ul className="space-y-1 mt-2">
                {formData.goals.map((goal, i) => (
                  <li key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                    <span className="text-slate-700">{goal}</span>
                    <button type="button" onClick={() => removeGoal(i)} aria-label="Remover objetivo">
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 h-11 rounded-xl hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-gradient-to-r from-primary to-yooga-primary-dark hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-white font-bold rounded-xl"
            >
              {isSubmitting ? 'Salvando...' : (scenario ? 'Salvar Alterações' : 'Criar Cenário')}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}