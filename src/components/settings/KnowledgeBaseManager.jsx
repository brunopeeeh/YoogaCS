import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UploadFile } from "@/integrations/Core";
import { Book, Upload, FileText, Trash2, Loader2, Plus, X, Tag } from "lucide-react";

const DEFAULT_TAGS = [
  { value: "pdv", label: "PDV", color: "bg-blue-100 text-blue-800" },
  { value: "delivery", label: "Delivery", color: "bg-green-100 text-green-800" },
  { value: "fiscal", label: "Fiscal", color: "bg-sky-100 text-sky-800" },
  { value: "financeiro", label: "Financeiro", color: "bg-orange-100 text-orange-800" },
  { value: "estoque", label: "Estoque", color: "bg-teal-100 text-teal-800" },
  { value: "relatorios", label: "Relatórios", color: "bg-slate-100 text-slate-800" },
  { value: "integracao", label: "Integração", color: "bg-pink-100 text-pink-800" },
  { value: "suporte", label: "Suporte", color: "bg-gray-100 text-gray-800" },
  { value: "configuracao", label: "Configuração", color: "bg-yellow-100 text-yellow-800" }
];

export default function KnowledgeBaseManager({ files = [], onUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [newDescription, setNewDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);

  // Combinar tags padrão com personalizadas
  const allAvailableTags = [
    ...DEFAULT_TAGS,
    ...customTags.map(tag => ({
      value: tag.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      label: tag,
      color: "bg-slate-100 text-slate-800"
    }))
  ];

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = selectedFiles
        .filter(file => file.type === "application/pdf")
        .map(async (file) => {
          const { file_url } = await UploadFile({ file });
          return { 
            name: file.name, 
            url: file_url,
            tags: [],
            description: ""
          };
        });

      const newFiles = await Promise.all(uploadPromises);
      onUpdate([...files, ...newFiles]);
    } catch (error) {
      console.error("Erro no upload:", error);
      setUploadError("Falha no upload de um ou mais arquivos. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onUpdate(updatedFiles);
  };

  const startEditingFile = (index) => {
    const file = files[index];
    setEditingFile(index);
    setNewDescription(file.description || "");
    setSelectedTags(file.tags || []);
  };

  const saveFileEdits = () => {
    if (editingFile === null) return;
    
    const updatedFiles = [...files];
    updatedFiles[editingFile] = {
      ...updatedFiles[editingFile],
      description: newDescription,
      tags: selectedTags
    };
    
    onUpdate(updatedFiles);
    setEditingFile(null);
    setNewDescription("");
    setSelectedTags([]);
  };

  const cancelFileEdits = () => {
    setEditingFile(null);
    setNewDescription("");
    setSelectedTags([]);
  };

  const toggleTag = (tagValue) => {
    setSelectedTags(prev => 
      prev.includes(tagValue) 
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const addCustomTag = () => {
    if (newTagName.trim() && !customTags.includes(newTagName.trim())) {
      setCustomTags(prev => [...prev, newTagName.trim()]);
      setNewTagName("");
      setShowAddTag(false);
    }
  };

  const removeCustomTag = (tagToRemove) => {
    setCustomTags(prev => prev.filter(tag => tag !== tagToRemove));
    // Remover a tag de todos os arquivos que a usam
    const tagValue = tagToRemove.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const updatedFiles = files.map(file => ({
      ...file,
      tags: file.tags?.filter(tag => tag !== tagValue) || []
    }));
    onUpdate(updatedFiles);
  };

  const getTagColor = (tagValue) => {
    const tag = allAvailableTags.find(t => t.value === tagValue);
    return tag ? tag.color : "bg-gray-100 text-gray-800";
  };

  const getTagLabel = (tagValue) => {
    const tag = allAvailableTags.find(t => t.value === tagValue);
    return tag ? tag.label : tagValue;
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          Base de Conhecimento (PDFs)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gerenciamento de Tags Personalizadas */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">
            Gerenciar Tags Personalizadas
          </Label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {DEFAULT_TAGS.map((tag) => (
              <Badge key={tag.value} className={`text-xs ${tag.color}`}>
                {tag.label} (Padrão)
              </Badge>
            ))}
            {customTags.map((tag) => (
              <Badge key={tag} className="text-xs bg-slate-100 text-slate-800 gap-1">
                {tag}
                <button
                  onClick={() => removeCustomTag(tag)}
                  aria-label="Remover tag"
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {showAddTag ? (
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da nova tag..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
              />
              <Button onClick={addCustomTag} size="sm" aria-label="Confirmar nova tag">
                <Plus className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowAddTag(false)} variant="outline" size="sm" aria-label="Cancelar nova tag">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowAddTag(true)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Nova Tag
            </Button>
          )}
        </div>

        {/* Upload de Arquivos */}
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 mb-2">
            Carregue arquivos PDF para alimentar a IA com o conhecimento da sua empresa.
          </label>
          <div className="relative">
            <Button asChild variant="outline" className="w-full">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Escolher Arquivos PDF
              </label>
            </Button>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          {isUploading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600" role="status" aria-live="polite">
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando arquivos...
            </div>
          )}
          {uploadError && (
            <p className="text-sm text-red-600 mt-2">{uploadError}</p>
          )}
        </div>

        {/* Lista de Arquivos */}
        <div>
          <h4 className="text-md font-medium text-slate-800 mb-2">Arquivos Carregados</h4>
          {files.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4 border-2 border-dashed rounded-lg">
              Nenhum arquivo na base de conhecimento.
            </p>
          ) : (
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border">
                  {editingFile === index ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Descrição do arquivo</Label>
                        <Textarea
                          id="description"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          placeholder="Descreva o conteúdo deste arquivo..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Tags do conteúdo</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {allAvailableTags.map((tag) => (
                            <button
                              key={tag.value}
                              type="button"
                              onClick={() => toggleTag(tag.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                selectedTags.includes(tag.value)
                                  ? `${tag.color} border-current`
                                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <Tag className="w-3 h-3 mr-1 inline" />
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveFileEdits}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelFileEdits}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="truncate max-w-xs">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Editar tags do arquivo"
                            onClick={() => startEditingFile(index)}
                            className="text-slate-500 hover:text-blue-600"
                          >
                            <Tag className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Excluir arquivo"
                            onClick={() => removeFile(index)}
                            className="text-slate-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {file.description && (
                        <p className="text-xs text-slate-600">{file.description}</p>
                      )}
                      
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {file.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} className={`text-xs ${getTagColor(tag)}`}>
                              {getTagLabel(tag)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}