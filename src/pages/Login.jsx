import React, { useState } from "react";
import { useUser } from "../components/auth/UserProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Mail, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const loggedUser = await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${loggedUser.full_name}!`,
        variant: "default",
      });
      
      // Redireciona de acordo com o perfil
      if (loggedUser.role === "admin") {
        navigate("/AdminDashboard");
      } else {
        navigate("/Dashboard");
      }
    } catch (err) {
      setError(err.message || "Erro ao realizar o login. Verifique suas credenciais.");
      toast({
        title: "Erro no login",
        description: err.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00001B] via-slate-950 to-[#124769]/20 px-4 py-12">
      {/* Detalhes de iluminação em background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yooga-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yooga-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-yooga-primary to-yooga-accent shadow-lg shadow-yooga-primary/20 mb-2">
            <MessageSquare className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Yooga CS Coach
          </h1>
          <p className="text-slate-400 text-sm">
            Treinamento e Simulação de Atendimento Baseado no FAQ
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl text-slate-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">Entrar na Plataforma</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              Insira suas credenciais da Yooga para começar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-900/50 text-red-200 rounded-xl text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@yooga.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 focus-visible:ring-yooga-primary focus-visible:ring-offset-slate-950 h-11 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-300 font-medium">Senha</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-slate-800 text-slate-100 placeholder-slate-600 focus-visible:ring-yooga-primary focus-visible:ring-offset-slate-950 h-11 rounded-xl"
                    required
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yooga-primary to-yooga-primary-dark hover:opacity-95 text-white font-bold h-11 rounded-xl shadow-lg shadow-yooga-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                {isSubmitting ? "Autenticando..." : "Entrar"}
              </Button>
              
              <div className="text-center text-xs text-slate-500">
                <p>Desenvolvimento local (LocalStorage)</p>
                <p className="mt-1">
                  Admin Padrão: <span className="text-slate-400 font-mono">admin@yooga.com.br / admin123</span>
                </p>
                <p className="mt-0.5">
                  Agente Padrão: <span className="text-slate-400 font-mono">mariana.silva@yooga.com.br / user123</span>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
