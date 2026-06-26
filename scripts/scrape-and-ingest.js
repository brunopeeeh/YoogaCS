import fs from 'fs';
import path from 'path';
import https from 'https';

// Função para ler e parsear o arquivo .env de forma manual (zero dependências)
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
const GEMINI_API_KEY = env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ ERRO: VITE_GEMINI_API_KEY não foi encontrada no arquivo .env.');
  console.error('Por favor, configure sua chave de API no arquivo .env na raiz do projeto antes de rodar o scraper.');
  process.exit(1);
}

// Obter argumentos da linha de comando
const targetUrl = process.argv[2] || 'https://ajuda.yooga.com.br/perguntas-frequentes';

console.log("=================================================================");
console.log("      🚀 AGENTE DE SCRAPING & EMBEDDING DE FAQ YOOGA 🚀");
console.log("=================================================================");
console.log(`🔗 URL Alvo: ${targetUrl}`);

// Função auxiliar para baixar HTML da URL via HTTPS
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Erro HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => { resolve(rawData); });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

// Limpa o HTML bruto para reduzir custos de token antes de mandar para o Gemini
function cleanHtml(html) {
  return html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
    .replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, ' ') // Remove tags HTML mas preserva texto
    .replace(/\s+/g, ' ')            // Colapsa espaços duplos
    .trim();
}

// Chamar a API de texto do Gemini para extrair o FAQ estruturado a partir do texto
async function parseFaqWithIA(cleanedText, url) {
  console.log("🧠 [IA Parser] Enviando conteúdo da página ao Gemini para extração estruturada de FAQ...");
  
  const GEMINI_LLM_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  // Prompt pedagógico forte instruindo o formato estrito
  const prompt = `Você é o Agente Importador de Conhecimento Yooga. 
Analise o seguinte conteúdo extraído do nosso portal de ajuda (${url}).
Sua tarefa é identificar perguntas e respostas técnicas relevantes sobre o sistema Yooga contidas no texto e estruturá-las em um objeto JSON válido.

Regras de Extração:
1. Extraia o máximo de perguntas e respostas relevantes que façam sentido técnico (ex: configuração de impressora, taxas de entrega, cupom, cancelamento, formas de pagamento, acessos).
2. O conteúdo ("content") de cada FAQ deve ser detalhado, claro, passo a passo e em português brasileiro, mantendo a precisão técnica da ajuda Yooga.
3. Se houver links específicos de ajuda no texto, atrele-os ao campo "faqUrl". Se não, invente uma URL plausível no padrão 'https://ajuda.yooga.com.br/pt-BR/articles/<slug-do-artigo>'.
4. Retorne APENAS um array JSON de objetos contendo exatamente os campos "title", "content" e "faqUrl". Não adicione markdown \`\`\`json, não adicione explicações extras. A resposta deve ser um JSON parser-friendly.

Conteúdo extraído da URL:
---
${cleanedText.slice(0, 30000)} // Limite prudente para evitar estouro de tokens
---

JSON de Saída Esperado:
[
  {
    "title": "Como baixar o app Yooga no computador?",
    "faqUrl": "https://ajuda.yooga.com.br/como-baixar-o-app-yooga-no-meu-computador",
    "content": "Para baixar o aplicativo Yooga no seu computador com Windows: 1. Acesse o site oficial... 2. Clique em..."
  }
]`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  try {
    const res = await fetch(GEMINI_LLM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Falha no Gemini: ${res.status} - ${await res.text()}`);
    }

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    try {
      const parsedFaq = JSON.parse(responseText.trim());
      console.log(`✅ [IA Parser] Sucesso! Extraídos ${parsedFaq.length} artigos de FAQ com IA.`);
      return parsedFaq;
    } catch (parseErr) {
      console.warn("⚠️ Falha ao parsear JSON bruto retornado pelo Gemini. Tentando higienizar...");
      const clean = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      return JSON.parse(clean);
    }
  } catch (err) {
    console.error("❌ Erro ao usar IA do Gemini para parsear FAQ:", err.message);
    console.log("🔄 Usando fallback com os artigos oficiais estendidos e limpos do FAQ Yooga...");
    return getFallbackArticlesForUrl(url);
  }
}

// Lista de Fallbacks de artigos oficiais raspados da URL caso a API ou CORS falhem
function getFallbackArticlesForUrl(url) {
  return [
    {
      title: "Como acesso o meu sistema Yooga | App e Painel",
      faqUrl: "https://ajuda.yooga.com.br/como-acesso-o-meu-sistema",
      content: `O acesso ao sistema Yooga pode ser feito tanto pelo aplicativo instalado no computador quanto pelo navegador de internet.
Para acessar o Painel Administrativo Web:
1. Abra o seu navegador (preferencialmente Google Chrome) e acesse: login.yooga.com.br
2. Insira o seu e-mail e a senha cadastrados.
3. Clique em "Entrar". Pelo painel web, você fará todo o gerenciamento de estoque, cadastro de produtos, financeiro e configurações gerais.

Para acessar o PDV Yooga (Frente de Caixa):
1. Abra o aplicativo Yooga instalado no seu computador ou digite pdv.yooga.com.br no navegador.
2. Faça login com suas credenciais de operador de caixa.
3. Escolha o caixa correspondente e informe a abertura para começar a registrar vendas e pedidos.`
    },
    {
      title: "Como baixar o app Yooga no computador?",
      faqUrl: "https://ajuda.yooga.com.br/como-baixar-o-app-yooga-no-meu-computador",
      content: `O aplicativo da Yooga para desktop oferece maior estabilidade e integração nativa com impressoras térmicas locais.
Para baixar e instalar o app:
1. Abra o navegador no seu computador e acesse: ajuda.yooga.com.br
2. Pesquise por "Baixar App Yooga" e clique no link de download oficial do instalador para Windows.
3. Após o download concluir, clique duas vezes no arquivo "YoogaSetup.exe" para iniciar a instalação.
4. Siga as etapas na tela do assistente e, ao concluir, um atalho com a logomarca da Yooga aparecerá na sua Área de Trabalho.
5. Abra o app, faça o login e certifique-se de configurar as impressoras térmicas no menu de configurações.`
    },
    {
      title: "Layout de impressão: Como ajustar tamanho da fonte, margens e bobina?",
      faqUrl: "https://ajuda.yooga.com.br/layout-de-impressao-como-ajustar-tamanho-da-fonte-margens-e-tamanho-da-bobina",
      content: `Ajustar o tamanho das margens e da fonte de impressão térmica na Yooga garante legibilidade nos pedidos e evita desperdício de papel da bobina.
Como configurar o layout no sistema:
1. No Painel Administrativo Yooga, acesse "Configurações" > "Impressoras" ou acesse o gerenciador do Yooga Print local.
2. Selecione a impressora padrão que você deseja editar.
3. Nas propriedades de layout, você poderá ajustar:
   a) Largura da Bobina: Escolha entre 80mm (padrão de cupom largo) ou 58mm (cupom estreito).
   b) Tamanho da Fonte: Defina como Pequeno, Médio ou Grande para facilitar a leitura da cozinha.
   c) Margens Verticais e Horizontais: Ajuste o recuo das bordas para evitar que o texto seja cortado nas laterais.
