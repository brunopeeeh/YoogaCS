
import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UserProvider, useUser } from "./components/auth/UserProvider"; // Importar o Provider e o hook
import SyncStatusIndicator from "./components/sync/SyncStatusIndicator";
import NotificationBell from "./components/notifications/NotificationBell";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  BarChart3,
  Users,
  ShieldCheck,
  FileText,
  LogOut,
  BookOpen,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const userNavItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Trilhas de Aprendizado", url: createPageUrl("Modules"), icon: BookOpen },
  { title: "Nova Simulação", url: createPageUrl("Simulator"), icon: MessageSquare },
  { title: "Meus Relatórios", url: createPageUrl("Reports"), icon: BarChart3 },
];

const adminNavItems = [
  { title: "Dashboard Global", url: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
  { title: "Trilhas de Aprendizado", url: createPageUrl("Modules"), icon: BookOpen },
  { title: "Gerenciar Cenários", url: createPageUrl("Scenarios"), icon: FileText },
  { title: "Nova Simulação", url: createPageUrl("Simulator"), icon: MessageSquare },
  { title: "Gerenciar Usuários", url: createPageUrl("ManageUsers"), icon: Users },
  { title: "Configurações", url: createPageUrl("Settings"), icon: Settings },
];

const MobileSidebarTrigger = () => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="p-2 -ml-2 mr-2 text-slate-600 hover:text-[#002D62] hover:bg-slate-100/50 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
      aria-label="Toggle Sidebar"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
};

function AppLayout({ children, currentPageName }) {
  const location = useLocation();
  const { user, isLoading, logout } = useUser(); // Usar o hook

  const userRole = user?.role || 'user';
  const navigationItems = userRole === 'admin' ? adminNavItems : userNavItems;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se for a página de login, renderiza diretamente sem a barra lateral
  if (currentPageName === "Login") {
    if (user) {
      const redirectPath = user.role === "admin" ? "/AdminDashboard" : "/Dashboard";
      return <Navigate to={redirectPath} replace />;
    }
    return <div className="w-full min-h-screen">{children}</div>;
  }

  // Se não estiver logado e tentar acessar qualquer outra página, redireciona para Login
  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#002D62] to-[#004094] rounded-xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900">CS Coach</h1>
                <p className="text-xs text-slate-500">Simulador de Atendimento</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">
                Navegação {userRole === 'admin' ? '(Admin)' : '(Usuário)'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-[#002D62] transition-all duration-200 rounded-xl h-12 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-50/50 to-slate-50 text-[#002D62] shadow-sm border-l-2 border-[#FF6600]' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-3">
                Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Sistema Online
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-8 h-8 bg-gradient-to-r from-[#002D62] to-[#004094] rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {(user?.full_name || 'A')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name || 'Agente'}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {userRole === 'admin' ? 'Administrador' : 'Treinamento Ativo'}
                  </p>
                </div>
                {userRole === 'admin' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-xl transition-all duration-200 text-sm font-medium border border-transparent hover:border-red-100 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-slate-200/60 bg-white/60 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-40">
            {/* Esquerda: Menu Mobile e Identificação */}
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <MobileSidebarTrigger />
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <div className="w-8 h-8 bg-gradient-to-r from-[#002D62] to-[#004094] rounded-lg flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-bold text-base text-slate-900">CS Coach</h1>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100/80 px-2.5 py-1 rounded-md">
                  Yooga CS Coach
                </span>
              </div>
            </div>
            
            {/* Direita: Indicador de Sincronização + Sino de Notificações */}
            <div className="flex items-center gap-3.5">
              <SyncStatusIndicator />
              <NotificationBell />
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// O Layout principal agora apenas envolve a aplicação com o Provider
export default function Layout({ children, currentPageName }) {
  return (
    <UserProvider>
      <AppLayout currentPageName={currentPageName}>
        {children}
      </AppLayout>
    </UserProvider>
  )
}
