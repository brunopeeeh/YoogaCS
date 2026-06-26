import React, { useState, useEffect } from "react";
import { CompanyProfile } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

import ToneOfVoiceForm from "../components/settings/ToneOfVoiceForm";
import KnowledgeBaseManager from "../components/settings/KnowledgeBaseManager";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const profiles = await CompanyProfile.list();
    if (profiles.length > 0) {
      setProfile(profiles[0]);
    } else {
      setProfile({
        company_name: "",
        tone_of_voice: "",
        knowledge_base_files: []
      });
    }
    setIsLoading(false);
  };

  const handleUpdate = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (profile.id) {
      await CompanyProfile.update(profile.id, profile);
    } else {
      const newProfile = await CompanyProfile.create(profile);
      setProfile(newProfile);
    }
    setIsSaving(false);
    // You might want to add a success toast notification here
  };
  
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Configurações da Empresa
            </h1>
            <p className="text-slate-600">
              Personalize a IA com a identidade e conhecimento da sua empresa
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#002D62] hover:bg-[#004094] gap-2 h-12 px-6 shadow-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-white font-bold"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Tone of Voice */}
        <ToneOfVoiceForm
          toneOfVoice={profile.tone_of_voice}
          onUpdate={(value) => handleUpdate('tone_of_voice', value)}
        />

        {/* Knowledge Base */}
        <KnowledgeBaseManager
          files={profile.knowledge_base_files}
          onUpdate={(files) => handleUpdate('knowledge_base_files', files)}
        />
      </div>
    </div>
  );
}