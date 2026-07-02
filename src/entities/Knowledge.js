import { Scenario } from "./all.js";
import { generateId, now, createLocalEntity } from "./base.js";

/**
 * Entidades locais para a Base de Conhecimento Yooga e Trilhas de Aprendizado.
 */

function createEntity(storageKey) {
  const local = createLocalEntity(storageKey);
  return {
    async list(orderBy = '-created_date') {
      return local.list(orderBy);
    },
    async filter(criteria = {}, orderBy = '-created_date', limit = 100) {
      return local.filter(criteria, orderBy, limit);
    },
    async get(id) {
      return local.get(id);
    },
    async create(data) {
      return local.create(data);
    },
    async update(id, data) {
      return local.update(id, data);
    },
    async delete(id) {
      return local.delete(id);
    }
  };
}

export const Module = createEntity('db_modules');
export const Article = createEntity('db_articles');
export const Quiz = createEntity('db_quizzes');
export const QuizAttempt = createEntity('db_quiz_attempts');
export const Certification = createEntity('db_certifications');

let knowledgeInitPromise = null;

async function getOrCreateScenario(scenarioData) {
  try {
    const existing = await Scenario.list();
    const found = existing.find(
      s => s.title.trim().toLowerCase() === scenarioData.title.trim().toLowerCase()
    );
    if (found) {
      console.log(`[Yooga Seed] Cenário "${scenarioData.title}" já existe (ID: ${found.id}). Pulando criação.`);
      return found;
    }
  } catch (err) {
    console.warn(`[Yooga Seed] Erro ao listar cenários para verificar unicidade de "${scenarioData.title}":`, err.message);
  }
  
  return await Scenario.create({
    ...scenarioData,
    skipSyncQueue: true
  });
}

