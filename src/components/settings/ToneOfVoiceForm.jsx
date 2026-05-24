import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Type } from "lucide-react";

export default function ToneOfVoiceForm({ toneOfVoice, onUpdate }) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          Tom de Voz da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="tone-of-voice">
            Descreva o tom de voz que a IA deve adotar.
          </Label>
          <Textarea
            id="tone-of-voice"
            value={toneOfVoice || ""}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Ex: Somos uma empresa formal e técnica. Use uma linguagem precisa, profissional e evite gírias. Seja sempre solícito e paciente..."
            rows={6}
            className="bg-white"
          />
          <p className="text-xs text-slate-500">
            Esta descrição guiará a IA para simular clientes e fornecer feedback alinhado à sua cultura.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}