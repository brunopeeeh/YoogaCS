/**
 * Entidades centralizadas com fallback local — substituem o localStorage puro.
 * Tenta persistir no Supabase via API Python e degrada suavemente para o localStorage local se offline.
 *
 * IMPORTANTE: erros de autorização (401/403) e de misconfiguração (503) nunca
 * caem no fallback local — degradar nesses casos esconderia a falta de permissão
 * e allow-listaria o usuário a "funcionar" sem estar autenticado.
 */

import { generateId, now, createLocalEntity } from "./base.js";
import { apiRequest, isFatalError } from "@/utils/api-client";
import { addToQueue } from "@/utils/sync-queue";
import { clearAuthSession, getAuthToken, getStoredUser, setAuthSession } from "@/utils/auth-token";

export { apiRequest };

function createEntity(storageKey) {
  const localEntity = createLocalEntity(storageKey);

  return {
    async list(orderBy = '-created_date') {
      try {
        return await apiRequest(`/api/db/${storageKey}?orderBy=${orderBy}`);
      } catch (err) {
        if (isFatalError(err)) throw err;
        console.warn(`[Supabase Migration] API list falhou para ${storageKey}, usando fallback local:`, err.message);
        return localEntity.list(orderBy);
      }
    },

    async filter(criteria = {}, orderBy = '-created_date', limit = 100) {
      try {
        return await apiRequest(`/api/db/${storageKey}/filter`, "POST", { criteria, orderBy, limit });
      } catch (err) {
        if (isFatalError(err)) throw err;
        console.warn(`[Supabase Migration] API filter falhou para ${storageKey}, usando fallback local:`, err.message);
        return localEntity.filter(criteria, orderBy, limit);
      }
    },

    async get(id) {
      try {
        return await apiRequest(`/api/db/${storageKey}/${id}`);
      } catch (err) {
        console.warn(`[Supabase Migration] API get falhou para ${storageKey}/${id}, usando fallback local:`, err.message);
        return localEntity.get(id);
      }
    },

    async create(data) {
      const { skipSyncQueue, ...cleanData } = data;
      const payload = {
        id: generateId(),
        created_date: now(),
        updated_date: now(),
        created_by: 'central',
        ...cleanData,
      };
      try {
        return await apiRequest(`/api/db/${storageKey}`, "POST", payload);
      } catch (err) {
        if (isFatalError(err)) throw err;
        console.warn(`[Supabase Migration] API create falhou para ${storageKey}, usando fallback local e enfileirando:`, err.message);
        const localItem = localEntity.create(payload);
        if (!skipSyncQueue) {
          addToQueue(storageKey, "create", payload.id, payload);
        }
        return localItem;
      }
    },

    async update(id, data) {
      try {
        return await apiRequest(`/api/db/${storageKey}/${id}`, "PUT", data);
      } catch (err) {
        if (isFatalError(err)) throw err;
        console.warn(`[Supabase Migration] API update falhou para ${storageKey}/${id}, usando fallback local e enfileirando:`, err.message);
        let localItem;
        try {
          localItem = localEntity.update(id, data);
        } catch (localErr) {
          // Se o item não existir localmente no localStorage, cria ele para evitar travamento da aplicação
          localItem = localEntity.create({ id, ...data });
        }
        addToQueue(storageKey, "update", id, data);
        return localItem;
      }
    },

    async delete(id) {
      try {
        return await apiRequest(`/api/db/${storageKey}/${id}`, "DELETE");
      } catch (err) {
        if (isFatalError(err)) throw err;
        console.warn(`[Supabase Migration] API delete falhou para ${storageKey}/${id}, usando fallback local e enfileirando:`, err.message);
        const localItem = localEntity.delete(id);
        addToQueue(storageKey, "delete", id, null);
        return localItem;
      }
    }
  };
}
// Entidade User com suporte a perfil local e autenticação de verdade
const _userEntity = createEntity('db_users');

export const User = {
  ..._userEntity,

  async me() {
    // Sem token não há sessão: força a tela de login.
    if (!getAuthToken()) {
      clearAuthSession();
      return null;
    }

    const stored = getStoredUser();
    if (!stored) {
      clearAuthSession();
      return null;
    }

    try {
      // Revalida a sessão no backend (papel atual + token ainda válido).
      const fresh = await apiRequest("/api/auth/me", "GET");
      const sessionUser = {
        id: fresh.id,
        full_name: fresh.full_name,
        email: fresh.email,
        role: fresh.role,
      };
      setAuthSession(sessionUser, getAuthToken());
      return sessionUser;
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        clearAuthSession();
        return null;
      }
      // Backend indisponível: mantém a sessão local para o app funcionar offline.
      console.warn("[Yooga Auth] Backend indisponível ao validar sessão, mantendo sessão local:", err.message);
      return stored;
    }
  },

  async login(email, password) {
    // Autenticação exclusivamente no backend (bcrypt + JWT). Não existe fallback
    // local: contas com senha padrão ou hash fraco não podem autenticar.
    const result = await apiRequest("/api/auth/login", "POST", { email, password });
    const sessionUser = {
      id: result.id,
      full_name: result.full_name,
      email: result.email,
      role: result.role
    };
    setAuthSession(sessionUser, result.token);
    return sessionUser;
  },

  async register(email, fullName, role = 'agent', password) {
    if (!password) {
      throw new Error("Informe uma senha para o novo usuário.");
    }

    const users = await _userEntity.list();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("E-mail já cadastrado.");
    }

    // A senha chega em texto puro ao backend, que a grava com bcrypt.
    return await _userEntity.create({
      full_name: fullName,
      email: email.toLowerCase(),
      role,
      password
    });
  },

  async logout() {
    clearAuthSession();
  }
};

export const Scenario = createEntity('db_scenarios');
export const Simulation = createEntity('db_simulations');
export const CompanyProfile = createEntity('db_company_profiles');
export const AgentPerformance = createEntity('db_agent_performances');

export default { User, Scenario, Simulation, CompanyProfile, AgentPerformance };

