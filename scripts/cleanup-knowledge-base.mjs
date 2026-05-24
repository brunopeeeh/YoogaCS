/**
 * cleanup-knowledge-base.mjs
 * 
 * Pós-processamento dos artigos .md do FAQ Yooga.
 * Remove sidebar de navegação do HubSpot, breadcrumbs,
 * linhas vazias excessivas, e corrige formatação Markdown.
 * 
 * Uso: node scripts/cleanup-knowledge-base.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const KB_DIR = join(__dirname, '..', 'src', 'data', 'knowledge-base');

let stats = { processed: 0, cleaned: 0, totalBefore: 0, totalAfter: 0 };

function cleanArticle(content, filePath) {
  // Separar frontmatter do body
  const frontmatterMatch = content.match(/^(---\n[\s\S]*?\n---)\n*([\s\S]*)$/);
  if (!frontmatterMatch) return content;

  const frontmatter = frontmatterMatch[1];
  let body = frontmatterMatch[2];

  // 1. Corrigir links invertidos: [URL](texto) → [texto](URL)
  body = body.replace(/\[([^\]]*https?:\/\/[^\]]+)\]\(([^)]+)\)/g, (match, url, text) => {
    const cleanText = text.trim();
    const cleanUrl = url.trim();
    if (cleanText && cleanUrl) {
      return `[${cleanText}](${cleanUrl})`;
    }
    return match;
  });

  // 2. Remover breadcrumbs do topo (links de navegação do HubSpot)
  // Padrão: linhas que começam com - seguido de link para categoria
  const lines = body.split('\n');
  let cleanLines = [];
  let inSidebar = false;
  let mainContentStarted = false;
  let lastContentLine = -1;
  let consecutiveEmptyLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detectar início do conteúdo principal (primeiro # ou ## depois do frontmatter)
    if (!mainContentStarted && /^#{1,2}\s/.test(trimmed)) {
      mainContentStarted = true;
    }

    // Detectar blocos de sidebar/navegação do HubSpot
    // Padrão: sequência de links para categorias do FAQ com muitas linhas vazias
    if (mainContentStarted) {
      // Detectar o início da sidebar: linhas com links para categorias do FAQ
      const isSidebarLink = /^\[.*\]\(https:\/\/ajuda\.yooga\.com\.br\/(perguntas-frequentes|pdv-mesa|delivery|yooga-pay|integra|painel-de-relat|fiscal|balan|planos)/.test(trimmed);
      const isCategoryAnchor = /^\[.*\]\(https:\/\/ajuda\.yooga\.com\.br\/.*\?hsLang=pt-br(#.*)?/.test(trimmed);
      const isBreadcrumb = /^\[.*\]\(https:\/\/ajuda\.yooga\.com\.br\/?\?hsLang=pt-br\)$/.test(trimmed);
      const isNavItem = trimmed === '-' || trimmed === ')';
      const isEmpty = trimmed === '';

      // Se encontramos um bloco de 5+ linhas vazias seguidas por links de categorias, é sidebar
      if (!inSidebar && consecutiveEmptyLines >= 4 && (isSidebarLink || isCategoryAnchor)) {
        inSidebar = true;
        // Remover as linhas vazias que precederam o sidebar
        while (cleanLines.length > 0 && cleanLines[cleanLines.length - 1].trim() === '') {
          cleanLines.pop();
        }
      }

      if (inSidebar) {
        // O sidebar continua até o fim do arquivo (após a Fonte)
        // Parar apenas se encontrar o marcador de Fonte
        if (trimmed.startsWith('*Fonte:') || trimmed.startsWith('---')) {
          inSidebar = false;
          cleanLines.push(line);
        }
        // Pular tudo dentro do sidebar
        continue;
      }

      if (isEmpty) {
        consecutiveEmptyLines++;
      } else {
        consecutiveEmptyLines = 0;
      }
    }

    cleanLines.push(line);
  }

  body = cleanLines.join('\n');

  // 3. Remover breadcrumbs do topo do artigo (antes do título principal)
  // Padrão: "-\n  [Central de Ajuda Yooga](...)" no início
  body = body.replace(/^(\s*-\s*\n\s*\[.*?\]\(https:\/\/ajuda\.yooga\.com\.br[^)]*\)\s*\n)+/gm, '');

  // 4. Remover linhas que são apenas "-" soltos (resíduos de listas HTML)
  body = body.replace(/^\s*-\s*$/gm, '');

  // 5. Remover linhas que são apenas ")" soltos (resíduos de links)
  body = body.replace(/^\s*\)\s*$/gm, '');

  // 6. Remover linhas que são apenas "**" soltos (negrito vazio)
  body = body.replace(/^\s*\*\*\s*$/gm, '');

  // 7. Remover tags [Imagem] consecutivas redundantes
  body = body.replace(/(\[Imagem\]\s*\n?\s*){3,}/g, '[Imagem]\n');

  // 8. Remover título duplicado: se # Título aparece 2x seguidos, manter só 1
  body = body.replace(/(# .+\n)\s*\n\s*\1/g, '$1');

  // 9. Corrigir headers com ** residual: ### ** → ###
  body = body.replace(/^(#{1,6})\s*\*\*\s*/gm, '$1 ');
  body = body.replace(/\*\*\s*$/gm, '');

  // 10. Remover blocos de links do sidebar que ficaram no corpo
  // Padrão: sequência de linhas com [Categoria](URL) repetidas
  const sidebarPattern = /(\s*\[(?:Perguntas Frequentes|PDV.*?|Delivery|Yooga Pay|Integrações|Painel de Relatórios|Fiscal|Balanças e Impressoras|Planos e Preços|Central de Ajuda Yooga)\]\(https:\/\/ajuda\.yooga\.com\.br[^)]*\)\s*\n?)+/gi;
  body = body.replace(sidebarPattern, '\n');

  // 11. Remover links de subcategorias do sidebar
  // Padrão: [Subcategoria](URL com #ancora)
  const subCategoryPattern = /\s*\[(?:Configurações gerais|Mesas|Balcão|Cardápio|Horário de funcionamento|Delivery e Retirada|Forma de pagamento|Motoboys|Configurações gerais do delivery|Marketplaces|Pagamentos|Operação|Logística|Performance|Relatórios gerais|Pagamento online|Relatórios do delivery|Cadastros|Financeiro|Estoque|Dúvidas fiscais gerais|Relatórios fiscais|NFC-e|NF-e|Impressão|Balança|Usuários|Histórico de vendas|Cardápio QR code|main-content)\]\(https:\/\/ajuda\.yooga\.com\.br[^)]*\)\s*\n?/gi;
  body = body.replace(subCategoryPattern, '\n');

  // 12. Limpar 3+ linhas vazias consecutivas → máximo 2
  body = body.replace(/\n{4,}/g, '\n\n');

  // 13. Remover espaços em branco no final das linhas
  body = body.replace(/[ \t]+$/gm, '');

  // 14. Limpar início do body (remover linhas vazias antes do título)
  body = body.replace(/^\n+/, '\n');

  // 15. Garantir que termina com uma única quebra de linha
  body = body.replace(/\n+$/, '\n');

  return frontmatter + '\n\n' + body;
}