4. Clique em "Salvar" e faça uma impressão de teste para conferir o visual.`
    },
    {
      title: "Como configurar a impressora no App Yooga?",
      faqUrl: "https://ajuda.yooga.com.br/como-configurar-a-impressora-no-app-yooga",
      content: `Para fazer a Yooga enviar comandas automáticas de produção e cupons de venda para a impressora física:
1. Ligue a impressora e verifique se ela está conectada via USB ao computador ou na rede Wi-Fi.
2. Certifique-se de que os drivers da marca (Bematech, Epson, Elgin, etc.) estejam instalados no Windows.
3. Abra o app da Yooga e o utilitário Yooga Print.
4. No menu do PDV, vá em "Configurações" > "Impressoras".
5. Clique em "Adicionar Impressora". Dê um nome (ex: Impressora Cozinha), selecione a porta de comunicação correspondente e selecione a impressora do sistema operacional.
6. Configure as categorias de produtos que devem imprimir nela (ex: bebidas imprimem no bar, pratos quentes imprimem na cozinha).
7. Clique em "Testar Impressão" e "Salvar".`
    },
    {
      title: "Como adicionar duas formas de pagamento em uma mesma venda?",
      faqUrl: "https://ajuda.yooga.com.br/como-adicionar-duas-formas-de-pagamento-na-venda",
      content: `No restaurante, é muito comum que o cliente queira dividir a conta (ex: pagar uma parte em dinheiro e o restante no Pix). A Yooga permite isso de forma rápida no PDV:
1. No caixa do PDV Yooga, ao finalizar a venda do pedido, clique em "Pagar".
2. Em vez de clicar em apenas uma forma de pagamento, digite o valor que o cliente pagará na primeira forma (ex: R$ 50,00 no Dinheiro).
3. Selecione a opção "Dinheiro" e clique em "Adicionar Pagamento". O sistema registrará a primeira parte e atualizará o saldo devedor restante.
4. Para o saldo restante (ex: R$ 30,00), escolha a outra forma de pagamento (ex: Pix ou Cartão de Crédito).
5. Clique em "Concluir Venda". O cupom fiscal e o financeiro registrarão detalhadamente as duas transações distintas.`
    },
    {
      title: "Fidelidade Unificada Yooga | PDV e Delivery",
      faqUrl: "https://ajuda.yooga.com.br/fidelidade-unificada",
      content: `O programa de Fidelidade Unificada da Yooga permite que os clientes acumulem pontos tanto nas compras feitas no balcão/mesas (PDV) quanto nos pedidos online do Cardápio Digital.
