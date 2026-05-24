import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para ler o arquivo .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️ Arquivo .env não encontrado na raiz do projeto.');
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const NOTION_API_KEY = env.NOTION_API_KEY || process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
  console.error('\n❌ ERRO: NOTION_API_KEY não foi encontrada no arquivo .env.');
  console.log('\n💡 Como obter a sua NOTION_API_KEY:');
  console.log('1. Acesse: https://www.notion.so/my-integrations');
  console.log('2. Clique em "+ New integration"');
  console.log('3. Dê um nome (ex: "Yooga CS Sync") e confirme (as permissões padrão de leitura são suficientes)');
  console.log('4. Copie o "Internal Integration Token" gerado');
  console.log('5. Abra a Wiki no seu navegador (https://www.notion.so/24300ee50e9080c2b0e2cf8cecf330de)');
  console.log('6. Clique em "..." (canto superior direito) > "Connections" > "Add connections"');
  console.log('7. Pesquise pela sua integração "Yooga CS Sync" e confirme para dar acesso à base de dados');
  console.log('8. Adicione no seu arquivo .env local:');
  console.log('   NOTION_API_KEY="secret_your_token_here"\n');
  process.exit(1);
}

const WIKI_PAGES_PATH = path.join(__dirname, 'wiki-pages.json');

if (!fs.existsSync(WIKI_PAGES_PATH)) {
  console.error(`❌ ERRO: Arquivo com páginas da wiki '${WIKI_PAGES_PATH}' não encontrado.`);
  console.log('Por favor, certifique-se de que o arquivo wiki-pages.json está presente na pasta scripts/.');
  process.exit(1);
}

const wikiPages = JSON.parse(fs.readFileSync(WIKI_PAGES_PATH, 'utf-8'));
console.log(`📚 Carregadas ${wikiPages.length} páginas para sincronização a partir de wiki-pages.json...\n`);

// Mapeamento de tags do Notion para pastas locais do simulador
function mapCategory(tags) {
  if (!tags || tags.length === 0) return 'perguntas-frequentes';
  
  const lowerTags = tags.map(t => t.toLowerCase());
  
  // Balanças e impressoras
  if (lowerTags.some(t => [
    'periféricos', 'balança', 'balança etiquetadora', 'impressão', 
    'problema de impressão', 'impressão em rede', 'tanca', 
    'epson em rede', 'gertec via rede', 'impressão no emissor',
    'bematech', 'elgin', 'pos-58', 'pos'
  ].includes(t))) {
    return 'balancas-e-impressoras';
  }
  
  // Fiscal
  if (lowerTags.some(t => [
    'fiscal', 'nfc-e/nf-e', 'emissão de notas', 'certificado digital', 
    'documentos fiscais', 'nfc-e', 'nf-e', 'nfs-e', 'imposto', 'sefaz'
  ].includes(t))) {
    return 'fiscal';
  }
  
  // Delivery
  if (lowerTags.some(t => [
    'delivery', 'ifood', 'motoboys', 'motoboy', 'entrega fácil', 
    'retirada no local', 'cardápio delivery', 'produtos no delivery', 
    'estoque no delivery', 'abrir delivery'
  ].includes(t))) {
    return 'delivery';
  }
  
  // Integrações
  if (lowerTags.some(t => [
    'integração', 'pix online', 'paytime', 'picpay', 'stone', 'vero', 'integrações'
  ].includes(t))) {
    return 'integracoes';
  }
  
  // Painel de Relatórios
  if (lowerTags.some(t => [
    'financeiro', 'dre', 'conciliação', 'lançamentos', 'fluxo de caixa', 
    'categorias financeiras', 'fornecedores', 'contas bancárias', 
    'receita', 'despesas', 'receitas', 'painel relatórios', 'relatórios'
  ].includes(t))) {
    return 'painel-de-relatorios';
  }
  
  // PDV Mesa e Balcão
  if (lowerTags.some(t => [
    'pdv', 'mesas', 'caixa', 'caixas', 'cardápio', 'cadastro de produtos', 
    'cadastro de insumos', 'ficha técnica', 'kds', 'garçom digital', 
    'combos', 'complementos', 'caixa registradora', 'gaveta'
  ].includes(t))) {
    return 'pdv-mesa-e-balcao';
  }
  
  // Planos e Preços
  if (lowerTags.some(t => [
    'meu plano', 'troca de plano', 'cancelar contrato', 'cancelar emissor', 
    'cancelar serviço', 'alteração de cnpj', 'alteração de dono', 
    'alterar dono', 'contrato', 'mensal para anual', 'anual para mensal'
  ].includes(t))) {
    return 'planos-e-precos';
  }
  
  // Yooga Pay
  if (lowerTags.some(t => [
    'yooga pay', 'pagamento online', 'maquininha de cartão', 'galax', 
    'cellcoin', 'cel cash'
  ].includes(t))) {
    return 'yooga-pay';
  }
  
  return 'perguntas-frequentes';
}

// Converte texto rico do Notion para Markdown
function parseRichText(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return '';
  return richTextArray.map(item => {
    let text = item.plain_text || '';
    const ann = item.annotations;
    if (!ann) return text;
    
    if (ann.bold) text = `**${text}**`;
    if (ann.italic) text = `_${text}_`;
    if (ann.strikethrough) text = `~~${text}~~`;
    if (ann.code) text = `\`${text}\``;
    
    if (item.href) {
      text = `[${text}](${item.href})`;
    }
    return text;
  }).join('');
}

