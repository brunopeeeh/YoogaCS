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
    
    // Sempre garantir que novos cenários com base no FAQ estendido existam (para testes imediatos do RAG)
    try {
      const currentModules = await Module.list();
      const m1 = currentModules.find(m => m.name.includes("PDV")) || { id: "local-m1" };
      const m2 = currentModules.find(m => m.name.includes("Delivery")) || { id: "local-m2" };

      // 1. Impressora: Layout Cortado na Bobina
      await getOrCreateScenario({
        title: "Impressora: Layout Cortado na Bobina",
        description: "O cliente está nervoso porque a impressão térmica sai cortada nas laterais na nova impressora de 58mm.",
        initial_problem: "Gente, me ajuda! Instalei a impressora térmica nova Bematech no caixa de 58mm, mas quando imprimo o pedido o texto sai todo cortado na lateral! Os motoboys não conseguem ler o endereço e está uma confusão. O que eu faço?",
        client_profile: "irritado",
        difficulty_level: "intermediario",
        expected_interactions: 4,
        goals: [
          "Acalmar o cliente com empatia sobre a confusão com os motoboys.",
          "Explicar como acessar a configuração de Impressoras no painel Yooga.",
          "Instruir a alterar a largura da bobina para 58mm no layout ou ajustar as margens verticais e horizontais.",
          "Clicar em Salvar e fazer uma impressão de teste para validar."
        ],
        status: "ativo",
        moduleId: m1.id
      });

      // 2. Caixa: Dividir Pagamento no PDV
      await getOrCreateScenario({
        title: "Caixa: Dividir Pagamento no PDV",
        description: "O atendente está confuso sobre como registrar múltiplas formas de pagamento na mesma venda.",
        initial_problem: "Olá, equipe. Estou com uma mesa de clientes aqui no balcão que quer rachar a conta. Eles querem pagar R$ 50,00 em dinheiro e os outros R$ 30,00 no Pix. Como que eu lanço essas duas formas de pagamento juntas na mesma venda pra fechar o caixa certinho?",
        client_profile: "confuso",
        difficulty_level: "iniciante",
        expected_interactions: 4,
        goals: [
          "Mostrar o passo a passo de clicar em 'Pagar' no fechamento do pedido no PDV.",
          "Orientar a digitar primeiro o valor parcial (R$ 50,00) no campo de pagamento.",
          "Instruir a selecionar 'Dinheiro' e clicar em 'Adicionar Pagamento' para registrar a primeira parte.",
          "Mostrar como escolher a segunda forma de pagamento (Pix) para o saldo devedor restante (R$ 30,00) e concluir a venda."
        ],
        status: "ativo",
        moduleId: m1.id
      });

      // 3. Segurança: Senha para Cancelamentos
      await getOrCreateScenario({
        title: "Segurança: Senha para Cancelamentos",
        description: "O gerente de um restaurante quer bloquear operadores de caixa comuns de cancelarem pedidos sem permissão.",
        initial_problem: "Olá! Estou desconfiado de que alguns operadores de caixa estão cancelando pedidos depois que os clientes pagam em dinheiro para desviar o caixa. Como eu faço para colocar uma senha ou bloquear o cancelamento no caixa comum?",
        client_profile: "detalhista",
        difficulty_level: "intermediario",
        expected_interactions: 4,
        goals: [
          "Explicar como acessar o Painel Administrativo > Configurações > Permissões de Usuários.",
          "Orientar a selecionar o cargo de 'Operador de Caixa' e desmarcar a opção 'Permitir Cancelamento de Vendas'.",
          "Explicar que a partir do bloqueio, o PDV exigirá a digitação da senha de um Administrador ou Gerente para concluir qualquer cancelamento.",
          "Indicar que os cancelamentos ficam auditados no relatório de justificativas financeiras."
        ],
        status: "ativo",
        moduleId: m1.id
      });

      // 4. Delivery: Ativar o Chat de Pedidos
      await getOrCreateScenario({
        title: "Delivery: Ativar o Chat de Pedidos",
        description: "O cliente deseja centralizar a comunicação com seus compradores diretamente no link de pedidos do delivery, dispensando o uso de WhatsApp.",
        initial_problem: "Olá! Vi que os clientes vivem me chamando no WhatsApp pra perguntar se o pedido já saiu pra entrega ou pra pedir pra tirar a cebola de última hora. Tem como os clientes conversarem comigo direto pelo link de pedidos do Delivery da Yooga, sem ter que ficar mandando mensagem no meu WhatsApp comercial?",
        client_profile: "confuso",
        difficulty_level: "iniciante",
        expected_interactions: 4,
        goals: [
          "Confirmar que a Yooga possui a funcionalidade nativa de Chat no Delivery",
          "Orientar o caminho exato de ativação: Ajustes > Configurações > Habilitar chat",
          "Explicar que para o estabelecimento a opção 'Chat com o cliente' aparece ao clicar sobre o pedido no painel de delivery",
          "Explicar que para o cliente o botão 'Chat com a loja' fica disponível na tela/link de acompanhamento do pedido",
          "Mencionar que essa função é ideal para evitar o desvio para o WhatsApp e centralizar o suporte do restaurante"
        ],
        status: "ativo",
        moduleId: m2.id
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
