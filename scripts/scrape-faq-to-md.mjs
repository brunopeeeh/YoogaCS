/**
 * scrape-faq-to-md.js
 * 
 * Faz scraping completo do FAQ da Yooga (ajuda.yooga.com.br)
 * e salva cada artigo como um arquivo .md organizado por categoria.
 * 
 * Uso: node scripts/scrape-faq-to-md.js
 * 
 * Resultado: src/data/knowledge-base/{categoria}/{artigo}.md
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_URL = 'https://ajuda.yooga.com.br';
const OUTPUT_DIR = join(__dirname, '..', 'src', 'data', 'knowledge-base');

// Categorias do FAQ extraídas da homepage
const CATEGORIES = [
  { slug: 'perguntas-frequentes', name: 'Perguntas Frequentes' },
  { slug: 'pdv-mesa-e-balc%C3%A3o', name: 'PDV Mesa e Balcão' },
  { slug: 'delivery', name: 'Delivery' },
  { slug: 'yooga-pay', name: 'Yooga Pay' },
  { slug: 'integra%C3%A7%C3%B5es', name: 'Integrações' },
  { slug: 'painel-de-relat%C3%B3rios', name: 'Painel de Relatórios' },
  { slug: 'fiscal', name: 'Fiscal' },
  { slug: 'balan%C3%A7as-e-impressoras', name: 'Balanças e Impressoras' },
  { slug: 'planos-e-pre%C3%A7os', name: 'Planos e Preços' },
];

// Delay para não sobrecarregar o servidor
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Converte string para slug seguro para nomes de arquivo
function toFileSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')    // remove caracteres especiais
    .replace(/\s+/g, '-')            // espaços → hífens
    .replace(/-+/g, '-')             // hífens duplicados
    .replace(/^-+|-+$/g, '')         // hífens no início/fim
    .substring(0, 80);               // limita tamanho
}

// Remove tags HTML e limpa o texto
function stripHtml(html) {
  if (!html) return '';
  
  // Converter <br>, <p>, <div>, <li> em quebras de linha
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<h1[^>]*>/gi, '# ')
    .replace(/<h2[^>]*>/gi, '## ')
    .replace(/<h3[^>]*>/gi, '### ')
    .replace(/<h4[^>]*>/gi, '#### ')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em[^>]*>/gi, '_')
    .replace(/<\/em>/gi, '_')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>/gi, '[$1](')
    .replace(/<\/a>/gi, ')')
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, '[Imagem: $1]')
    .replace(/<img[^>]*>/gi, '[Imagem]')
    .replace(/<table[^>]*>/gi, '\n')
    .replace(/<\/table>/gi, '\n')
    .replace(/<tr[^>]*>/gi, '| ')
    .replace(/<\/tr>/gi, ' |\n')
    .replace(/<t[dh][^>]*>/gi, '')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]+>/g, '')         // Remove todas as tags restantes
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')      // Máximo 2 quebras de linha
    .replace(/[ \t]+$/gm, '')         // Remove espaços no final das linhas
    .trim();

  return text;
}

// Busca HTML de uma URL com retry
async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) YoogaCSCoach-KnowledgeBase/1.0',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        }
      });
      
      if (!res.ok) {
        console.warn(`  ⚠️  Status ${res.status} para ${url}`);
        if (i < retries - 1) {
          await delay(2000);
          continue;
        }
        return null;
      }
      
      return await res.text();
    } catch (error) {
      console.warn(`  ⚠️  Erro ao acessar ${url}: ${error.message}`);
      if (i < retries - 1) {
        await delay(2000);
      }
    }
  }
  return null;
}

// Extrai links de artigos de uma página de categoria
function extractArticleLinks(html, categoryUrl) {
  const links = [];
  
  // Padrão 1: Links dentro de listas de artigos do HubSpot KB
  // <a href="/...">Título do artigo</a>
  const linkRegex = /<a[^>]*href="(\/[^"]*)"[^>]*class="[^"]*(?:article|kb)[^"]*"[^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(BASE_URL + match[1]);
  }
  
  // Padrão 2: Links genéricos dentro da área de conteúdo principal
  // Busca por links que parecem ser artigos (contêm texto descritivo)
  const genericLinkRegex = /<a[^>]*href="(https:\/\/ajuda\.yooga\.com\.br\/[^"]*)"[^>]*>[^<]*<\/a>/gi;
  while ((match = genericLinkRegex.exec(html)) !== null) {
    const url = match[1];
    // Excluir links de categorias, homepage e assets
    if (!url.includes('hubfs') && 
        !url.includes('?hsLang') &&
        !url.endsWith('.png') &&
        !url.endsWith('.svg') &&
        !url.endsWith('.jpg') &&
        url !== BASE_URL &&
        url !== BASE_URL + '/' &&
        !links.includes(url)) {
      links.push(url);
    }
  }

  // Padrão 3: Links em listas de artigos do HubSpot (formato mais genérico)
  const hskbRegex = /<a[^>]*href="(https:\/\/ajuda\.yooga\.com\.br\/(?:perguntas-frequentes|pdv|delivery|yooga|integra|painel|fiscal|balan|planos)[^"]*\/[^"]+)"[^>]*>/gi;
  while ((match = hskbRegex.exec(html)) !== null) {
    const url = match[1].split('?')[0]; // Remove query params
    if (!links.includes(url)) {
      links.push(url);
    }
  }

  // Padrão 4: formato mais comum do HubSpot KB - links com classe hs-kb
  const hskb2Regex = /<a[^>]*href="([^"]+)"[^>]*>\s*<span[^>]*class="[^"]*hs-kb[^"]*"[^>]*>/gi;
  while ((match = hskb2Regex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('/')) url = BASE_URL + url;
    url = url.split('?')[0];
    if (!links.includes(url) && url.includes('ajuda.yooga.com.br')) {
      links.push(url);
    }
  }

  // Padrão 5: Qualquer link dentro de hs-kb-listing
  const listingRegex = /href="([^"]*)"[^>]*>([^<]{5,})<\/a>/gi;
  while ((match = listingRegex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('/')) url = BASE_URL + url;
    url = url.split('?')[0];
    // Filtrar apenas URLs que são do domínio e parecem ser artigos
    if (url.includes('ajuda.yooga.com.br') && 
        !url.endsWith('.png') && !url.endsWith('.svg') && !url.endsWith('.js') &&
        !url.includes('hubfs') &&
        url !== BASE_URL && url !== BASE_URL + '/' &&
        url.split('/').length > 3 && // Deve ter profundidade > root
        !links.includes(url)) {
      links.push(url);
    }
  }
  
  // Deduplicar
  return [...new Set(links)];
}

// Extrai o conteúdo principal de um artigo
function extractArticleContent(html) {
  let title = '';
  let body = '';
  
  // Extrair título do artigo
  // Padrão HubSpot KB: <h1> dentro do artigo
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    title = h1Match[1].trim();
  }
  
  // Fallback: título da página
  if (!title) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/\s*[-|]\s*Central de Ajuda Yooga/i, '').trim();
    }
  }
  
  // Extrair corpo do artigo
  // Padrão 1: div com classe hs-kb-article-body ou kb-article-body
  const bodyMatch = html.match(/<div[^>]*class="[^"]*(?:hs-kb-article-body|kb-article-body|article-body|post-body)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<div[^>]*class="[^"]*(?:hs-kb|footer))/i);
  if (bodyMatch) {
    body = bodyMatch[1];
  }
  
  // Padrão 2: Conteúdo dentro de hs_cos_wrapper_post_body
  if (!body) {
    const wrapperMatch = html.match(/id="hs_cos_wrapper_post_body"[^>]*>([\s\S]*?)(?:<\/span>\s*<\/div>|<div[^>]*class="[^"]*hs-kb)/i);
    if (wrapperMatch) {
      body = wrapperMatch[1];
    }
  }
  
  // Padrão 3: Buscar pelo conteúdo entre main e footer
  if (!body) {
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      body = mainMatch[1];
    }
  }
  
  // Padrão 4: Buscar por rich_text mais genérico
  if (!body) {
    const richMatch = html.match(/class="[^"]*rich_text[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    if (richMatch) {
      body = richMatch[1];
    }
  }

  const cleanBody = stripHtml(body);
  
  return { title, body: cleanBody };
}

// Cria o arquivo .md para um artigo
function saveArticleMd(categoryName, title, body, url) {
  const categorySlug = toFileSlug(categoryName);
  const articleSlug = toFileSlug(title);
  
  const categoryDir = join(OUTPUT_DIR, categorySlug);
  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true });
  }
  
  const filePath = join(categoryDir, `${articleSlug}.md`);
  
  const markdown = `---
title: "${title.replace(/"/g, '\\"')}"
category: "${categoryName}"
source: "${url}"
scraped_at: "${new Date().toISOString()}"
---

# ${title}

${body}

---
*Fonte: [Central de Ajuda Yooga](${url})*
`;
  
  writeFileSync(filePath, markdown, 'utf-8');
  return filePath;
}

// Gera um arquivo de índice com todos os artigos
function saveIndex(allArticles) {
  const indexPath = join(OUTPUT_DIR, '_index.md');
  
  let content = `# 📚 Base de Conhecimento Yooga — FAQ Completo

> Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
> Fonte: https://ajuda.yooga.com.br/

**Total de artigos:** ${allArticles.length}

---

`;

  // Agrupar por categoria
  const grouped = {};
  for (const art of allArticles) {
    if (!grouped[art.category]) grouped[art.category] = [];
    grouped[art.category].push(art);
  }
  
  for (const [cat, articles] of Object.entries(grouped)) {
    content += `## ${cat} (${articles.length} artigos)\n\n`;
    for (const art of articles) {
      content += `- [${art.title}](${art.url})\n`;
    }
    content += '\n';
  }
  
  writeFileSync(indexPath, content, 'utf-8');
  console.log(`\n📋 Índice salvo em: ${indexPath}`);
}

// ==========================
// EXECUÇÃO PRINCIPAL
// ==========================

async function main() {
  console.log('🚀 Iniciando scraping do FAQ Yooga...');
  console.log(`📁 Destino: ${OUTPUT_DIR}\n`);
  
  // Criar diretório raiz
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const allArticles = [];
  let totalSaved = 0;

  for (const category of CATEGORIES) {
    const categoryUrl = `${BASE_URL}/${category.slug}?hsLang=pt-br`;
    console.log(`\n📂 Categoria: ${category.name}`);
    console.log(`   URL: ${categoryUrl}`);
    
    const categoryHtml = await fetchPage(categoryUrl);
    if (!categoryHtml) {
      console.log(`   ❌ Falha ao acessar categoria`);
      continue;
    }
    
    const articleLinks = extractArticleLinks(categoryHtml, categoryUrl);
    console.log(`   🔗 ${articleLinks.length} links de artigos encontrados`);
    
    if (articleLinks.length === 0) {
      // Se não encontrou artigos, tenta a própria página de categoria como artigo
      console.log(`   ⚠️  Tentando extrair conteúdo da própria página de categoria...`);
      const { title, body } = extractArticleContent(categoryHtml);
      if (body && body.length > 50) {
        const filePath = saveArticleMd(category.name, title || category.name, body, categoryUrl);
        totalSaved++;
        allArticles.push({ category: category.name, title: title || category.name, url: categoryUrl });
        console.log(`   ✅ Salvo: ${title || category.name}`);
      }
      await delay(500);
      continue;
    }
    
    for (const articleUrl of articleLinks) {
      await delay(800); // Rate limiting: 800ms entre requests
      
      console.log(`   📄 Acessando: ${articleUrl.substring(articleUrl.lastIndexOf('/') + 1).substring(0, 60)}...`);
      
      const articleHtml = await fetchPage(articleUrl);
      if (!articleHtml) {
        console.log(`      ❌ Falha ao acessar artigo`);
        continue;
      }
      
      const { title, body } = extractArticleContent(articleHtml);
      
      if (!title && !body) {
        console.log(`      ⚠️  Sem conteúdo extraível`);
        continue;
      }
      
      if (body.length < 30) {
        console.log(`      ⚠️  Conteúdo muito curto (${body.length} chars), pulando...`);
        continue;
      }
      
      const filePath = saveArticleMd(category.name, title || 'Sem título', body, articleUrl);
      totalSaved++;
      allArticles.push({ category: category.name, title, url: articleUrl });
      console.log(`      ✅ Salvo: ${title} (${body.length} chars)`);
    }
    
    await delay(1000); // Pausa entre categorias
  }

  // Gerar índice
  if (allArticles.length > 0) {
    saveIndex(allArticles);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Scraping concluído!`);
  console.log(`📊 Total de artigos salvos: ${totalSaved}`);
  console.log(`📁 Diretório: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
});