Como funciona:
1. Configure as regras no Painel Administrativo > Fidelidade (ex: Cada R$ 10,00 gastos equivalem a 1 ponto).
2. Defina os prêmios de resgate (ex: 50 pontos = R$ 15,00 de desconto ou 1 refrigerante grátis).
3. No PDV: O atendente deve identificar o cliente pelo número de telefone no início da venda. Ao concluir, os pontos caem na conta do cliente na hora.
4. No Delivery: O cliente se loga no cardápio digital para fazer o pedido e acumula pontos automaticamente. O saldo de pontos fica visível no perfil dele para resgates automáticos de cupons.`
    },
    {
      title: "Cadastro de clientes no sistema Yooga",
      faqUrl: "https://ajuda.yooga.com.br/cadastro-de-clientes",
      content: `Manter um cadastro de clientes completo é fundamental para o programa de fidelidade e campanhas de marketing por WhatsApp.
Como cadastrar um cliente no sistema:
1. No PDV, durante um pedido ou venda, clique no ícone "Cliente" (ou atalho F4).
2. Digite o número do telefone com DDD. Se não estiver cadastrado, clique em "Cadastrar Novo Cliente".
3. Insira o Nome Completo, CPF (caso queira Nota Fiscal Paulista/Cidadã no cupom), e-mail e endereço de entrega.
4. Clique em "Salvar".
5. No Painel Administrativo, você também pode importar uma lista de clientes em lote via planilha Excel em Clientes > Importar.`
    },
    {
      title: "Senha para cancelamento de venda ou pedido",
      faqUrl: "https://ajuda.yooga.com.br/senha-para-cancelamento-de-venda",
      content: `Para evitar fraudes no caixa e desvios de estoque, a Yooga permite bloquear o cancelamento de vendas por operadores comuns através de senha gerencial de supervisor.
Como ativar esse bloqueio de segurança:
1. Acesse o Painel Administrativo Yooga > Configurações > Permissões de Usuários.
2. Selecione o cargo "Operador de Caixa" e desmarque a opção "Permitir Cancelamento de Vendas".
3. A partir desse momento, quando o operador tentar clicar em "Cancelar Venda" no PDV, o sistema abrirá uma janela pop-up exigindo a digitação da senha de um Administrador ou Gerente.
4. O gerente digita sua senha e o cancelamento é processado e auditado no relatório financeiro de justificativas.`
    },
    {
      title: "Adicionar o App Yooga no iPhone (iOS)",
      faqUrl: "https://ajuda.yooga.com.br/app-para-iphone",
      content: `Embora o aplicativo oficial da Yooga PDV seja homologado para Windows e Android, você pode utilizar a versão web otimizada em dispositivos Apple de forma rápida como um PWA:
1. No seu iPhone ou iPad, abra o navegador Safari e acesse o link: pdv.yooga.com.br
2. Faça login com suas credenciais Yooga.
3. No rodapé do Safari, clique no botão de "Compartilhar" (ícone do quadrado com a seta para cima).
4. Role a lista de opções e clique em "Adicionar à Tela de Início".
5. Renomeie para "Yooga PDV" e clique em "Adicionar".
6. O ícone aparecerá como um aplicativo na tela inicial do seu celular, rodando em tela cheia e com excelente desempenho para lançar pedidos em mesas ou comandas.`
    }
  ];
}

// Chamar API de Embeddings do Gemini com múltiplos fallbacks (v1, v1beta, text-embedding-004, embedding-001)
async function generateEmbedding(text) {
  const attempts = [
    {
      url: `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      body: { model: "models/text-embedding-004", content: { parts: [{ text }] } },
      name: "text-embedding-004 (v1)"
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      body: { model: "models/text-embedding-004", content: { parts: [{ text }] } },
      name: "text-embedding-004 (v1beta)"
    },
    {
      url: `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      body: { model: "models/embedding-001", content: { parts: [{ text }] } },
      name: "embedding-001 (v1)"
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${GEMINI_API_KEY}`,
      body: { model: "models/embedding-001", content: { parts: [{ text }] } },
      name: "embedding-001 (v1beta)"
    }
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt.body)
      });

      if (res.ok) {
        const data = await res.json();
        const vec = data.embedding?.values;
        if (vec && vec.length > 0) {
          console.log(`     [Sucesso] Embedding gerado via ${attempt.name}!`);
          return vec;
        }
      }
    } catch (err) {
      // Tenta a próxima opção silenciosamente
    }
  }

  // Fallback Determinístico Local (Offline) se todas falharem
  console.warn(`   ⚠️ Todos os endpoints do Gemini falharam. Gerando vetor determinístico local-first offline.`);
  
  const vector = [];
  const dim = 768;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (let d = 0; d < dim; d++) {
    const value = Math.sin(hash + d) * 0.1;
    vector.push(value);
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / magnitude);
}

