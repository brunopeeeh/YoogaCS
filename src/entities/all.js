/**
 * Entidades locais — substituem o SDK do base44.
 * Dados são persistidos no localStorage do navegador.
 */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function now() {
  return new Date().toISOString();
}

function createEntity(storageKey) {
  const getAll = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  };

  const saveAll = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  return {
    async list(orderBy = '-created_date') {
      let items = getAll();
      const desc = orderBy.startsWith('-');
      const field = orderBy.replace(/^-/, '');
      items = items.sort((a, b) => {
        const va = a[field] ?? '';
        const vb = b[field] ?? '';
        return desc ? (va < vb ? 1 : -1) : (va > vb ? 1 : -1);
      });
      return items;
    },

    async filter(criteria = {}, orderBy = '-created_date', limit = 100) {
      let items = getAll();
      items = items.filter(item =>
        Object.entries(criteria).every(([k, v]) => {
          const itemVal = item[k];
          if (typeof v === 'string' && typeof itemVal === 'string' && k === 'created_by') {
            return itemVal.toLowerCase() === v.toLowerCase();
          }
          return itemVal === v;
        })
      );
      const desc = orderBy.startsWith('-');
      const field = orderBy.replace(/^-/, '');
      items = items.sort((a, b) => {
        const va = a[field] ?? '';
        const vb = b[field] ?? '';
        return desc ? (va < vb ? 1 : -1) : (va > vb ? 1 : -1);
      });
      return items.slice(0, limit);
    },

    async get(id) {
      const items = getAll();
      return items.find(i => i.id === id) || null;
    },

    async create(data) {
      const items = getAll();
      const newItem = {
        id: generateId(),
        created_date: now(),
        updated_date: now(),
        created_by: 'local',
        ...data,
      };
      items.push(newItem);
      saveAll(items);
      return newItem;
    },

    async update(id, data) {
      const items = getAll();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Item not found');
      items[idx] = { ...items[idx], ...data, updated_date: now() };
      saveAll(items);
      return items[idx];
    },

    async delete(id) {
      const items = getAll().filter(i => i.id !== id);
      saveAll(items);
      return { id };
    },
  };
}

// Entidade User com suporte a perfil local e autenticação de verdade
const _userEntity = createEntity('db_users');

// Inicializar usuários de teste caso não existam
(async () => {
  try {
    let existing = await _userEntity.list();
    if (existing.length === 0) {
      // Criar admin principal
      await _userEntity.create({
        full_name: "Administrador Yooga",
        email: "admin@yooga.com.br",
        role: "admin",
        password: "admin123"
      });
      // Criar alguns agentes de teste para os 15 agentes reais
      await _userEntity.create({
        full_name: "Mariana Silva",
        email: "mariana.silva@yooga.com.br",
        role: "agent",
        password: "user123"
      });
      await _userEntity.create({
        full_name: "Pedro Oliveira",
        email: "pedro.oliveira@yooga.com.br",
        role: "agent",
        password: "user123"
      });
      existing = await _userEntity.list();
    }

    // Garantir criação do usuário do Bruno
    const hasBruno = existing.some(u => u.email === "bruno.oliveira@yooga.com.br");
    if (!hasBruno) {
      await _userEntity.create({
        full_name: "Bruno Oliveira",
        email: "bruno.oliveira@yooga.com.br",
        role: "admin",
        password: "123456"
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
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) {
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
    return await _userEntity.create({
      full_name: fullName,
      email: email.toLowerCase(),
      role,
      password
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

