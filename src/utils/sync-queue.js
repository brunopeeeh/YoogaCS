import { apiRequest } from "./api-client";

export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem("yooga_sync_queue") || "[]");
  } catch {
    return [];
  }
}

export function saveQueue(queue) {
  localStorage.setItem("yooga_sync_queue", JSON.stringify(queue));
  dispatchSyncEvent();
}

export function addToQueue(storageKey, method, id, data) {
  const queue = getQueue();
  
  // Se for um item duplicado que já está pendente de update, podemos atualizar os dados dele na fila.
  // Se for uma deleção de um item recém-criado na fila (ainda não sincronizado), podemos remover ambos.
  // Para manter a simplicidade e a ordem cronológica estrita, apenas adicionamos a mutação.
  queue.push({
    storageKey,
    method,
    id,
    data,
    timestamp: Date.now()
  });
  
  saveQueue(queue);
  console.log(`[Yooga Sync] Mutação enfileirada: ${method} em ${storageKey} (${id})`);
  
  // Tentar rodar sincronização silenciosa se estiver online
  if (navigator.onLine) {
    syncNow();
  }
}

export function clearQueue() {
  saveQueue([]);
}

let isSyncing = false;

export async function syncNow() {
  if (isSyncing) return { success: false, msg: "Sincronização em andamento" };
  const queue = getQueue();
  if (queue.length === 0) return { success: true, count: 0 };

  isSyncing = true;
  console.log(`[Yooga Sync] Iniciando sincronização de ${queue.length} mutações...`);
  
  const remainingQueue = [];
  let successCount = 0;
  let hasFailed = false;

  for (const item of queue) {
    if (hasFailed) {
      remainingQueue.push(item);
      continue;
    }

    try {
      if (item.method === "create") {
        await apiRequest(`/api/db/${item.storageKey}`, "POST", item.data);
      } else if (item.method === "update") {
        await apiRequest(`/api/db/${item.storageKey}/${item.id}`, "PUT", item.data);
      } else if (item.method === "delete") {
        await apiRequest(`/api/db/${item.storageKey}/${item.id}`, "DELETE");
      }
      successCount++;
      console.log(`[Yooga Sync] Item sincronizado com sucesso: ${item.id}`);
    } catch (err) {
      console.error(`[Yooga Sync] Erro ao sincronizar item ${item.id}:`, err.message);
      hasFailed = true;
      remainingQueue.push(item); // Mantém o item atual para re-tentativa posterior
    }
  }

  saveQueue(remainingQueue);
  isSyncing = false;

  return {
    success: !hasFailed,
    count: successCount,
    pending: remainingQueue.length
  };
}

function dispatchSyncEvent() {
  const event = new CustomEvent("yooga-sync-changed", {
    detail: {
      isOnline: navigator.onLine,
      pendingCount: getQueue().length
    }
  });
  window.dispatchEvent(event);
}

// Ouvir alterações automáticas de conectividade
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[Yooga Sync] Rede restabelecida. Disparando autossincronização...");
    dispatchSyncEvent();
    syncNow();
  });
  
  window.addEventListener("offline", () => {
    console.log("[Yooga Sync] Dispositivo offline.");
    dispatchSyncEvent();
  });
}