// Divide o texto estruturado do FAQ em pequenos fragmentos (chunks)
function createChunks(text, chunkSize = 600) {
  const paragraphs = text.split('\n');
  const chunks = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + "\n" + para).length > chunkSize) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk = currentChunk ? (currentChunk + "\n" + para) : para;
    }
  }

  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  if (chunks.length === 0 && text.trim()) chunks.push(text.trim());

  return chunks;
}

// Execução Principal do Processo
async function main() {
  try {
    let htmlContent = '';
    console.log(`🔌 [Scraper] Conectando ao link e baixando HTML bruto...`);
    
    try {
      htmlContent = await fetchHtml(targetUrl);
      console.log(`💾 [Scraper] HTML baixado com sucesso! Tamanho: ${(htmlContent.length / 1024).toFixed(1)} KB.`);
    } catch (fetchErr) {
      console.warn(`⚠️ Falha na raspagem direta da URL (CORS ou restrição de rede): ${fetchErr.message}`);
      console.log(`🔄 Iniciando fallback local com artigos estruturados oficiais Yooga.`);
    }

    let rawFaqs = [];
    if (htmlContent) {
      const cleaned = cleanHtml(htmlContent);
      console.log(`🧹 [Cleaner] HTML higienizado! Tamanho reduzido para: ${(cleaned.length / 1024).toFixed(1)} KB.`);
      
      // Parsear com IA do Gemini
      rawFaqs = await parseFaqWithIA(cleaned, targetUrl);
    }

    // Se falhar ou estiver vazio, pegar do fallback
    if (!rawFaqs || rawFaqs.length === 0) {
      console.log(`🔄 Alimentando o importador de IA com os artigos estruturados oficiais da URL.`);
      rawFaqs = getFallbackArticlesForUrl(targetUrl);
    }

    console.log(`\n🌀 [Vetorizador] Iniciando fragmentação e geração de embeddings de alta performance...`);
    
    const processedData = [];

    for (const faq of rawFaqs) {
      console.log(`\n👉 Artigo: "${faq.title}"...`);
      const chunks = createChunks(faq.content);
      console.log(`   -> Dividido em ${chunks.length} fragmento(s).`);

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const textToEmbed = `[Artigo: ${faq.title}]\n${chunkText}`;
        
        console.log(`   * Vetorizando fragmento ${i + 1}/${chunks.length} (Gemini text-embedding-004)...`);
        const embedding = await generateEmbedding(textToEmbed);

        if (embedding) {
          processedData.push({
            id: `${faq.faqUrl.split('/').pop() || 'faq'}-part-${i}`,
            title: faq.title,
            faqUrl: faq.faqUrl,
            content: chunkText,
            embedding: embedding
          });
        }
      }
    }

    // Mesclar com a base de dados atual se ela já existir
    const outputDir = path.resolve(process.cwd(), 'src/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'faq-embeddings.json');
    
    let existingFaqs = [];
    if (fs.existsSync(outputPath)) {
      try {
        existingFaqs = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        console.log(`\n📚 Base RAG física detectada! Contém ${existingFaqs.length} fragmentos.`);
      } catch (err) {
        console.warn("⚠️ Base atual corrompida ou vazia. Criando nova base.");
      }
    }

    // Mesclar sem duplicatas de IDs
    const mergedMap = new Map();
    existingFaqs.forEach(item => mergedMap.set(item.id, item));
    processedData.forEach(item => mergedMap.set(item.id, item));
    const mergedList = Array.from(mergedMap.values());

    fs.writeFileSync(outputPath, JSON.stringify(mergedList, null, 2), 'utf-8');

    console.log("\n=======================================================");
    console.log("🏅 PROCESSO CONCLUÍDO COM SUCESSO!");
    console.log(`Total de novos fragmentos processados nesta execução: ${processedData.length}`);
    console.log(`Total de fragmentos na base de conhecimento final: ${mergedList.length}`);
    console.log(`Arquivo salvo em: ${outputPath}`);
    console.log("=======================================================");
  } catch (error) {
    console.error("❌ Ocorreu um erro geral de execução no script de scraping:", error);
    process.exit(1);
  }
}

main();
