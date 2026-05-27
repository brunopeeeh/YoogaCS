/**
 * Entidades centralizadas com fallback local — substituem o localStorage puro.
 * Tenta persistir no Supabase via API Python e degrada suavemente para o localStorage local se offline.
 */

import { generateId, now, createLocalEntity } from "./base.js";
import { apiRequest } from "@/utils/api-client";
import { addToQueue } from "@/utils/sync-queue";

export { apiRequest };

function createEntity(storageKey) {
  const localEntity = createLocalEntity(storageKey);

  return {
    async list(orderBy = '-created_date') {
      try {
        return await apiRequest(`/api/db/${storageKey}?orderBy=${orderBy}`);
      } catch (err) {
        console.warn(`[Supabase Migration] API list falhou para ${storageKey}, usando fallback local:`, err.message);
        return localEntity.list(orderBy);
      }
    },

    async filter(criteria = {}, orderBy = '-created_date', limit = 100) {
      try {
        return await apiRequest(`/api/db/${storageKey}/filter`, "POST", { criteria, orderBy, limit });
      } catch (err) {
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
        console.warn(`[Supabase Migration] API update falhou para ${storageKey}/${id}, usando fallback local e enfileirando:`, err.message);
        const localItem = localEntity.update(id, data);
        addToQueue(storageKey, "update", id, data);
        return localItem;
      }
    },

    async delete(id) {
      try {
        return await apiRequest(`/api/db/${storageKey}/${id}`, "DELETE");
      } catch (err) {
        console.warn(`[Supabase Migration] API delete falhou para ${storageKey}/${id}, usando fallback local e enfileirando:`, err.message);
        const localItem = localEntity.delete(id);
        addToQueue(storageKey, "delete", id, null);
        return localItem;
      }
    }
  };
}
// Função para gerar hash SHA-256 de uma senha (Web Crypto API)
async function hashPassword(password) {
  if (!password) return "";
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Entidade User com suporte a perfil local e autenticação de verdade
const _userEntity = createEntity('db_users');

// Inicializar usuários de teste caso não existam
(async () => {
  try {
    let existing = await _userEntity.list();

    // Garantir criação do admin principal
    const hasAdmin = existing.some(u => u.email.toLowerCase() === "admin@yooga.com.br");
    if (!hasAdmin) {
      const hashedPassword = await hashPassword("admin123");
      await _userEntity.create({
        full_name: "Administrador Yooga",
        email: "admin@yooga.com.br",
        role: "admin",
        password: hashedPassword
      });
    }

    // Garantir criação dos agentes de teste
    const hasMariana = existing.some(u => u.email.toLowerCase() === "mariana.silva@yooga.com.br");
    if (!hasMariana) {
      const hashedPassword = await hashPassword("user123");
      await _userEntity.create({
        full_name: "Mariana Silva",
        email: "mariana.silva@yooga.com.br",
        role: "agent",
        password: hashedPassword
      });
    }

    const hasPedro = existing.some(u => u.email.toLowerCase() === "pedro.oliveira@yooga.com.br");
    if (!hasPedro) {
      const hashedPassword = await hashPassword("user123");
      await _userEntity.create({
        full_name: "Pedro Oliveira",
        email: "pedro.oliveira@yooga.com.br",
        role: "agent",
        password: hashedPassword
      });
    }

    // Garantir criação do usuário do Bruno
    const hasBruno = existing.some(u => u.email.toLowerCase() === "bruno.oliveira@yooga.com.br");
    if (!hasBruno) {
      const hashedPassword = await hashPassword("123456");
      await _userEntity.create({
        full_name: "Bruno Oliveira",
        email: "bruno.oliveira@yooga.com.br",
        role: "admin",
        password: hashedPassword
      });
    }
  } catch (err) {
    console.error("Erro ao inicializar usuários locais:", err);
  }
})();

export const User = {
  ..._userEntity,
  
  async me() {
    try {
      const stored = sessionStorage.getItem('current_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null; // Forçar tela de login se não houver sessão ativa
  },

  async login(email, password) {
    const users = await _userEntity.list();
    const hashedInput = await hashPassword(password);
    
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      throw new Error("E-mail ou senha incorretos.");
    }

    let isMatch = found.password === hashedInput;

    // Fallback de Auto-Migração: Se a senha armazenada for igual à senha digitada em texto puro, migra para o hash
    if (!isMatch && found.password === password) {
      isMatch = true;
      try {
        await _userEntity.update(found.id, { password: hashedInput });
        console.log(`[Yooga Auth] Senha do usuário ${email} auto-migrada para hash SHA-256 com sucesso.`);
      } catch (err) {
        console.warn(`[Yooga Auth] Falha ao auto-migrar senha para hash para ${email}:`, err);
      }
    }

    if (!isMatch) {
      throw new Error("E-mail ou senha incorretos.");
    }

    const sessionUser = {
      id: found.id,
      full_name: found.full_name,
      email: found.email,
      role: found.role
    };
    sessionStorage.setItem('current_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  async register(email, fullName, role = 'agent', password = 'user123') {
    const users = await _userEntity.list();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error("E-mail já cadastrado.");
    }
    const hashedPassword = await hashPassword(password);
    return await _userEntity.create({
      full_name: fullName,
      email: email.toLowerCase(),
      role,
      password: hashedPassword
    });
  },

  async logout() {
    sessionStorage.removeItem('current_user');
  }
};

export const Scenario = createEntity('db_scenarios');
export const Simulation = createEntity('db_simulations');
export const CompanyProfile = createEntity('db_company_profiles');
export const AgentPerformance = createEntity('db_agent_performances');

export default { User, Scenario, Simulation, CompanyProfile, AgentPerformance };

