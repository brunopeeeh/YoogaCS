import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Info, Award, MessageSquare, BookOpen, Trash2, CheckCircle } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, removeNotification } from "@/utils/notification-manager";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(getNotifications());
    };

    updateNotifications();

    window.addEventListener("yooga-notifications-changed", updateNotifications);
    
    // Fechar dropdown ao clicar fora
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("yooga-notifications-changed", updateNotifications);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    setIsOpen(false);
    
    if (item.metadata?.simulationId) {
      sessionStorage.setItem("yooga_open_transcript_id", item.metadata.simulationId);
      navigate("/Reports");
    } else if (item.type === "badge") {
      navigate("/Dashboard");
    } else if (item.type === "modules") {
      navigate("/Modules");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "simulation":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "badge":
        return <Award className="w-4 h-4 text-orange-600" />;
      case "modules":
        return <BookOpen className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "simulation":
        return "bg-blue-50 border-blue-100";
      case "badge":
        return "bg-orange-50 border-orange-100";
      case "modules":
        return "bg-green-50 border-green-100";
      default:
        return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-slate-100 hover:text-slate-900 text-slate-600 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center border border-slate-200/40 bg-white/40 shadow-sm"
        aria-label="Abrir Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-pulse shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Painel Flutuante (Gaveta) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[500px] flex flex-col bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Notificações</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{unreadCount} não lidas</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Marcar lidas
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/60 max-h-[350px]">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-medium">Nenhuma notificação</p>
                <p className="text-xs text-slate-400 mt-1">Tudo limpo por aqui!</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-4 flex gap-3 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer ${
                    item.unread ? "bg-blue-50/15" : ""
                  }`}
                >
                  {/* Ícone */}
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${getBgColor(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs font-bold text-slate-900 leading-normal ${item.unread ? "font-extrabold" : ""}`}>
                        {item.title}
                      </p>
                      {item.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(item.timestamp), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(item.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Excluir notificação"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