function processDirectory(dirPath) {
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.endsWith('.md') && entry !== '_index.md') {
      stats.processed++;
      const original = readFileSync(fullPath, 'utf-8');
      stats.totalBefore += original.length;

      const cleaned = cleanArticle(original, fullPath);
      stats.totalAfter += cleaned.length;

      if (cleaned !== original) {
        writeFileSync(fullPath, cleaned, 'utf-8');
        stats.cleaned++;

        const reduction = Math.round((1 - cleaned.length / original.length) * 100);
        if (reduction > 10) {
          console.log(`  ✅ ${entry} — ${reduction}% menor (${original.length} → ${cleaned.length} chars)`);
        }
      }
    }
  }
}

console.log('🧹 Limpando artigos da Base de Conhecimento...\n');
processDirectory(KB_DIR);

const totalReduction = Math.round((1 - stats.totalAfter / stats.totalBefore) * 100);
console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Limpeza concluída!`);
console.log(`📄 Artigos processados: ${stats.processed}`);
console.log(`🧹 Artigos modificados: ${stats.cleaned}`);
console.log(`📉 Redução total: ${totalReduction}% (${Math.round(stats.totalBefore / 1024)} KB → ${Math.round(stats.totalAfter / 1024)} KB)`);
console.log(`${'='.repeat(60)}`);
