const BACKEND_URL = "http://localhost:8000";
const API_HEADERS = {
  "X-API-Key": "yooga-dev-2026-xK9mP2nQ",
  "Content-Type": "application/json"
};

async function runCleanup() {
  console.log("🧹 Iniciando limpeza de cenários duplicados no backend...");
  try {
    // 1. Obter a lista de cenários
    const res = await fetch(`${BACKEND_URL}/api/db/db_scenarios`, {
      headers: API_HEADERS
    });
    if (!res.ok) {
      throw new Error(`Falha ao obter cenários: ${res.status}`);
    }
    const scenarios = await res.json();
    console.log(`🔍 Total de cenários encontrados no banco: ${scenarios.length}`);

    // 2. Agrupar por título
    const groups = {};
    scenarios.forEach(s => {
      const title = s.title.trim();
      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(s);
    });

    let deleteCount = 0;

    // 3. Identificar e remover duplicatas
    for (const [title, list] of Object.entries(groups)) {
      if (list.length > 1) {
        console.log(`⚠️ Encontrado título duplicado: "${title}" (${list.length} ocorrências)`);
        
        // Ordenar por data de criação para manter o mais antigo
        list.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        
        const keep = list[0];
        const duplicates = list.slice(1);
        
        console.log(`   Keep: ID ${keep.id} (criado em ${keep.created_date})`);
        
        for (const dup of duplicates) {
          console.log(`   ❌ Deletando duplicata: ID ${dup.id} (criado em ${dup.created_date})`);
          
          const delRes = await fetch(`${BACKEND_URL}/api/db/db_scenarios/${dup.id}`, {
            method: "DELETE",
            headers: API_HEADERS
          });
          
          if (delRes.ok) {
            deleteCount++;
          } else {
            console.error(`      ❌ Erro ao deletar ID ${dup.id}: ${delRes.status}`);
          }
        }
      }
    }

    console.log(`\n============================================================`);
    console.log(`🎉 Limpeza concluída com sucesso!`);
    console.log(`🗑️ Total de cenários duplicados excluídos: ${deleteCount}`);
    console.log(`============================================================`);
  } catch (err) {
    console.error("❌ Erro durante o processo de limpeza:", err.message);
  }
}

runCleanup();
