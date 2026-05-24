import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_DIR = path.resolve(__dirname, '../src/data/knowledge-base');
const OUTPUT_DIR = path.resolve(__dirname, '../src/data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'faq-embeddings.json');

// Função de vetorização determinística local (idêntica ao Core.js do frontend)
function generateDeterministicVector(text) {
  const vector = [];
  const dim = 768;
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (text.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  
  for (let d = 0; d < dim; d++) {
    const value = Math.sin(hash + d) * 0.1;
    vector.push(value);
  }
  
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

// Extrai frontmatter via Regex robusto
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

// Fragmentação inteligente de conteúdo (chunks de ~600 caracteres)
function createChunks(text, chunkSize = 600, overlap = 100) {
  const paragraphs = text.split('\n');
  const chunks = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    if ((currentChunk + "\n" + cleanPara).length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Overlap simples: manter a última parte se houver espaço
      currentChunk = cleanPara;
    } else {
      currentChunk = currentChunk ? (currentChunk + "\n" + cleanPara) : cleanPara;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Fallback se o texto for curto ou sem parágrafos
  if (chunks.length === 0 && text.trim()) {
    chunks.push(text.trim());
  }

  return chunks;
}

// Varre pastas buscando arquivos Markdown individuais
function scanDirectory(dir, category = '') {
  let results = [];
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(scanDirectory(fullPath, entry));
    } else if (entry.endsWith('.md') && entry !== '_index.md') {
      results.push({
        fullPath,
        entry,
        category: category || 'perguntas-frequentes'
      });
    }
  }

  return results;
}

async function run() {
  console.log("=== INICIANDO VETORIZAÇÃO LOCAL-FIRST DA BASE DE CONHECIMENTO ===");
  console.log(`Lendo artigos em: ${KB_DIR}...`);

  if (!fs.existsSync(KB_DIR)) {
    console.error(`❌ ERRO: Diretório '${KB_DIR}' não existe.`);
    process.exit(1);
  }

  const files = scanDirectory(KB_DIR);
  console.log(`📄 Encontrados ${files.length} arquivos locais para vetorização.`);

  const processedData = [];
  let totalChunks = 0;

  for (const file of files) {
    const fileContent = fs.readFileSync(file.fullPath, 'utf-8');
    const { data, content } = parseFrontmatter(fileContent);

    // Determinar o título
    let title = data.title;
    if (!title) {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      title = titleMatch ? titleMatch[1].trim() : path.basename(file.entry, '.md');
    }

    const faqUrl = data.source || `https://ajuda.yooga.com.br/${path.basename(file.entry, '.md')}`;

    // Fragmenta o texto limpo do artigo (sem o frontmatter)
    const chunks = createChunks(content);
    totalChunks += chunks.length;

    const baseId = path.basename(file.entry, '.md');

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      
      // Monta o texto de input para a query semântica no mesmo formato do ingest-faq.js original
      const textToEmbed = `[Artigo: ${title}]\n${chunkText}`;
      
      // Gera o embedding usando a função matemática determinística idêntica ao Core.js
      const embedding = generateDeterministicVector(textToEmbed.trim().toLowerCase());

      processedData.push({
        id: `${baseId}-part-${i}`,
        title: title,
        faqUrl: faqUrl,
        content: chunkText,
        embedding: embedding
      });
    }
  }

  // Garantir que a pasta de destino existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Salvar no faq-embeddings.json
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedData, null, 2), 'utf-8');

  console.log(`\n=======================================================`);
  console.log(`🏆 PROCESSO CONCLUÍDO COM SUCESSO!`);
  console.log(`📄 Total de artigos processados: ${files.length}`);
  console.log(`🌀 Total de fragmentos (chunks) gerados: ${totalChunks}`);
  console.log(`💾 Base física atualizada em: ${OUTPUT_FILE}`);
  console.log(`=======================================================`);
}

run();
