import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.resolve(__dirname, '../src/data/knowledge-base');
const INDEX_FILE = path.join(KB_DIR, '_index.md');

// Nomes amigáveis para exibir no sumário
const CATEGORY_NAMES = {
  'balancas-e-impressoras': 'Balanças e Impressoras',
  'delivery': 'Delivery',
  'fiscal': 'Fiscal',
  'integracoes': 'Integrações',
  'painel-de-relatorios': 'Painel de Relatórios',
  'pdv-mesa-e-balcao': 'PDV Mesa e Balcão',
  'perguntas-frequentes': 'Perguntas Frequentes',
  'planos-e-precos': 'Planos e Preços',
  'yooga-pay': 'Yooga Pay'
};

// Extrai frontmatter de forma robusta via Regex
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content };
  
  const yamlStr = match[1];
  const body = match[2];
  
  const data = {};
  yamlStr.split(/\r?\n/).forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join(':').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  });
  
  return { data, content: body };
}

// Varre pastas buscando arquivos Markdown
function scanDirectory(dir, category = '') {
  let results = [];
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(scanDirectory(fullPath, entry));
    } else if (entry.endsWith('.md') && entry !== '_index.md') {
      const relativePath = path.relative(KB_DIR, fullPath).replace(/\\/g, '/');
      const content = fs.readFileSync(fullPath, 'utf-8');
      const { data } = parseFrontmatter(content);

      // Determinar o título
      let title = data.title;
      if (!title) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        title = titleMatch ? titleMatch[1].trim() : path.basename(entry, '.md');
      }

      results.push({
        title,
        relativePath,
        category: category || 'perguntas-frequentes',
        source: data.source || ''
      });
    }
  }

  return results;
}

function run() {
  console.log("=== INICIANDO COMPILAÇÃO DO ÍNDICE DE ARTIGOS YOOGA ===");
  console.log(`Buscando artigos locais em: ${KB_DIR}...\n`);

  if (!fs.existsSync(KB_DIR)) {
    console.error(`❌ ERRO: Diretório '${KB_DIR}' não existe.`);
    process.exit(1);
  }

  const articles = scanDirectory(KB_DIR);
  console.log(`📄 Encontrados ${articles.length} artigos locais na base.`);

  // Agrupar artigos por categoria
  const grouped = {};
  Object.keys(CATEGORY_NAMES).forEach(cat => {
    grouped[cat] = [];
  });

  articles.forEach(art => {
    const cat = art.category;
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(art);
  });

  // Ordenar artigos de cada categoria por título
  Object.keys(grouped).forEach(cat => {
    grouped[cat].sort((a, b) => a.title.localeCompare(b.title));
  });

  // Construir o conteúdo Markdown
  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  let mdContent = `# 📚 Base de Conhecimento Yooga — FAQ Local Completo\n\n`;
  mdContent += `> Gerado automaticamente em ${dateStr}\n`;
  mdContent += `> Fonte: Artigos físicos sincronizados do Notion Wiki Yooga\n\n`;
  mdContent += `**Total de artigos físicos locais:** ${articles.length}\n\n`;
  mdContent += `---\n\n`;

  // Gerar o índice principal
  Object.keys(CATEGORY_NAMES).forEach(cat => {
    const catName = CATEGORY_NAMES[cat];
    const catArticles = grouped[cat] || [];
    
    if (catArticles.length > 0) {
      mdContent += `## ${catName} (${catArticles.length} artigos)\n\n`;
      
      catArticles.forEach(art => {
        // Link relativo no repositório local
        mdContent += `- [${art.title}](${art.relativePath})\n`;
      });
      
      mdContent += `\n`;
    }
  });

  fs.writeFileSync(INDEX_FILE, mdContent, 'utf-8');

  console.log(`\n=======================================================`);
  console.log(`🏆 ÍNDICE CONCLUÍDO COM SUCESSO!`);
  console.log(`Salvo em: ${INDEX_FILE}`);
  console.log(`Total de categorias organizadas: ${Object.keys(grouped).filter(k => grouped[k].length > 0).length}`);
  console.log(`=======================================================`);
}

run();
