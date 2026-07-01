/**
 * Módulo compartilhado com utilitários base para persistência local (localStorage).
 * Utilizado para evitar duplicação de lógica entre all.js e Knowledge.js.
 */

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function now() {
  return new Date().toISOString();
}

export function createLocalEntity(storageKey) {
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
    list(orderBy = '-created_date') {
      let items = getAll();
      const desc = orderBy.startsWith('-');
      const field = orderBy.replace(/^-/, '');
      items = items.sort((a, b) => {
        const va = a[field];
        const vb = b[field];
        if (typeof va === 'number' && typeof vb === 'number') {
          return desc ? vb - va : va - vb;
        }
        const sa = va ?? '';
        const sb = vb ?? '';
        return desc ? (sa < sb ? 1 : -1) : (sa > sb ? 1 : -1);
      });
      return items;
    },

    filter(criteria = {}, orderBy = '-created_date', limit = 100) {
      let items = getAll();
      items = items.filter(item =>
        Object.entries(criteria).every(([k, v]) => {
          const itemVal = item[k];
          if (itemVal === undefined) return false;
          if (typeof v === 'string' && typeof itemVal === 'string') {
            return itemVal.toLowerCase() === v.toLowerCase();
          }
          return itemVal === v;
        })
      );
      const desc = orderBy.startsWith('-');
      const field = orderBy.replace(/^-/, '');
      items = items.sort((a, b) => {
        const va = a[field];
        const vb = b[field];
        if (typeof va === 'number' && typeof vb === 'number') {
          return desc ? vb - va : va - vb;
        }
        const sa = va ?? '';
        const sb = vb ?? '';
        return desc ? (sa < sb ? 1 : -1) : (sa > sb ? 1 : -1);
      });
      return items.slice(0, limit);
    },

    get(id) {
      const items = getAll();
      return items.find(i => i.id === id) || null;
    },

    create(data) {
      const items = getAll();
      const newItem = {
        id: data.id || generateId(),
        created_date: data.created_date || now(),
        updated_date: data.updated_date || now(),
        created_by: data.created_by || 'local',
        ...data,
      };
      items.push(newItem);
      saveAll(items);
      return newItem;
    },

    update(id, data) {
      const items = getAll();
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Item não encontrado');
      items[idx] = { ...items[idx], ...data, updated_date: now() };
      saveAll(items);
      return items[idx];
    },

    delete(id) {
      const items = getAll().filter(i => i.id !== id);
      saveAll(items);
      return { id };
    },
  };
}
