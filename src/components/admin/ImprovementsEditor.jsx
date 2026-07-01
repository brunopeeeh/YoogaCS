import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Save, GitBranch, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

import { getBackendUrl } from "@/utils/backend-url";

const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || "";

function adminFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (BACKEND_API_KEY) headers["X-API-Key"] = BACKEND_API_KEY;
  return fetch(`${getBackendUrl()}${path}`, { ...options, headers });
}

// Agrupa melhorias de todas as simulações por texto, retornando frequência e contexto
function aggregateImprovements(simulations) {
  const freq = {};
  for (const sim of simulations) {
    const items = sim.evaluation?.improvements ?? [];
    const scenario = sim.scenario_title ?? "—";
    const agent = sim.created_by ?? "—";
    for (const item of items) {
      const key = item.trim();
      if (!key) continue;
      if (!freq[key]) freq[key] = { count: 0, occurrences: [] };
      freq[key].count += 1;
      freq[key].occurrences.push({ scenario, agent, date: sim.created_date });
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([text, data]) => ({ text, ...data }));
}

function ImprovementRow({ item }) {
  const [open, setOpen] = useState(false);
  const urgency = item.count >= 5 ? "red" : item.count >= 3 ? "orange" : "slate";
  const badgeClass = {
    red: "bg-red-100 text-red-700 border-red-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  }[urgency];

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Badge className={`shrink-0 text-xs border ${badgeClass}`}>{item.count}×</Badge>
          <span className="text-sm text-slate-800 truncate">{item.text}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-3 bg-slate-50 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mt-2 mb-1">Ocorrências:</p>
          <ul className="space-y-1">
            {item.occurrences.map((o, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-2">
                <span className="text-slate-400">{o.date ? new Date(o.date).toLocaleDateString("pt-BR") : "—"}</span>
                <span className="font-medium">{o.agent?.split("@")[0]}</span>
                <span className="text-slate-400 truncate">→ {o.scenario}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ImprovementsEditor({ simulations = [] }) {
  const [contextContent, setContextContent] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [commitMsg, setCommitMsg] = useState("fix: ajuste de critérios de avaliação via painel admin");
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // { pushed, git_log }

  const improvements = useMemo(() => aggregateImprovements(simulations), [simulations]);

  const loadContext = async () => {
    setIsLoadingContext(true);
    try {
      const res = await adminFetch("/api/admin/context");
      const data = await res.json();
      setContextContent(data.content ?? "");
      setEditedContent(data.content ?? "");
    } catch {
      setContextContent("⚠️ Não foi possível carregar o arquivo. Verifique se o backend está rodando.");
      setEditedContent("");
    } finally {
      setIsLoadingContext(false);
    }
  };

  useEffect(() => { loadContext(); }, []);

  const callPatch = async (push) => {
    const res = await adminFetch("/api/admin/context", {
      method: "PATCH",
      body: JSON.stringify({ content: editedContent, push, commit_message: commitMsg }),
    });
    return res.json();
  };

  const handleSaveLocal = async () => {
    setIsSaving(true);
    setSaveResult(null);
    try {
      const data = await callPatch(false);
      setSaveResult({ ...data, localOnly: true });
      setContextContent(editedContent);
    } catch (e) {
      setSaveResult({ saved: false, pushed: false, git_log: [String(e)] });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    setSaveResult(null);
    try {
      const data = await callPatch(true);
      setSaveResult(data);
      setContextContent(editedContent);
    } catch (e) {
      setSaveResult({ saved: false, pushed: false, git_log: [String(e)] });
    } finally {
      setIsPushing(false);
    }
  };

  const hasChanges = editedContent !== contextContent;

  return (
    <div className="space-y-6">
      {/* Tabela de melhorias mais frequentes */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Melhorias Mais Frequentes nas Simulações
          </CardTitle>
          <CardDescription>
            {improvements.length > 0
              ? `${improvements.length} pontos de melhoria identificados em ${simulations.filter(s => s.evaluation?.improvements?.length).length} simulações com auditoria.`
              : "Nenhuma simulação com auditoria encontrada ainda."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {improvements.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Sem dados de melhorias ainda.</p>
          ) : (
            improvements.map((item, i) => <ImprovementRow key={i} item={item} />)
          )}
        </CardContent>
      </Card>

      {/* Editor do contexto do agente */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-[#002D62]" />
                Editor de Critérios de Avaliação
              </CardTitle>
              <CardDescription className="mt-1">
                Edite o arquivo <code className="bg-slate-100 px-1 rounded text-xs">yooga-agent-context.md</code> — define como o Auditor e o Coach avaliam os atendimentos. Salvar faz commit + push automático no repositório.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadContext}
              disabled={isLoadingContext}
              className="shrink-0 rounded-xl border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingContext ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingContext ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando arquivo...
            </div>
          ) : (
            <Textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="font-mono text-xs min-h-[420px] resize-y bg-slate-50 border-slate-200"
              placeholder="Conteúdo do yooga-agent-context.md..."
            />
          )}

          {/* Mensagem de commit */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Mensagem do commit</label>
            <input
              value={commitMsg}
              onChange={e => setCommitMsg(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#002D62]/20"
            />
          </div>

          {/* Resultado da ação */}
          {saveResult && (
            <div className={`rounded-xl px-4 py-3 text-sm flex flex-col gap-1 ${
              saveResult.pushed
                ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                : saveResult.saved
                  ? "bg-blue-50 text-blue-800 border border-blue-100"
                  : "bg-red-50 text-red-800 border border-red-100"
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                {saveResult.pushed ? (
                  <><CheckCircle2 className="w-4 h-4" /> Salvo e enviado ao GitHub!</>
                ) : saveResult.saved ? (
                  <><CheckCircle2 className="w-4 h-4" /> {saveResult.localOnly ? "Salvo no Cursor! Revise antes de fazer o push." : "Salvo localmente — push falhou."}</>
                ) : (
                  <><AlertCircle className="w-4 h-4" /> Erro ao salvar.</>
                )}
              </div>
              {saveResult.git_log?.filter(Boolean).map((line, i) => (
                <code key={i} className="text-xs opacity-70">{line}</code>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleSaveLocal}
              disabled={isSaving || isPushing || !hasChanges || isLoadingContext}
              className="rounded-xl gap-2 border-slate-200 hover:bg-slate-50"
            >
              {isSaving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                : <><Save className="w-4 h-4" /> Salvar no Cursor</>}
            </Button>
            <Button
              onClick={handlePush}
              disabled={isSaving || isPushing || isLoadingContext}
              className="bg-[#002D62] hover:bg-[#004094] text-white rounded-xl gap-2 px-6"
            >
              {isPushing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                : <><GitBranch className="w-4 h-4" /> Push para GitHub</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