// Busca filhos de blocos de forma recursiva
async function getBlockChildren(blockId) {
  let blocks = [];
  let cursor = undefined;
  let hasMore = true;

  while (hasMore) {
    let url = `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`;
    if (cursor) {
      url += `&start_cursor=${cursor}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao buscar blocos filhos de ${blockId}: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    blocks = blocks.concat(data.results || []);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  return blocks;
}

// Converte blocos do Notion para Markdown
async function blocksToMarkdown(blocks, depth = 0) {
  let markdown = '';
  const indent = '  '.repeat(depth);

  for (const block of blocks) {
    const type = block.type;
    let text = '';
    
    switch (type) {
      case 'paragraph':
        text = parseRichText(block.paragraph?.rich_text);
        markdown += `${indent}${text}\n\n`;
        break;
        
      case 'heading_1':
        text = parseRichText(block.heading_1?.rich_text);
        markdown += `${indent}# ${text}\n\n`;
        break;
        
      case 'heading_2':
        text = parseRichText(block.heading_2?.rich_text);
        markdown += `${indent}## ${text}\n\n`;
        break;
        
      case 'heading_3':
        text = parseRichText(block.heading_3?.rich_text);
        markdown += `${indent}### ${text}\n\n`;
        break;
        
      case 'bulleted_list_item':
        text = parseRichText(block.bulleted_list_item?.rich_text);
        markdown += `${indent}- ${text}\n`;
        if (block.has_children) {
          const children = await getBlockChildren(block.id);
          markdown += await blocksToMarkdown(children, depth + 1);
        }
        break;
        
      case 'numbered_list_item':
        text = parseRichText(block.numbered_list_item?.rich_text);
        markdown += `${indent}1. ${text}\n`;
        if (block.has_children) {
          const children = await getBlockChildren(block.id);
          markdown += await blocksToMarkdown(children, depth + 1);
        }
        break;
        
      case 'code':
        text = parseRichText(block.code?.rich_text);
        const language = block.code?.language || '';
        markdown += `${indent}\`\`\`${language}\n${text}\n\`\`\`\n\n`;
        break;
        
      case 'quote':
        text = parseRichText(block.quote?.rich_text);
        markdown += `${indent}> ${text}\n\n`;
        break;
        
      case 'divider':
        markdown += `${indent}---\n\n`;
        break;
        
      case 'image':
        const imgType = block.image?.type;
        const imgUrl = imgType === 'external' ? block.image?.external?.url : block.image?.file?.url;
        const caption = parseRichText(block.image?.caption) || 'Imagem';
        if (imgUrl) {
          markdown += `${indent}![${caption}](${imgUrl})\n\n`;
        } else {
          markdown += `${indent}[Imagem]\n\n`;
        }
        break;
        
      case 'toggle':
        text = parseRichText(block.toggle?.rich_text);
        markdown += `${indent}👉 **${text}**\n`;
        if (block.has_children) {
          const children = await getBlockChildren(block.id);
          markdown += await blocksToMarkdown(children, depth + 1);
        }
        markdown += '\n';
        break;

      case 'to_do':
        text = parseRichText(block.to_do?.rich_text);
        const checked = block.to_do?.checked ? 'x' : ' ';
        markdown += `${indent}- [${checked}] ${text}\n`;
        break;

      case 'callout':
        text = parseRichText(block.callout?.rich_text);
        markdown += `${indent}> [!NOTE]\n${indent}> ${text}\n\n`;
        break;

      default:
        // Blocos não suportados ou vazios
        if (block.has_children) {
          const children = await getBlockChildren(block.id);
          markdown += await blocksToMarkdown(children, depth);
        }
        break;
    }
  }
  
  return markdown;
}

// Converte string para slug amigável para nome de arquivo
function toFileSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')    // remove especiais
    .replace(/\s+/g, '-')            // espaços → hífens
    .replace(/-+/g, '-')             // hífens duplicados
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// Função de execução principal
async function run() {
  const kbBaseDir = path.resolve(__dirname, '..', 'src', 'data', 'knowledge-base');
  let syncCount = 0;
  let errorCount = 0;

  console.log(`📂 Diretório da Base de Conhecimento: ${kbBaseDir}\n`);

  for (const page of wikiPages) {
    const categoryFolder = mapCategory(page.tags);
    const targetDir = path.join(kbBaseDir, categoryFolder);
    const filename = `${toFileSlug(page.title)}.md`;
    const targetFilePath = path.join(targetDir, filename);

    console.log(`⏳ Processando: "${page.title}" [Categoria: ${categoryFolder}]...`);

    try {
      // Garantir que a pasta da categoria existe
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Buscar os blocos da página
      const blocks = await getBlockChildren(page.id);
      
      // Converter blocos para Markdown
      const contentMarkdown = await blocksToMarkdown(blocks);

      // Formatar frontmatter
      const cleanCategoryName = categoryFolder
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const frontmatter = `---
title: "${page.title.replace(/"/g, '\\"')}"
category: "${cleanCategoryName}"
source: "${page.url}"
scraped_at: "${new Date().toISOString()}"
---

# ${page.title}

${contentMarkdown}
`;

      fs.writeFileSync(targetFilePath, frontmatter, 'utf-8');
      console.log(`✅ Sincronizado com sucesso -> ${categoryFolder}/${filename}`);
      syncCount++;

      // Pausa prudente para não atingir o rate limit do Notion (máx 3 requisições por segundo na API gratuita)
      await new Promise(resolve => setTimeout(resolve, 350));
    } catch (err) {
      console.error(`❌ Erro ao sincronizar página "${page.title}" (ID: ${page.id}):`, err.message);
      errorCount++;
    }
  }

  console.log(`\n=======================================================`);
  console.log(`🏁 Sincronização Concluída!`);
  console.log(`🎉 Artigos sincronizados com sucesso: ${syncCount}`);
  console.log(`⚠️ Falhas: ${errorCount}`);
  console.log(`=======================================================`);
}

run();