async function initializeKnowledgeDatabase() {
  try {
    const dbVersion = 'yooga_db_clean_v6';
    const isInitialized = localStorage.getItem(dbVersion);
    
    if (!isInitialized) {
      localStorage.removeItem('db_modules');
      localStorage.removeItem('db_articles');
      localStorage.removeItem('db_quizzes');
      localStorage.removeItem('db_scenarios');
      localStorage.setItem(dbVersion, 'true');
    }

    const modules = await Module.list();
    if (modules.length === 0) {
      
      // 1. Módulo PDV & Caixa
      const m1 = await Module.create({
        name: "PDV & Operação de Caixa",
        description: "Domine a abertura, fechamento e principais rotinas do PDV Yooga, incluindo vendas offline.",
        icon: "layout-grid",
        estimated_time: "40 min"
      });

      await Article.create({
        moduleId: m1.id,
        title: "Como abrir e fechar o caixa no PDV?",
        faqUrl: "https://ajuda.yooga.com.br/pt-BR/articles/como-abrir-e-fechar-o-caixa-no-pdv",
        content: `A abertura e o fechamento do caixa são processos essenciais para manter o controle financeiro do restaurante.
No PDV Yooga, para abrir o caixa:
1. Acesse o menu lateral esquerdo e clique em "Caixa".
2. Digite o valor de suprimento (troco inicial em dinheiro) disponível na gaveta.
3. Clique em "Abrir Caixa". O sistema registrará a hora e o usuário responsável.

Para fechar o caixa ao fim do expediente:
1. No menu "Caixa", clique no botão "Fechar Caixa".
2. Informe o valor total que você tem fisicamente na gaveta (separando por forma de pagamento: dinheiro, cartão, pix, etc.).
3. O sistema fará a conciliação e mostrará se houve quebra (falta de dinheiro) ou sobra.
4. Clique em "Confirmar Fechamento" para gerar o relatório consolidado.`
      });

      await Article.create({
        moduleId: m1.id,
        title: "Vendas Offline no PDV Yooga",
        faqUrl: "https://ajuda.yooga.com.br/pt-BR/articles/vendas-offline-no-pdv-yooga",
        content: `A Yooga sabe que a internet pode oscilar no meio do atendimento. Por isso, nosso PDV conta com contingência e vendas em modo offline.
Como funciona:
1. Caso a conexão caia, o sistema exibirá um aviso discreto indicando "Modo Offline".
2. Você poderá continuar registrando pedidos e realizando vendas normalmente no dinheiro ou cartão de máquina física.
3. Os dados ficam salvos localmente na memória do seu navegador.
4. Importante: NÃO limpe os dados do navegador nem feche o app enquanto estiver offline.
5. Assim que a internet retornar, o sistema Yooga sincronizará todas as vendas automaticamente com a nuvem, atualizando o estoque e o financeiro.`
      });

      // Quiz do Módulo 1
      await Quiz.create({
        moduleId: m1.id,
        questions: [
          {
            question: "O que é o valor de suprimento inserido na abertura de caixa?",
            options: [
              "O total de vendas faturadas no dia anterior.",
              "O valor em dinheiro deixado na gaveta como troco inicial.",
              "A taxa de comissão cobrada pelos entregadores do delivery.",
              "O saldo disponível na conta bancária do restaurante."
            ],
            answerIndex: 1
          },
          {
            question: "O que acontece com as vendas feitas no modo offline no PDV Yooga?",
            options: [
              "São perdidas imediatamente e o caixa é travado.",
              "Ficam salvas na memória local do navegador e sincronizam sozinhas quando a internet volta.",
              "Exigem que você digite tudo de novo no painel administrativo manualmente.",
              "São transmitidas por sinal de rádio para o servidor da Yooga."
            ],
            answerIndex: 1
          }
        ]
      });

      // 2. Módulo Delivery & Integrações
      const m2 = await Module.create({
        name: "Delivery & Integração iFood",
        description: "Aprenda a receber pedidos do delivery próprio e integrar o gerenciador com o iFood.",
        icon: "shopping-bag",
        estimated_time: "50 min"
      });

      await Article.create({
        moduleId: m2.id,
        title: "Configurando a Integração do iFood",
        faqUrl: "https://ajuda.yooga.com.br/pt-BR/articles/configurando-integracao-ifood",
        content: `A integração do iFood permite centralizar todos os pedidos do seu restaurante na tela do gerenciador Yooga, evitando ter que usar o portal do parceiro em paralelo.
Passo a passo para ativar:
1. No Painel Administrativo Yooga, acesse "Configurações" > "Integrações" > "iFood".
2. Clique em "Conectar Conta". Você será redirecionado para autorizar o aplicativo Yooga no portal do iFood Merchant.
3. Selecione a loja correspondente e confirme os acessos.
4. Na Yooga, realize o vínculo de categorias e produtos para que os preços e itens do cardápio estejam sincronizados.
5. Ative a integração. A partir desse momento, os pedidos cairão direto no seu PDV com aviso sonoro.`
      });

      await Quiz.create({
        moduleId: m2.id,
        questions: [
          {
            question: "Qual o principal benefício de integrar o iFood com a Yooga?",
            options: [
              "Pagar taxas menores diretamente para o iFood.",
              "Evitar a necessidade de usar o portal do parceiro em paralelo, centralizando tudo no painel Yooga.",
              "Fazer entregas automáticas usando drones da Yooga.",
              "Sincronizar o financeiro do iFood diretamente com o banco do restaurante."
            ],
            answerIndex: 1
          }
        ]
      });

      // 3. Módulo Fiscal
      const m3 = await Module.create({
        name: "Fiscal: Emissão de Notas (NFC-e)",
        description: "Entenda os requisitos tributários, parametrização e correção de rejeições fiscais comuns.",
        icon: "file-text",
        estimated_time: "60 min"
      });

      await Article.create({
        moduleId: m3.id,
        title: "Requisitos para emissão de NFC-e na Yooga",
        faqUrl: "https://ajuda.yooga.com.br/pt-BR/articles/requisitos-emissao-nfce",
        content: `Para emitir NFC-e (Nota Fiscal de Consumidor Eletrônica) pelo sistema da Yooga, o restaurante precisa cumprir alguns pré-requisitos com a Sefaz do seu estado:
1. Certificado Digital válido (preferencialmente modelo A1, que é instalado diretamente na nuvem da Yooga).
2. Inscrição Estadual ativa e regularizada.
3. Código CSC (Código de Segurança do Contribuinte) de produção e ID do CSC gerados no portal do contribuinte da Sefaz.
4. Configuração das alíquotas fiscais (NCM, CFOP e CSOSN) dos produtos. Nossa equipe de CS apoia o preenchimento, mas a indicação exata deve vir da contabilidade do cliente.`
      });

      await Quiz.create({
        moduleId: m3.id,
        questions: [
          {
            question: "Qual o modelo de Certificado Digital preferencial para emissão na Yooga?",
            options: [
              "Modelo A3 em cartão físico.",
              "Modelo A1, instalado diretamente na nuvem do sistema.",
              "Certificado físico em papel timbrado.",
              "Qualquer certificado digital pessoal do sócio proprietário."
            ],
            answerIndex: 1
          }
        ]
      });
      
      // Criar Cenários padrão atrelados aos Módulos
      await getOrCreateScenario({
        title: "Venda Offline: Internet caiu no almoço",
        description: "Um operador de caixa desesperado com a queda da internet no meio do almoço teme perder suas vendas.",
        initial_problem: "Socorro! A internet caiu aqui no meio do expediente de almoço! Estamos cheios de clientes querendo pagar, posso continuar vendendo offline ou vou perder tudo?",
        client_profile: "irritado",
        difficulty_level: "iniciante",
        expected_interactions: 4,
        goals: [
          "Acalmar o cliente demonstrando empatia rápida com a correria.",
          "Confirmar que a Yooga suporta vendas offline salvas no navegador.",
          "Instruir explicitamente a NÃO limpar dados e NÃO fechar o app Yooga.",
          "Explicar a sincronização automática imediata ao retornar a internet."
        ],
        status: "ativo",
        moduleId: m1.id
      });

      await getOrCreateScenario({
        title: "Integração iFood: Preços divergentes",
        description: "Um restaurante está confuso sobre a discrepância de valores entre a Yooga e o portal iFood Merchant.",
        initial_problem: "Estou tendo problemas na integração. Os preços das minhas pizzas no iFood Merchant estão diferentes do que eu configurei no painel da Yooga. O que está acontecendo?",
        client_profile: "confuso",
        difficulty_level: "intermediario",
        expected_interactions: 5,
        goals: [
          "Explicar o fluxo de sincronização de preços entre os sistemas.",
          "Orientar a acessar o menu de Integrações > iFood no Painel.",
          "Explicar a necessidade de vincular as categorias e itens corretamente.",
          "Disparar a atualização/sincronização do cardápio para validar os novos preços."
        ],
        status: "ativo",
        moduleId: m2.id
      });

      await getOrCreateScenario({
        title: "Rejeição Fiscal na NFC-e (Código CSC)",
        description: "Cliente impaciente com fila no caixa recebendo erro de 'Código CSC inválido ou não cadastrado'.",
        initial_problem: "Preciso de ajuda urgente! Estou com um cliente na boca do caixa esperando a nota fiscal dele, mas toda vez que tento emitir a NFC-e dá erro de rejeição 'Código CSC inválido ou não cadastrado na SEFAZ'. O que eu faço?",
        client_profile: "impaciente",
        difficulty_level: "avançado",
        expected_interactions: 5,
        goals: [
          "Demonstrar alto nível de agilidade e escuta ativa com a pressa dele.",
          "Explicar que o erro indica divergência nas chaves CSC/ID do CSC geradas na SEFAZ.",
          "Revisar se o Certificado Digital A1 está válido e instalado na nuvem Yooga.",
          "Orientar a obter as chaves exatas de produção com o contador para salvar no painel."
        ],
        status: "ativo",
        moduleId: m3.id
      });
      
    }
    
    // Cenários baseados na wiki — variados por trilha, dificuldade e perfil de cliente
    try {
      // Remover cenários legados que foram substituídos por versões melhores
      const LEGACY_TITLES = [
        "Impressora: Layout Cortado na Bobina",
        "Caixa: Dividir Pagamento no PDV",
        "Segurança: Senha para Cancelamentos",
        "Delivery: Ativar o Chat de Pedidos",
      ];
      try {
        const allScenarios = await Scenario.list();
        for (const s of allScenarios) {
          if (LEGACY_TITLES.some(t => t.toLowerCase() === s.title?.trim().toLowerCase())) {
            await Scenario.delete(s.id);
          }
        }
      } catch (_) { /* silencia se delete não existir */ }

      const currentModules = await Module.list();
      const mPDV      = currentModules.find(m => m.name.includes("PDV"))      || { id: "local-m1" };
      const mDelivery = currentModules.find(m => m.name.includes("Delivery")) || { id: "local-m2" };
      const mFiscal   = currentModules.find(m => m.name.includes("Fiscal"))   || { id: "local-m3" };

      // ─── TRILHA PDV ───────────────────────────────────────────────────────────

      // PDV · Iniciante · Tranquilo
      await getOrCreateScenario({
        title: "PDV: Abrir o Caixa pela Primeira Vez",
        description: "Um novo operador de caixa não sabe como abrir o caixa e lançar o fundo inicial antes de começar a atender.",
        initial_problem: "Oi! Sou novo aqui e é minha primeira vez usando o sistema. Meu gerente me pediu pra abrir o caixa com R$ 200 de fundo de troco antes de começar. Como faço isso?",
        client_profile: "tranquilo",
        difficulty_level: "iniciante",
        expected_interactions: 4,
        goals: [
          "Recepcionar o novo operador com empatia e encorajamento.",
          "Orientar a acessar 'Histórico de Vendas' e clicar em 'Quero abrir meu caixa'.",
          "Explicar como inserir o valor R$ 200 no campo 'Saldo real' e confirmar clicando em 'Abrir Caixa'.",
          "Avisar que o caixa agora está aberto e pronto para registrar vendas."
        ],
        status: "ativo",
        moduleId: mPDV.id
      });

      // PDV · Intermediário · Irritado
      await getOrCreateScenario({
        title: "PDV: Operador sem Permissão para Desconto",
        description: "Um operador irritado não consegue aplicar desconto no PDV e pressiona o suporte para liberar acesso.",
        initial_problem: "Que absurdo! Tentei dar um desconto pro cliente que estava esperando há meia hora e o sistema nem deixa! Aparece que não tenho permissão. Meu chefe não está aqui, o que eu faço agora?",
        client_profile: "irritado",
        difficulty_level: "intermediario",
        expected_interactions: 5,
        goals: [
          "Acalmar o operador mostrando empatia com a situação constrangedora.",
          "Explicar que permissões são configuradas por um Administrador em Ajustes > Usuários > Permissões.",
          "Orientar a localizar a permissão 'Aplicar desconto' dentro do módulo correto (Mesas ou Balcão).",
          "Sugerir contato imediato com o gerente para liberar a permissão ou usar a senha de supervisor no PDV.",
          "Confirmar que após ajuste o operador conseguirá aplicar descontos normalmente."
        ],
        status: "ativo",
        moduleId: mPDV.id
      });

      // PDV · Avançado · Tranquilo
      await getOrCreateScenario({
        title: "PDV: Configurar Cardápio QR Code para Mesas",
        description: "Gerente quer substituir cardápios físicos pelo QR code digital para agilizar o atendimento nas mesas.",
        initial_problem: "Olá! Quero implementar o cardápio digital com QR code aqui no salão para acabar com o custo de reimprimir cardápios toda vez que mudo o preço. Como configuro isso na Yooga?",
        client_profile: "tranquilo",
        difficulty_level: "avancado",
        expected_interactions: 6,
        goals: [
          "Explicar o funcionamento: o QR code reflete o cardápio online em tempo real.",
          "Orientar o caminho: Ajustes > Geral > ativar 'Habilitar cardápio digital'.",
          "Após ativar, explicar que a opção 'Cardápio QR code' aparece no topo de Ajustes.",
          "Instruir a clicar em 'Configurar QR code' e escolher entre imprimir só o QR ou o folheto personalizado.",
          "Esclarecer que qualquer alteração de preço ou item no cardápio é refletida automaticamente no QR code.",
          "Confirmar que não há custo adicional pela funcionalidade de cardápio digital."
        ],
        status: "ativo",
        moduleId: mPDV.id
      });

      // PDV · Intermediário · Tranquilo
      await getOrCreateScenario({
        title: "PDV: Cadastrar Produto com Preço por Peso",
        description: "Dono de açougue quer cadastrar produtos pesáveis integrados à balança no PDV.",
        initial_problem: "Tenho um açougue e vendo carne por quilo. Como cadastro os produtos para que o preço seja calculado automaticamente pelo peso que a balança marcar na hora da venda?",
        client_profile: "tranquilo",
        difficulty_level: "intermediario",
        expected_interactions: 5,
        goals: [
          "Confirmar que a Yooga suporta produtos pesáveis integrados à balança.",
          "Orientar a acessar o cadastro do produto e ativar a opção 'Função pesável'.",
          "Explicar que ao habilitar, o PDV vai aguardar a leitura do peso da balança para calcular o valor.",
          "Mencionar a necessidade de a balança estar corretamente configurada e pareada com o sistema.",
          "Sugerir fazer um teste de pesagem após o cadastro para confirmar a integração."
        ],
        status: "ativo",
        moduleId: mPDV.id
      });

      // ─── TRILHA DELIVERY ──────────────────────────────────────────────────────

      // Delivery · Iniciante · Irritado
      await getOrCreateScenario({
        title: "Delivery: Loja Não Abre no Horário Configurado",
        description: "Cliente irritado porque o delivery não abre automaticamente no horário combinado, prejudicando os primeiros pedidos do dia.",
        initial_problem: "Meu delivery deveria abrir às 11h mas já são 11h30 e continua fechado! Estou perdendo pedidos! Configurei o horário semana passada, o que está errado?",
        client_profile: "irritado",
        difficulty_level: "iniciante",
        expected_interactions: 4,
        goals: [
          "Reconhecer a urgência e demonstrar empatia com o prejuízo de pedidos perdidos.",
          "Orientar a verificar se o horário está salvo em Ajustes > Configurações > Horário de Funcionamento.",
          "Confirmar que o dia da semana correto está selecionado no horário cadastrado.",
          "Explicar que o delivery abre e fecha automaticamente conforme o horário, sem necessidade de ação manual."
        ],
        status: "ativo",
        moduleId: mDelivery.id
      });

      // Delivery · Intermediário · Tranquilo
      await getOrCreateScenario({
        title: "Delivery: Ativar Adição Múltipla de Produtos",
        description: "Dono de distribuidora quer que clientes possam adicionar vários itens (ex: refrigerantes) ao carrinho com um único clique.",
        initial_problem: "Tenho uma distribuidora e os clientes compram refrigerante às caixas. Tem como deixar o carrinho do delivery com botão de quantidade direto na listagem de produtos sem precisar entrar em cada um?",
        client_profile: "tranquilo",
        difficulty_level: "intermediario",
        expected_interactions: 4,
        goals: [
          "Confirmar que a funcionalidade 'Adição Múltipla' existe nativamente no delivery Yooga.",
          "Orientar o caminho: Cardápio de Delivery > selecionar a categoria > Editar Categoria.",
          "Instruir a ativar a opção 'Seleção de múltiplas unidades' e salvar.",
          "Explicar que o cliente verá um contador (+/-) diretamente na listagem dos produtos da categoria."
        ],
        status: "ativo",
        moduleId: mDelivery.id
      });

      // Delivery · Avançado · Irritado
      await getOrCreateScenario({
        title: "Delivery: Produto Disponível Só em Dias Específicos",
        description: "Cliente frustrado pois clientes estão pedindo marmita de sábado na segunda e o produto não deveria aparecer no delivery nesse dia.",
        initial_problem: "Estou com um problema sério! Tenho um prato especial de sábado, mas os clientes estão pedindo segunda-feira e depois reclamam que não tem. Preciso que esse produto SÓ apareça no sábado. Como configuro isso?",
        client_profile: "irritado",
        difficulty_level: "avancado",
        expected_interactions: 5,
        goals: [
          "Validar a dor do cliente: reclamações de pedidos não atendidos prejudicam a reputação.",
          "Explicar que existe a funcionalidade 'Disponibilidade por dia' para produtos no delivery.",
          "Orientar: Cardápio de Delivery > selecionar o produto > editar > aba Disponibilidade.",
          "Instruir a selecionar apenas 'Sábado' nos dias de disponibilidade e salvar.",
          "Confirmar que o produto ficará oculto automaticamente nos outros dias da semana."
        ],
        status: "ativo",
        moduleId: mDelivery.id
      });

      // Delivery · Iniciante · Tranquilo
      await getOrCreateScenario({
        title: "Delivery: Destacar Produto no Cardápio Digital",
        description: "Dono de restaurante quer deixar o prato do dia em destaque no topo do cardápio online para aumentar as vendas.",
        initial_problem: "Oi! Quero deixar a minha 'Marmita Executiva' em destaque no cardápio do delivery hoje. Tem como botar ela lá em cima chamando atenção dos clientes?",
        client_profile: "tranquilo",
        difficulty_level: "iniciante",
        expected_interactions: 3,
        goals: [
          "Confirmar que a Yooga tem função de destaque nativa no cardápio de delivery.",
          "Orientar: Cardápio de Delivery > selecionar o produto > ativar opção 'Destacar produto'.",
          "Explicar que o produto aparecerá em uma seção especial no topo do cardápio para os clientes."
        ],
        status: "ativo",
        moduleId: mDelivery.id
      });

      // ─── TRILHA INTEGRAÇÕES ───────────────────────────────────────────────────

      // Integrações · Iniciante · Tranquilo
      await getOrCreateScenario({
        title: "Integrações: Ativar o KDS (Monitor de Cozinha)",
        description: "Gerente quer eliminar impressões na cozinha e usar uma tela para monitorar pedidos em tempo real.",
        initial_problem: "Quero instalar um monitor na cozinha para os cozinheiros acompanharem os pedidos sem depender de impressora. Vi falar no KDS da Yooga. Como funciona e o que preciso fazer para ativar?",
        client_profile: "tranquilo",
        difficulty_level: "iniciante",
        expected_interactions: 5,
        goals: [
          "Explicar o KDS: tela que exibe pedidos em tempo real, com status em andamento, pronto e cancelado.",
          "Informar que o valor é R$ 160/mês e que a contratação é feita pelo suporte ou chat no app.",
          "Orientar que após contratar, o acesso é configurado em Ajustes > Integrações > KDS.",
          "Explicar que é possível definir quais setores (cozinha, bar) recebem quais itens no monitor.",
          "Mencionar que o KDS pode substituir ou complementar as impressoras de produção."
        ],
        status: "ativo",
        moduleId: mPDV.id
      });

      // Integrações · Intermediário · Irritado
      await getOrCreateScenario({
        title: "Integrações: Robô do WhatsApp não Responde Clientes",
        description: "Dono irritado porque o robô de respostas automáticas do WhatsApp parou de funcionar após uma atualização.",
        initial_problem: "Meu robô do WhatsApp que responde automaticamente os clientes parou de funcionar! Os clientes mandam mensagem perguntando o cardápio e ninguém responde. Isso está matando minhas vendas!",
        client_profile: "irritado",
        difficulty_level: "intermediario",
        expected_interactions: 5,
        goals: [
          "Demonstrar empatia com o impacto direto nas vendas e acalmar o cliente.",
          "Verificar junto ao cliente se a integração está ativa em Ajustes > Integrações > Robô WhatsApp.",
          "Solicitar que verifique se o número de WhatsApp Business ainda está vinculado corretamente.",
          "Orientar a desconectar e reconectar o QR code de vinculação caso o status apareça como desconectado.",
          "Caso persista, escalar para o suporte técnico com print do status da integração."
        ],
        status: "ativo",
        moduleId: mDelivery.id
      });

      // Integrações · Avançado · Tranquilo
      await getOrCreateScenario({
        title: "Integrações: Configurar PIX Online no Delivery",
        description: "Proprietário quer ativar o pagamento via PIX direto no link de pedidos do delivery para receber online com segurança.",
        initial_problem: "Quero aceitar PIX no meu delivery diretamente pelo link de pedido, sem o cliente ter que pagar na entrega. Tem como o dinheiro cair direto na minha conta? Como configuro isso?",
        client_profile: "tranquilo",
        difficulty_level: "avancado",
        expected_interactions: 6,
        goals: [
          "Confirmar que a Yooga oferece integração de PIX online para o delivery.",
          "Explicar que o recurso é o 'Pix Online' disponível em Ajustes > Integrações > Pix Online.",
          "Orientar o cadastro da chave Pix e vinculação com a conta bancária desejada.",
          "Explicar que após ativação o cliente verá 'Pagar com Pix' na finalização do pedido.",
          "Esclarecer que o valor cai diretamente na conta cadastrada, sem intermediários.",
          "Mencionar que pedidos com Pix pago online ficam marcados como 'Pagamento confirmado' no painel."
        ],
        status: "ativo",
        moduleId: mDelivery.id
      });

      // ─── TRILHA FISCAL ────────────────────────────────────────────────────────

      // Fiscal · Intermediário · Confuso
      await getOrCreateScenario({
        title: "Fiscal: Acompanhar Notas Emitidas no Painel",
        description: "Contador do restaurante quer entender como filtrar e exportar as NFC-e emitidas em um período para conciliação.",
        initial_problem: "Preciso ver todas as notas fiscais emitidas no mês de dezembro para passar pro contador. Tem como filtrar por período e ver o status de cada nota? Onde fica isso no sistema?",
        client_profile: "tranquilo",
        difficulty_level: "intermediario",
        expected_interactions: 4,
        goals: [
          "Orientar o acesso pelo painel: painel.yooga.com.br > Fiscal > Vendas.",
          "Explicar como usar o filtro de período para selecionar dezembro.",
          "Mostrar que é possível filtrar também por modelo da nota (NFC-e, NF-e) e status (transmitida, cancelada).",
          "Confirmar que o resultado pode ser exportado ou compartilhado com o contador."
        ],
        status: "ativo",
        moduleId: mFiscal.id
      });

      // Fiscal · Avançado · Irritado
      await getOrCreateScenario({
        title: "Fiscal: Inventário Fiscal Obrigatório Pendente",
        description: "Empresário irritado recebeu alerta do contador que o inventário fiscal anual está vencido e precisa ser gerado urgente.",
        initial_problem: "Meu contador acabou de me ligar furioso dizendo que o inventário fiscal do ano está vencido e que posso ser multado! Ele disse que precisa de um arquivo gerado pelo sistema. Como eu gero isso na Yooga urgente?",
        client_profile: "irritado",
        difficulty_level: "avancado",
        expected_interactions: 5,
        goals: [
          "Reconhecer a urgência e tranquilizar o cliente sem minimizar o problema.",
          "Orientar o acesso: painel.yooga.com.br > Fiscal > Inventário Fiscal.",
          "Explicar como selecionar o período de referência e gerar o arquivo de inventário.",
          "Alertar que os produtos precisam ter NCM (código fiscal) cadastrado para o inventário ser completo.",
          "Sugerir encaminhar o arquivo gerado imediatamente ao contador após a exportação."
        ],
        status: "ativo",
        moduleId: mFiscal.id
      });

    } catch (scErr) {
      console.error("Erro ao popular cenários de FAQ estendido:", scErr);
    }
  } catch (err) {
    console.error("Erro ao popular banco de dados de conhecimento:", err);
  }
}

/** Aguarda o seed de modulos, artigos, quizzes e cenarios antes de ler o localStorage. */
export function ensureKnowledgeReady() {
  if (!knowledgeInitPromise) {
    knowledgeInitPromise = initializeKnowledgeDatabase();
  }
  return knowledgeInitPromise;
}

ensureKnowledgeReady();

export default { Module, Article, Quiz, QuizAttempt, Certification, ensureKnowledgeReady };
