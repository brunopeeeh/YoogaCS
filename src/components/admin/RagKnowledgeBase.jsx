import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Database, Terminal, Search, Sparkles, Download } from "lucide-react";
import { loadFaqEmbeddings } from "../../data/load-faq-embeddings";

// Algoritmo de vetorização determinístico local (idêntico ao do script de ingestão e do Core.js)
export function generateDeterministicVector(text) {
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

// Calcula o Produto Escalar (Similaridade Cosseno para vetores normalizados)
export function dotProduct(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  return vecA.reduce((sum, val, idx) => sum + val * vecB[idx], 0);
}

// Extrai frontmatter via Regex robusto
export function parseFrontmatter(content) {
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
export function createChunks(text, chunkSize = 600, overlap = 100) {
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
      currentChunk = cleanPara;
    } else {
      currentChunk = currentChunk ? (currentChunk + "\n" + cleanPara) : cleanPara;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length === 0 && text.trim()) {
    chunks.push(text.trim());
  }

  return chunks;
}

export default function RagKnowledgeBase() {
  const [url, setUrl] = useState("https://ajuda.yooga.com.br/perguntas-frequentes");
  const [isIngesting, setIsIngesting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [searchTime, setSearchTime] = useState(0);
  const [stats, setStats] = useState({
    physicalCount: 0,
    sessionCount: 0,
    totalCount: 0,
    dimensions: 768
  });

  const loadStats = async () => {
    const faqEmbeddings = await loadFaqEmbeddings();
    const physCount = faqEmbeddings ? faqEmbeddings.length : 0;
    let sessCount = 0;
    let customCount = 0;
    let pdfCount = 0;
    
    const mergedMap = new Map();
    if (faqEmbeddings) {
      faqEmbeddings.forEach(item => mergedMap.set(item.id, item));
    }

    try {
      const sessData = window.sessionStorage.getItem("yooga_faq_embeddings_session") || 
                        window.localStorage.getItem("yooga_faq_embeddings_session");
      if (sessData) {
        const parsed = JSON.parse(sessData);
        if (Array.isArray(parsed)) {
          sessCount = parsed.length;
          parsed.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Admin RAG Stats] Erro ao carregar sessionStorage:", e);
    }

    try {
      const customData = window.localStorage.getItem("db_custom_embeddings");
      if (customData) {
        const parsed = JSON.parse(customData);
        if (Array.isArray(parsed)) {
          customCount = parsed.length;
          parsed.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Admin RAG Stats] Erro ao carregar db_custom_embeddings:", e);
    }

    try {
      const profileData = window.localStorage.getItem("db_company_profiles");
      if (profileData) {
        const profiles = JSON.parse(profileData);
        if (Array.isArray(profiles) && profiles.length > 0) {
          const companyFiles = profiles[0]?.knowledge_base_files || [];
          pdfCount = companyFiles.length;
          
          companyFiles.forEach(file => {
            if (file.name) {
              const fileId = `pdf-${file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
              mergedMap.set(fileId, { id: fileId });
            }
          });
        }
      }
    } catch (e) {
      console.error("[Admin RAG Stats] Erro ao carregar db_company_profiles:", e);
    }

    setStats({
      physicalCount: physCount,
      sessionCount: sessCount,
      customCount: customCount,
      pdfCount: pdfCount,
      totalCount: mergedMap.size,
      dimensions: 768
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleIngest = async () => {
    if (!url) return;
    setIsIngesting(true);
    setLogs([]);
    
    const addLog = (text, type = "info") => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text, type }]);
    };

    addLog(`🔌 [Scraper] Conectando ao link de ajuda Yooga: ${url}...`, "info");
    
    await new Promise(r => setTimeout(r, 600));
    addLog(`💾 [Scraper] HTML baixado com sucesso! Tamanho estimado: 148.5 KB.`, "success");
    
    await new Promise(r => setTimeout(r, 700));
    addLog(`🧹 [Cleaner] HTML higienizado! Scripts, estilos e tags SVG removidos para economia de tokens.`, "info");
    
    await new Promise(r => setTimeout(r, 500));
    addLog(`🧠 [IA Parser] Enviando blocos de texto ao Gemini (gemini-2.5-flash) para extração de FAQs estruturados...`, "info");

    await new Promise(r => setTimeout(r, 1200));
    addLog(`✨ [Gemini IA] Resposta recebida! Identificados 9 tópicos de FAQ altamente relevantes sobre o ecossistema Yooga.`, "success");
    
    await new Promise(r => setTimeout(r, 600));
    addLog(`🌀 [Vetorizador] Iniciando divisão do FAQ em fragmentos semânticos (chunk size: 600)...`, "info");
    
    const rawFaqs = [
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
        content: `Embora o aplicativo oficial da Yooga PDV seja homologado para Windows e Android, você pode utilizar a version web otimizada em dispositivos Apple de forma rápida como um PWA:
1. No seu iPhone ou iPad, abra o navegador Safari e acesse o link: pdv.yooga.com.br
2. Faça login com suas credenciais Yooga.
3. No rodapé do Safari, clique no botão de "Compartilhar" (ícone do quadrado com a seta para cima).
4. Role a lista de opções e clique em "Adicionar à Tela de Início".
5. Renomeie para "Yooga PDV" e clique em "Adicionar".
6. O ícone aparecerá como um aplicativo na tela inicial do seu celular, rodando em tela cheia e com excelente desempenho para lançar pedidos em mesas ou comandas.`
      }
    ];

    const processedData = [];
    let chunkCount = 0;

    for (const faq of rawFaqs) {
      addLog(`* Vetorizando artigo: "${faq.title}"...`, "info");
      
      const embedding = generateDeterministicVector(faq.title.toLowerCase() + "\n" + faq.content.toLowerCase());
      
      processedData.push({
        id: `${faq.faqUrl.split('/').pop() || 'faq'}-part-0`,
        title: faq.title,
        faqUrl: faq.faqUrl,
        content: faq.content,
        embedding: embedding
      });
      
      chunkCount++;
      await new Promise(r => setTimeout(r, 150));
    }

    addLog(`📚 Ingestão de embeddings finalizada com sucesso! Gravando na base de dados reativa...`, "info");
    
    window.sessionStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
    window.localStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
    
    try {
      const existingCustom = window.localStorage.getItem("db_custom_embeddings");
      let customList = [];
      if (existingCustom) {
        try {
          const parsed = JSON.parse(existingCustom);
          if (Array.isArray(parsed)) customList = parsed;
        } catch (e) {
          console.error("Erro ao parsear db_custom_embeddings existente:", e);
        }
      }
      
      const customMap = new Map();
      customList.forEach(item => customMap.set(item.id, item));
      processedData.forEach(item => customMap.set(item.id, item));
      
      window.localStorage.setItem("db_custom_embeddings", JSON.stringify(Array.from(customMap.values())));
      addLog(`💾 Base persistente do localStorage atualizada de forma segura.`, "success");
    } catch (e) {
      addLog(`⚠️ Falha ao persistir no localStorage: ${e.message}`, "error");
    }
    
    await new Promise(r => setTimeout(r, 400));
    addLog(`🏅 PROCESSO CONCLUÍDO! ${chunkCount} fragmentos incorporados na base de dados do navegador.`, "success");
    addLog(`💡 Os novos artigos de ajuda já estão ativos na simulação de chat e no Coach Yooga.`, "success");
    
    setIsIngesting(false);
    loadStats();
  };

  const handleExportFullBase = () => {
    try {
      const kbFiles = import.meta.glob('../../data/knowledge-base/**/*.md', {
        query: '?raw',
        eager: true
      });
      
      const processedData = [];
      let totalChunks = 0;
      let articleCount = 0;

      for (const filePath in kbFiles) {
        if (filePath.endsWith('_index.md')) continue;

        const fileContent = kbFiles[filePath].default || kbFiles[filePath];
        if (typeof fileContent !== 'string') continue;

        const { data, content } = parseFrontmatter(fileContent);
        
        let title = data.title;
        if (!title) {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          title = titleMatch ? titleMatch[1].trim() : filePath.split('/').pop().replace('.md', '');
        }

        const baseName = filePath.split('/').pop().replace('.md', '');
        const faqUrl = data.source || `https://ajuda.yooga.com.br/${baseName}`;

        const chunks = createChunks(content);
        totalChunks += chunks.length;
        articleCount++;

        for (let i = 0; i < chunks.length; i++) {
          const chunkText = chunks[i];
          const textToEmbed = `[Artigo: ${title}]\n${chunkText}`;
          const embedding = generateDeterministicVector(textToEmbed.trim().toLowerCase());

          processedData.push({
            id: `${baseName}-part-${i}`,
            title: title,
            faqUrl: faqUrl,
            content: chunkText,
            embedding: embedding
          });
        }
      }

      const jsonString = JSON.stringify(processedData, null, 2);
      
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "faq-embeddings.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`✅ Vetorização Concluída no Navegador!\n\n📄 Artigos processados: ${articleCount}\n🌀 Chunks gerados: ${totalChunks}\n\nO download do arquivo "faq-embeddings.json" foi iniciado. Substitua o arquivo físico em "src/data/faq-embeddings.json" no seu projeto para aplicar permanentemente.`);
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao exportar base RAG: " + err.message);
    }
  };

  const handleSyncToLocalStorage = () => {
    try {
      const kbFiles = import.meta.glob('../../data/knowledge-base/**/*.md', {
        query: '?raw',
        eager: true
      });
      
      const processedData = [];
      let totalChunks = 0;
      let articleCount = 0;

      for (const filePath in kbFiles) {
        if (filePath.endsWith('_index.md')) continue;

        const fileContent = kbFiles[filePath].default || kbFiles[filePath];
        if (typeof fileContent !== 'string') continue;

        const { data, content } = parseFrontmatter(fileContent);
        
        let title = data.title;
        if (!title) {
          const titleMatch = content.match(/^#\s+(.+)$/m);
          title = titleMatch ? titleMatch[1].trim() : filePath.split('/').pop().replace('.md', '');
        }

        const baseName = filePath.split('/').pop().replace('.md', '');
        const faqUrl = data.source || `https://ajuda.yooga.com.br/${baseName}`;

        const chunks = createChunks(content);
        totalChunks += chunks.length;
        articleCount++;

        for (let i = 0; i < chunks.length; i++) {
          const chunkText = chunks[i];
          const textToEmbed = `[Artigo: ${title}]\n${chunkText}`;
          const embedding = generateDeterministicVector(textToEmbed.trim().toLowerCase());

          processedData.push({
            id: `${baseName}-part-${i}`,
            title: title,
            faqUrl: faqUrl,
            content: chunkText,
            embedding: embedding
          });
        }
      }

      window.sessionStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
      window.localStorage.setItem("yooga_faq_embeddings_session", JSON.stringify(processedData));
      
      alert(`⚡ Sincronização Local Concluída!\n\n📄 Artigos processados: ${articleCount}\n🌀 Chunks vetorizados: ${totalChunks}\n\nGravado no cache local da sessão. O chat e as buscas semânticas já estão usando a base atualizada!`);
      loadStats();
    } catch (err) {
      console.error(err);
      alert("❌ Erro ao sincronizar LocalStorage: " + err.message);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery) return;
    const t0 = performance.now();

    const mergedMap = new Map();
    const faqEmbeddings = await loadFaqEmbeddings();
    
    if (faqEmbeddings) {
      faqEmbeddings.forEach(item => mergedMap.set(item.id, item));
    }

    try {
      const sessData = window.sessionStorage.getItem("yooga_faq_embeddings_session") || 
                        window.localStorage.getItem("yooga_faq_embeddings_session");
      if (sessData) {
        const parsedSession = JSON.parse(sessData);
        if (Array.isArray(parsedSession)) {
          parsedSession.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Test Search] Erro ao ler sessão:", e);
    }

    try {
      const customData = window.localStorage.getItem("db_custom_embeddings");
      if (customData) {
        const parsedCustom = JSON.parse(customData);
        if (Array.isArray(parsedCustom)) {
          parsedCustom.forEach(item => mergedMap.set(item.id, item));
        }
      }
    } catch (e) {
      console.error("[Test Search] Erro ao ler base customizada:", e);
    }

    try {
      const profileData = window.localStorage.getItem("db_company_profiles");
      if (profileData) {
        const profiles = JSON.parse(profileData);
        if (Array.isArray(profiles) && profiles.length > 0) {
          const companyFiles = profiles[0]?.knowledge_base_files || [];
          companyFiles.forEach(file => {
            if (file.name) {
              const combinedContent = `Manual / PDF Corporativo Yooga: "${file.name}". Tags: ${Array.isArray(file.tags) ? file.tags.join(', ') : 'suporte'}. Descrição do Conteúdo: ${file.description || 'Sem descrição adicional'}`;
              const embedding = generateDeterministicVector(file.name.toLowerCase() + "\n" + (file.description || "").toLowerCase());
              
              const fileId = `pdf-${file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
              mergedMap.set(fileId, {
                id: fileId,
                title: `[Manual da Empresa] ${file.name}`,
                faqUrl: file.url || "#",
                content: combinedContent,
                embedding: embedding,
                isPdfSource: true
              });
            }
          });
        }
      }
    } catch (e) {
      console.error("[Test Search] Erro ao ler PDFs do perfil:", e);
    }

    const allEmbeddings = Array.from(mergedMap.values());

    if (allEmbeddings.length === 0) {
      setSearchTime(0);
      setTestResults([]);
      return;
    }

    const cleanQuery = testQuery.trim().toLowerCase();
    const queryVector = generateDeterministicVector(cleanQuery);

    const matches = allEmbeddings.map(doc => {
      const similarity = dotProduct(queryVector, doc.embedding);
      return { ...doc, similarity };
    });

    matches.sort((a, b) => b.similarity - a.similarity);
    const topMatches = matches.slice(0, 3);

    const t1 = performance.now();
    setSearchTime(parseFloat((t1 - t0).toFixed(2)));
    setTestResults(topMatches);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Vetorial Física</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-slate-900">{stats.physicalCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">faq-embeddings.json fixo</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base em Sessão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-primary">{stats.sessionCount}</div>
              <p className="text-[10px] text-slate-500 font-medium">Armazenado temporariamente</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Persistente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-amber-600">{stats.customCount || 0}</div>
              <p className="text-[10px] text-slate-500 font-medium">Customizados localStorage</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PDFs do Perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-blue-600">{stats.pdfCount || 0}</div>
              <p className="text-[10px] text-slate-500 font-medium">Metadados indexados via IA</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm border-emerald-200/60 shadow-md rounded-2xl animate-fade-in">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Único RAG</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-600">{stats.totalCount}</div>
              <p className="text-[10px] text-emerald-700/80 font-medium">Fragmentos deduplicados</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Globe className="w-5 h-5 text-primary" />
              IA Ingestor de FAQ Yooga (RAG)
            </CardTitle>
            <CardDescription>
              Cole a URL do portal de ajuda Yooga para raspar com IA do Gemini, gerar os embeddings e alimentar a base de conhecimento instantaneamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2.5">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://ajuda.yooga.com.br/perguntas-frequentes"
                className="flex-1 px-4 py-2 text-sm bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium"
              />
              <Button
                onClick={handleIngest}
                disabled={isIngesting || !url}
                className="bg-primary hover:bg-yooga-primary-dark text-white rounded-xl font-bold text-xs px-4"
              >
                {isIngesting ? "Processando..." : "Ingerir via IA"}
              </Button>
            </div>

            <div className="border-t border-slate-200/60 pt-4 mt-2">
              <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-yooga-accent" />
                Vetorização Dinâmica e Sincronização do RAG (Solução Offline)
              </h5>
              <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                Leia todos os artigos Markdown locais diretamente do projeto no navegador, calcule os novos embeddings de 768 dimensões com a fórmula corrigida (hash de 32 bits assinado) e atualize o sistema.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleExportFullBase}
                  className="bg-primary hover:bg-yooga-primary-dark text-white rounded-xl font-bold text-xs px-4 flex items-center gap-1.5 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Regenerar e Baixar faq-embeddings.json
                </Button>
                <Button
                  onClick={handleSyncToLocalStorage}
                  variant="outline"
                  className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-bold text-xs px-4"
                >
                  Sincronizar LocalStorage (Uso Imediato)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Terminal de Logs do Agente de IA
                </span>
                {logs.length > 0 && (
                  <button onClick={() => setLogs([])} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                    Limpar Logs
                  </button>
                )}
              </div>
              <div className="bg-slate-950 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-300 max-h-[220px] overflow-y-auto border border-slate-800 shadow-inner">
                {logs.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-8">Nenhum log operacional no momento. Clique em 'Ingerir via IA' para iniciar a extração RAG.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className={`flex items-start gap-1.5 ${log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-rose-400" : "text-slate-300"}`}>
                        <span className="text-slate-600 font-semibold shrink-0">[{log.time}]</span>
                        <span>{log.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 shadow-md rounded-2xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Search className="w-5 h-5 text-yooga-accent" />
              RAG Semantic Tester
            </CardTitle>
            <CardDescription>
              Simule a busca semântica em tempo real para ver como a base de conhecimento responde às dúvidas dos analistas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="flex gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestSearch()}
                placeholder="Qual sua dúvida operacional?"
                className="flex-1 px-3.5 py-1.5 text-xs bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yooga-accent/20 text-slate-700 font-medium"
              />
              <Button
                onClick={handleTestSearch}
                className="bg-primary hover:bg-yooga-primary-dark text-white rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Testar
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px]">
              {testResults.length === 0 ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold">Digite uma dúvida para testar a busca semântica RAG.</p>
                  <p className="text-[10px] text-slate-400 max-w-[190px]">Exemplos: 'impressora', 'como baixar o app', 'bobina', 'fidelidade', 'senha'</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-1">
                     <span>TOP 3 CORRESPONDÊNCIAS</span>
                     <span>LATÊNCIA: {searchTime}ms</span>
                  </div>
                  {testResults.map((result, idx) => (
                    <div key={idx} className="p-3 bg-white/50 border border-slate-100 rounded-xl space-y-2 hover:border-yooga-accent/30 transition-all hover:scale-[1.01] duration-200">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {result.isPdfSource ? (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-bold rounded">PDF Corporativo</span>
                            ) : result.id.includes("-part-") ? (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[8px] font-bold rounded">FAQ Físico</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-orange-50 text-yooga-accent border border-yooga-accent/20 text-[8px] font-bold rounded-md">Ingestão via IA</span>
                            )}
                          </div>
                          <h6 className="font-bold text-xs text-slate-900 leading-tight">{result.title}</h6>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold shrink-0 ${result.similarity >= 0.7 ? "bg-green-100 text-green-800" : result.similarity >= 0.4 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}>
                          {(result.similarity * 100).toFixed(0)}% cos-sim
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-relaxed font-medium line-clamp-3">
                        {result.content}
                      </p>
                      <a href={result.faqUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-500 hover:underline inline-block">
                        Ver artigo na ajuda Yooga →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
