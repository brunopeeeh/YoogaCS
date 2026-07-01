import React, { useState, useEffect } from "react";
import { User, Simulation } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserPlus, Users, Mail, ShieldCheck, Trash2, Key, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Estados do formulário
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent");
  const [password, setPassword] = useState("user123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsersAndStats = async () => {
    setIsLoading(true);
    try {
      const [userData, simulationsData] = await Promise.all([
        User.list(),
        Simulation.list()
      ]);

      setUsers(userData);

      // Calcular estatísticas por usuário
      const stats = {};
      userData.forEach(user => {
        const userSimulations = simulationsData.filter(sim => sim.created_by.toLowerCase() === user.email.toLowerCase());
        const completedSimulations = userSimulations.filter(sim => sim.status === 'concluida' && sim.evaluation);
        const avgScore = completedSimulations.length > 0
          ? Math.round(completedSimulations.reduce((acc, sim) => acc + sim.evaluation.overall_score, 0) / completedSimulations.length)
          : 0;

        stats[user.email] = {
          totalSimulations: userSimulations.length,
          completedSimulations: completedSimulations.length,
          averageScore: avgScore,
          lastActivity: userSimulations.length > 0
            ? new Date(Math.max(...userSimulations.map(s => new Date(s.created_date))))
            : null
        };
      });

      setUserStats(stats);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsersAndStats();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!email || !fullName || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome, e-mail e senha do agente.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await User.register(email, fullName, role, password);
      toast({
        title: "Sucesso!",
        description: `O agente ${fullName} foi cadastrado com sucesso.`,
        variant: "default"
      });
      // Limpar campos
      setFullName("");
      setEmail("");
      setRole("agent");
      setPassword("user123");
      // Recarregar
      await loadUsersAndStats();
    } catch (err) {
      toast({
        title: "Erro ao cadastrar",
        description: err.message || "E-mail já cadastrado ou formato inválido.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail, userName) => {
    if (userEmail === "admin@yooga.com.br") {
      toast({
        title: "Ação não permitida",
        description: "Não é possível excluir o administrador padrão do sistema.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o agente "${userName}"? Suas simulações e históricos serão preservados no histórico geral.`)) {
      return;
    }

    try {
      await User.delete(userId);
      toast({
        title: "Usuário removido",
        description: "O usuário foi excluído com sucesso do banco local.",
        variant: "default"
      });
      await loadUsersAndStats();
    } catch (err) {
      toast({
        title: "Erro ao deletar",
        description: err.message || "Não foi possível remover o usuário.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yooga-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Gerenciar Equipe CS
            </h1>
            <p className="text-slate-600">
              Visualize a performance, atividade e gerencie o cadastro dos agentes da Yooga
            </p>
          </div>
          <Badge variant="secondary" className="gap-2 px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
            <Users className="w-4 h-4" />
            {users.length} agentes ativos
          </Badge>
        </div>

        {/* Layout em Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Formulário de Criação (Lateral Esquerda ou 1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white shadow-md border-slate-200/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800 text-xl">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Cadastrar Novo Agente
                </CardTitle>
                <CardDescription>
                  Adicione novos analistas para começarem os treinamentos e simulações.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateUser}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700">Nome Completo</Label>
                    <Input
                      id="fullName"
                      placeholder="Ex: Mariana Silva"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="rounded-xl border-slate-200 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">E-mail Corporativo</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="mariana@yooga.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border-slate-200 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Senha Provisória</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type="text"
                        placeholder="Senha de acesso provisória"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-9 rounded-xl border-slate-200 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-700">Nível de Acesso</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <option value="agent">Agente (CS / Suporte)</option>
                      <option value="admin">Administrador (Coordenador / Líder)</option>
                    </select>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-yooga-primary-dark hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-white font-semibold rounded-xl h-11 cursor-pointer"
                  >
                    {isSubmitting ? "Cadastrando..." : "Confirmar Cadastro"}
                  </Button>
                </CardContent>
              </form>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Dica de Migração para Banco
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-primary leading-relaxed space-y-1">
                <p>
                  O cadastro de equipe armazena as informações localmente em formato estruturado.
                </p>
                <p>
                  Quando formos migrar para o **Supabase**, substituiremos esta função local por uma chamada ao Supabase Auth + inserção na tabela <code className="bg-primary/20 px-1 rounded font-mono">profiles</code>. A modelagem local já segue esse padrão!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Usuários e Estatísticas (Direita ou 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white shadow-md border-slate-200/80">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-800 text-xl flex items-center gap-2">
                    <Users className="w-5 h-5 text-yooga-accent" />
                    Lista de Agentes Cadastrados
                  </CardTitle>
                  <CardDescription>
                    Monitore o progresso do aprendizado da sua equipe de 15 agentes.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center text-slate-500">
                    Carregando equipe Yooga...
                  </div>
                ) : (
                  <div className="grid gap-5">
                    {users.map(user => {
                      const stats = userStats[user.email] || {};
                      return (
                        <Card key={user.id} className="p-5 md:p-6 border-l-4 border-l-[#002D62] hover:shadow-md transition-all duration-200">
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-3 flex-wrap min-w-0 flex-1">
                                <div className="w-11 h-11 bg-gradient-to-r from-[#002D62] to-[#004094] rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                                  {(user.full_name || user.email)[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 truncate">{user.full_name || 'Nome não informado'}</p>
                                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                                    <Mail className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                  </div>
                                </div>
                                <Badge
                                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                                  className={user.role === 'admin' ? 'bg-primary hover:bg-yooga-primary-dark text-white' : 'bg-slate-100 text-slate-700'}
                                >
                                  {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1 shrink-0" />}
                                  {user.role === 'admin' ? 'Líder / Admin' : 'CS Agente'}
                                </Badge>
                              </div>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteUser(user.id, user.email, user.full_name)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl self-end sm:self-center shrink-0"
                                title="Excluir Usuário"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-100">
                              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-center min-h-[88px] flex flex-col justify-center gap-2">
                                <div className="text-2xl sm:text-3xl font-bold text-blue-600 leading-none">
                                  {stats.totalSimulations || 0}
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                                  Simulações
                                </div>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-center min-h-[88px] flex flex-col justify-center gap-2">
                                <div className="text-2xl sm:text-3xl font-bold text-green-600 leading-none">
                                  {stats.completedSimulations || 0}
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                                  Concluídas
                                </div>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-center min-h-[88px] flex flex-col justify-center gap-2">
                                <div className="text-2xl sm:text-3xl font-bold text-[#FF6600] leading-none">
                                  {stats.averageScore || 0}%
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                                  Score médio
                                </div>
                              </div>
                              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-center min-h-[88px] flex flex-col justify-center gap-2">
                                <div className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                                  {stats.lastActivity 
                                    ? format(stats.lastActivity, 'dd/MM/yyyy', { locale: ptBR })
                                    : 'Nunca'
                                  }
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                                  Última atividade
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}