/**
 * yooga-knowledge-base.js
 * 
 * Base de conhecimento estruturada da Yooga para o simulador de CS.
 * Cada cenário possui:
 * - technicalContent: Conteúdo técnico completo que a IA precisa saber
 * - requiredPoints: Checklist de pontos OBRIGATÓRIOS que o agente deve mencionar
 * - commonMistakes: Erros comuns que agentes cometem (penalizam a nota)
 * - scoringCriteria: Critérios específicos de pontuação por pilar
 * - relatedArticles: Referências aos artigos .md da base
 */

export const YOOGA_KNOWLEDGE_BASE = {

  // ═══════════════════════════════════════════════════════
  // CENÁRIO 1: Venda Offline - Internet caiu no almoço
  // ═══════════════════════════════════════════════════════
  "venda_offline": {
    title: "Vendas Offline no PDV Yooga",
    scenarioMatch: "venda offline",

    technicalContent: `O PDV Yooga possui modo de contingência offline para garantir que o restaurante não pare de operar durante quedas de internet.

COMO FUNCIONA:
1. Quando a conexão cai, o sistema exibe um aviso discreto indicando "Modo Offline".
2. O operador pode continuar registrando pedidos e realizando vendas normalmente em dinheiro ou cartão de máquina física (maquininha).
3. Os dados ficam salvos localmente na memória do navegador (localStorage/IndexedDB).
4. CRÍTICO: NÃO limpar os dados do navegador nem fechar a aba/aplicativo enquanto estiver offline. Se limpar os dados do navegador ou fechar a aba/aplicativo, as vendas locais que não foram transmitidas poderão ser PERDIDAS de forma irreversível.
5. Assim que a internet retornar, o sistema Yooga sincronizará TODAS as vendas automaticamente com a nuvem, atualizando o estoque e o financeiro.
6. Formas de pagamento que NÃO funcionam offline: Pix Online e pagamento por cartão via integração (Yooga Pay). Apenas dinheiro e cartão na maquininha física funcionam offline.
7. O operador deve manter a janela do navegador/app aberta e o caixa em funcionamento normal durante todo o período offline.`,

    requiredPoints: [
      "Confirmar que as vendas feitas offline ficam SALVAS no navegador automaticamente",
      "Orientar a NÃO fechar a aba, o aplicativo ou o navegador enquanto estiver offline",
      "Orientar a NÃO limpar dados, cache ou histórico do navegador",
      "Informar que a sincronização é AUTOMÁTICA quando a internet voltar (não precisa fazer nada manual)",
      "Explicar que vendas em dinheiro e cartão na maquininha física funcionam normalmente offline",
      "Tranquilizar que o estoque e o financeiro atualizam automaticamente após a sincronização"
    ],

    commonMistakes: [
      "Dizer para o cliente fechar e reabrir o sistema/navegador",
      "Pedir para limpar o cache ou os dados do navegador",
      "Dizer que o cliente precisa anotar tudo e registrar manualmente depois",
      "Não mencionar que deve manter a aba/app aberto",
      "Dizer que pagamento por Pix Online funciona offline",
      "Demonstrar insegurança sobre se as vendas serão salvas"
    ],

    scoringCriteria: {
      resolution: "Nota máxima (90-100) se mencionar TODOS os 6 pontos obrigatórios. -15 pontos por ponto faltando. Nota ZERO se orientar a fechar/limpar o navegador (isso causaria perda de dados).",
      empathy: "Deve reconhecer o estresse do horário de pico/almoço e o medo de perder vendas ANTES de dar a solução técnica. Validar o sentimento ('Eu entendo seu desespero', 'Fique tranquilo') antes de instruir.",
      agility: "A solução principal (pode continuar vendendo + não feche a aba) deve ser dada na 1ª ou no máximo 2ª mensagem. Se o agente fizer perguntas desnecessárias antes de tranquilizar, a nota cai para 50-65.",
      professionalism: "Tom deve ser calmo e seguro, passando confiança. Usar linguagem positiva ('fique tranquilo, está tudo salvo') em vez de negativa ('não se preocupe com a perda')."
    },

    relatedArticles: [
      "pdv-mesa-e-balcao/como-operar-pelo-caixa.md",
      "perguntas-frequentes/como-adicionar-duas-formas-de-pagamento-na-venda.md"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CENÁRIO 2: Integração iFood - Preços divergentes
  // ═══════════════════════════════════════════════════════
  "integracao_ifood": {
    title: "Integração iFood: Preços Divergentes",
    scenarioMatch: "ifood",

    technicalContent: `A integração do iFood permite centralizar todos os pedidos do restaurante na tela do gerenciador Yooga, sem usar o portal do parceiro em paralelo.

FLUXO DE SINCRONIZAÇÃO DE PREÇOS:
1. No Painel Administrativo Yooga, acesse "Configurações" > "Integrações" > "iFood".
2. Clique em "Conectar Conta" e autorize o aplicativo Yooga no portal do iFood Merchant.
3. Selecione a loja correspondente e confirme os acessos.
4. Na Yooga, realize o VÍNCULO de categorias e produtos para que os preços e itens do cardápio estejam sincronizados.
5. Ative a integração. Os pedidos cairão direto no PDV com aviso sonoro.

CAUSAS COMUNS DE PREÇO DIVERGENTE:
- Produtos não vinculados corretamente entre Yooga e iFood.
- Atualização de preço feita apenas no painel Yooga sem sincronizar com o iFood.
- Atualização de preço feita diretamente no portal iFood Merchant (fora da Yooga).
- Categorias não mapeadas entre os dois sistemas.

SOLUÇÃO PASSO A PASSO:
1. Acessar Painel Yooga > Integrações > iFood.
2. Verificar se todos os produtos estão VINCULADOS (ícone de link ao lado de cada item).
3. Corrigir os preços no painel Yooga (fonte da verdade).
4. Disparar a SINCRONIZAÇÃO do cardápio clicando em "Sincronizar Cardápio" ou "Atualizar Preços".
5. Aguardar 5-10 minutos para a atualização refletir no app iFood.
6. Validar os preços acessando o app do iFood como cliente.`,

    requiredPoints: [
      "Explicar que os preços devem ser gerenciados pelo painel Yooga (fonte da verdade) e sincronizados com o iFood",
      "Orientar a acessar Integrações > iFood no Painel Administrativo",
      "Verificar se as categorias e produtos estão corretamente VINCULADOS entre Yooga e iFood",
      "Instruir a disparar a sincronização/atualização do cardápio após corrigir os preços",
      "Explicar que alterações feitas diretamente no portal iFood podem causar divergência"
    ],

    commonMistakes: [
      "Dizer para o cliente alterar os preços diretamente no portal iFood Merchant",
      "Não explicar o conceito de vínculo entre produtos dos dois sistemas",
      "Pular a etapa de verificar se os produtos estão vinculados",
      "Não mencionar a necessidade de disparar a sincronização",
      "Dizer que a atualização é instantânea (leva 5-10 min)"
    ],

    scoringCriteria: {
      resolution: "Nota máxima se explicar o fluxo completo: verificar vínculos → corrigir preços na Yooga → sincronizar → aguardar. -20 pontos se orientar a alterar preços no portal iFood.",
      empathy: "Reconhecer a frustração de ter preços errados no iFood (impacta vendas e confiança do cliente final).",
      agility: "Deve guiar com passos claros e objetivos, sem digressões. Aceitável em 3-4 mensagens.",
      professionalism: "Usar linguagem técnica clara sem ser condescendente. O cliente pode ser leigo em integrações."
    },

    relatedArticles: [
      "integracoes/integracoes.md"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CENÁRIO 3: Rejeição Fiscal na NFC-e (Código CSC)
  // ═══════════════════════════════════════════════════════
  "rejeicao_nfce": {
    title: "Rejeição Fiscal: Código CSC Inválido",
    scenarioMatch: "nfc-e",

    technicalContent: `Para emitir NFC-e (Nota Fiscal de Consumidor Eletrônica) pelo sistema Yooga, o restaurante precisa cumprir pré-requisitos com a Sefaz do estado:

PRÉ-REQUISITOS:
1. Certificado Digital válido (preferencialmente modelo A1, instalado na nuvem da Yooga).
2. Inscrição Estadual ativa e regularizada.
3. Código CSC (Código de Segurança do Contribuinte) de PRODUÇÃO e ID do CSC gerados no portal do contribuinte da Sefaz.
4. Configuração das alíquotas fiscais (NCM, CFOP e CSOSN) dos produtos.

ERRO "CÓDIGO CSC INVÁLIDO OU NÃO CADASTRADO NA SEFAZ":
- O CSC é uma chave de segurança gerada pela Sefaz estadual. Existe o CSC de HOMOLOGAÇÃO (teste) e o de PRODUÇÃO (real).
- Este erro significa que o CSC cadastrado no painel Yooga está incorreto, expirado, ou é de homologação.
- O contador ou responsável fiscal do restaurante precisa gerar ou recuperar as chaves CSC de PRODUÇÃO no portal da Sefaz.

PASSOS PARA RESOLVER:
1. Solicitar ao CONTADOR as chaves CSC e ID do CSC de PRODUÇÃO (não de homologação).
2. Verificar se o Certificado Digital A1 está válido (não expirado) e instalado na nuvem Yooga.
3. Acessar Painel Yooga > Configurações > Fiscal > Dados do CSC.
4. Inserir o novo CSC e ID do CSC de produção.
5. Salvar e tentar emitir uma nota de teste.
6. Se o erro persistir, verificar se a Inscrição Estadual está ativa na Sefaz.`,

    requiredPoints: [
      "Explicar que o erro indica que o CSC cadastrado na Yooga está incorreto, expirado, ou é de homologação",
      "Diferenciar CSC de HOMOLOGAÇÃO vs PRODUÇÃO (o correto é Produção)",
      "Orientar a solicitar ao CONTADOR as chaves CSC corretas de Produção no portal da Sefaz",
      "Verificar se o Certificado Digital A1 está válido e não expirado",
      "Indicar o caminho: Painel Yooga > Configurações > Fiscal > Dados do CSC para atualizar",
      "Demonstrar urgência e agilidade considerando que há cliente esperando no caixa"
    ],

    commonMistakes: [
      "Não diferenciar entre ambiente de Homologação e Produção",
      "Tentar resolver sem envolver o contador (a geração do CSC é feita na Sefaz pelo contador)",
      "Pedir para o cliente 'apenas tentar de novo' sem investigar a causa",
      "Não verificar a validade do Certificado Digital",
      "Ignorar a urgência do cliente que tem fila no caixa"
    ],

    scoringCriteria: {
      resolution: "Nota máxima se explicar a causa (CSC incorreto/homologação), envolver o contador, e indicar o caminho no painel. -25 pontos se não mencionar a diferença homologação/produção.",
      empathy: "CRÍTICO: O cliente tem fila no caixa. O agente DEVE reconhecer a urgência antes de dar instruções técnicas. Nota máxima 55 se ignorar a pressão.",
      agility: "Deve ser direto e dar um plano de ação imediato. Primeiro resolver o bloqueio (emitir manualmente ou sem nota), depois corrigir o CSC.",
      professionalism: "Assunto fiscal é sensível. O agente deve ser preciso e recomendar envolver o contador, sem tentar 'chutar' configurações fiscais."
    },

    relatedArticles: [
      "fiscal/fiscal.md",
      "fiscal/o-que-e-preciso-para-emitir-notas-fiscais-no-yooga.md",
      "fiscal/como-atualizar-certificado-digital.md"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CENÁRIO 4: Impressora - Layout Cortado na Bobina
  // ═══════════════════════════════════════════════════════
  "impressora_layout": {
    title: "Impressora: Layout Cortado na Bobina",
    scenarioMatch: "impressora",

    technicalContent: `O sistema Yooga permite configurar o layout de impressão diretamente pelo App, ajustando tamanho de bobina, margens e fonte.

O QUE PODE SER AJUSTADO PELO APP:
- Tamanho da bobina da impressora térmica: 80mm ou 56mm (58mm).
- Tamanho da fonte das impressões do delivery.
- Tamanho da fonte das impressões do PDV.
- Margem lateral (esquerda/direita).
- Margem superior.
- Margem inferior.

COMO AJUSTAR O LAYOUT:
1. No App Yooga, acesse Ajustes > Geral > Impressão.
2. Selecione a opção "Padrão de Impressão".
3. Ajuste o tamanho da bobina: selecione 56mm (para impressoras de 58mm como Bematech) ou 80mm.
4. Ajuste as margens conforme necessário (lateral, superior, inferior).
5. Ajuste o tamanho da fonte se necessário.
6. Clique em "Salvar".
7. Faça uma impressão de TESTE para validar a configuração.

PROBLEMA COMUM - TEXTO CORTADO NAS LATERAIS:
- Causa principal: a largura da bobina está configurada como 80mm mas a impressora usa 58mm.
- Solução: alterar a largura para 56mm no padrão de impressão.
- Se ainda cortar: aumentar a margem lateral em 1-2mm.
- Após salvar, SEMPRE fazer uma impressão de teste antes de validar.`,

    requiredPoints: [
      "Identificar que o problema é a largura da bobina configurada incorretamente (80mm vs 58mm)",
      "Instruir a acessar Ajustes > Geral > Impressão > Padrão de Impressão no App",
      "Orientar a alterar a largura da bobina para 56mm (compatível com impressoras de 58mm)",
      "Mencionar que as margens laterais podem ser ajustadas também se necessário",
      "Instruir a salvar e fazer uma impressão de TESTE para validar",
      "Acolher o problema dos motoboys não conseguirem ler os endereços"
    ],

    commonMistakes: [
      "Pedir para o cliente trocar de impressora sem tentar ajustar a configuração primeiro",
      "Não identificar que o problema é a largura da bobina (80mm vs 58mm)",
      "Ignorar a sugestão de fazer impressão de teste após ajustar",
      "Dar instruções para configuração no Painel Web quando a configuração de impressão é no App",
      "Não demonstrar empatia com a confusão dos motoboys"
    ],

    scoringCriteria: {
      resolution: "Nota máxima se identificar corretamente o problema (largura da bobina) e guiar pela configuração no App. -20 pontos se não indicar o caminho correto (Ajustes > Geral > Impressão).",
      empathy: "Reconhecer o transtorno prático (motoboys não leem, atrasa entregas). Acolher antes de instruir.",
      agility: "Diagnóstico e solução devem vir na 1ª ou 2ª mensagem. A configuração é simples e rápida.",
      professionalism: "Linguagem clara e passo a passo. Evitar jargões técnicos de impressora que o operador pode não conhecer."
    },

    relatedArticles: [
      "perguntas-frequentes/layout-de-impressao-como-ajustar-tamanho-da-fonte-margens-e-tamanho-da-bobina.md",
      "balancas-e-impressoras/balancas-e-impressoras.md"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CENÁRIO 5: Caixa - Dividir Pagamento no PDV
  // ═══════════════════════════════════════════════════════
  "dividir_pagamento": {
    title: "Caixa: Dividir Pagamento no PDV",
    scenarioMatch: "pagamento",

    technicalContent: `O PDV Yooga permite registrar múltiplas formas de pagamento na mesma venda (dividir a conta) em Mesa, Balcão e Delivery.

COMO DIVIDIR PAGAMENTO NO MÓDULO MESA E BALCÃO:
1. Na tela da venda, selecione a opção "Adicionar Pagamento".
2. Escolha a PRIMEIRA forma de pagamento (ex: Dinheiro).
3. Ajuste o VALOR correspondente ao montante que será pago por essa forma (ex: R$ 50,00).
4. Clique em "Adicionar Pagamento" novamente.
5. O sistema mostrará o SALDO DEVEDOR restante automaticamente.
6. Selecione a SEGUNDA forma de pagamento (ex: Pix) — o valor restante será alocado automaticamente.
7. Se quiser mais formas, ajuste o valor da segunda e adicione uma terceira.
8. Finalize a venda normalmente.

COMO DIVIDIR PAGAMENTO NO BALCÃO:
1. Clique em "Finalizar" na tela do pedido.
2. Escolha a primeira forma de pagamento e ajuste o valor parcial.
3. Selecione a segunda forma — o valor restante é alocado automaticamente.
4. Finalize.

NO DELIVERY:
- A divisão só pode ser feita na ETAPA DE FINALIZAÇÃO do pedido (não durante a criação).
- Clique em "Finalizar", ajuste o valor da primeira forma, clique em "Adicionar forma de pagamento" para a segunda.

DICAS IMPORTANTES:
- O caixa registrará cada forma de pagamento separadamente no fechamento.
- No relatório de caixa, cada forma aparece discriminada individualmente.
- Não há limite de quantas formas podem ser adicionadas na mesma venda.`,

    requiredPoints: [
      "Orientar a clicar em 'Adicionar Pagamento' ou 'Finalizar' na tela do pedido/venda",
      "Explicar que deve digitar o valor PARCIAL da primeira forma (não o total)",
      "Instruir a selecionar a forma de pagamento (Dinheiro) para a primeira parcela",
      "Mostrar que após adicionar a primeira, o saldo devedor restante aparece automaticamente",
      "Orientar a selecionar a segunda forma de pagamento (Pix) para o valor restante",
      "Confirmar que a venda pode ser finalizada normalmente após as duas formas registradas"
    ],

    commonMistakes: [
      "Dizer que o sistema não suporta múltiplas formas de pagamento",
      "Instruir a criar duas vendas separadas em vez de usar a função de dividir",
      "Não mencionar que o valor restante é calculado automaticamente",
      "Esquecer de explicar onde fica o botão 'Adicionar Pagamento'",
      "Confundir o fluxo do Balcão com o fluxo do Delivery (no Delivery só funciona na finalização)"
    ],

    scoringCriteria: {
      resolution: "Nota máxima se der o passo a passo completo: 1) Adicionar Pagamento, 2) valor parcial, 3) selecionar forma, 4) segunda forma para o restante. -20 pontos se faltar alguma etapa.",
      empathy: "O cliente está com clientes esperando no balcão. Demonstrar compreensão da pressa e dar instrução direta.",
      agility: "Cenário simples que deve ser resolvido em 1-2 mensagens no máximo.",
      professionalism: "Ser preciso com os nomes dos botões e campos do sistema. Usar a nomenclatura exata da Yooga."
    },

    relatedArticles: [
      "perguntas-frequentes/como-adicionar-duas-formas-de-pagamento-na-venda.md",
      "pdv-mesa-e-balcao/cadastro-de-formas-de-pagamento-no-pdv-mesas-e-balcao.md"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CENÁRIO 6: Segurança - Senha para Cancelamentos
  // ═══════════════════════════════════════════════════════
  "seguranca_cancelamento": {
    title: "Segurança: Senha para Cancelamentos",
    scenarioMatch: "segurança",

    technicalContent: `O sistema Yooga permite configurar controles de segurança por meio de senhas para cancelamento e permissões de usuário por cargo.

SENHA PARA CANCELAMENTO DE VENDA (VIA APP):
1. No App Yooga, acesse Ajustes > Geral.
2. Ative a função "Senha para cancelamento de venda".
3. Defina uma senha e clique em OK para salvar.
4. A partir deste momento, ao tentar cancelar qualquer venda, o sistema exigirá a senha.

QUANDO A SENHA SERÁ SOLICITADA:
- No Balcão: ao remover um item do carrinho ou ao clicar na lixeira para excluir a venda.
- No Delivery: ao tentar cancelar um pedido.
- Em vendas finalizadas: ao clicar em "Cancelar Venda" no histórico do app.

COMO ALTERAR A SENHA:
- Acesse Ajustes > Geral, clique sobre a função "Senha para cancelamento de vendas" mesmo já estando ativa.
- Defina a nova senha.

COMO DESATIVAR:
- Acesse Ajustes > Geral, clique na chavinha de "Senha para cancelamento de venda".
- Clique em "OK" na tela da nova senha SEM digitar nada no campo. A senha será desativada.

PERMISSÕES DE USUÁRIO POR CARGO (VIA PAINEL):
1. No Painel Administrativo, acesse Configurações > Usuários > Permissões.
2. Selecione o cargo do funcionário (Operador de Caixa, Gerente, etc.).
3. Desmarque as permissões que deseja bloquear (ex: "Permitir Cancelamento de Vendas").
4. A partir do bloqueio, o PDV exigirá a senha de um Administrador ou Gerente para concluir o cancelamento.
5. Os cancelamentos ficam registrados e auditados nos relatórios de justificativas financeiras.

PERSONALIZAR PERMISSÕES:
- É possível criar cargos personalizados com permissões granulares.
- Cada cargo define o que o usuário pode: abrir/fechar caixa, cancelar vendas, dar descontos, acessar relatórios, etc.
- A senha de ação sem permissão: quando um operador tenta fazer algo que não tem permissão, o sistema solicita a senha do gerente/admin para autorizar pontualmente.`,

    requiredPoints: [
      "Explicar como ativar a senha para cancelamento no App (Ajustes > Geral)",
      "Orientar sobre o sistema de Permissões de Usuários por cargo no Painel Administrativo",
      "Indicar que é possível desmarcar a permissão 'Permitir Cancelamento de Vendas' para o cargo de operador",
      "Explicar que após o bloqueio, o sistema exigirá senha de Administrador/Gerente para cancelar",
      "Mencionar que os cancelamentos ficam auditados/registrados nos relatórios",
      "Validar a preocupação legítima do gerente com a segurança financeira do caixa"
    ],

    commonMistakes: [
      "Sugerir apenas a senha do app sem mencionar as permissões por cargo (solução parcial)",
      "Não explicar a diferença entre senha no App e permissões no Painel",
      "Ignorar que os cancelamentos são auditados (ponto importante para o gerente)",
      "Não validar a preocupação do gerente com desvios (é uma suspeita séria)",
      "Dar apenas um dos dois caminhos (app OU painel) em vez de apresentar ambos"
    ],

    scoringCriteria: {
      resolution: "Nota máxima se apresentar AMBAS as soluções (senha no app + permissões por cargo no painel). -15 pontos se mencionar apenas uma. Bônus se mencionar a auditoria nos relatórios.",
      empathy: "O gerente está preocupado com desvio de caixa, que é um problema sério. O agente deve tratar com seriedade e confidencialidade, sem minimizar.",
      agility: "Pode demorar 3-4 mensagens pois o tema tem complexidade. Não penalizar por tempo se o conteúdo for rico.",
      professionalism: "Tom sério e profissional. Não fazer piadas sobre desvio de caixa. Transmitir segurança de que o sistema tem os controles necessários."
    },

    relatedArticles: [
      "perguntas-frequentes/senha-para-cancelamento-de-venda.md",
      "pdv-mesa-e-balcao/personalizar-permissoes-dos-usuarios.md",
      "pdv-mesa-e-balcao/acessos-disponiveis-para-cada-tipo-de-permissao-de-usuario.md",
      "pdv-mesa-e-balcao/senha-para-realizar-acao-sem-permissao-permissoes-de-usuarios.md"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // CENÁRIO 7: Chat no Delivery - Comunicação com Cliente
  // ═══════════════════════════════════════════════════════
  "delivery_chat": {
    title: "Delivery: Ativar o Chat de Pedidos",
    scenarioMatch: "chat no delivery",

    technicalContent: `A funcionalidade de chat no delivery permite que o estabelecimento se comunique diretamente com o cliente após o pedido ser feito, tudo dentro do sistema Yooga, dispensando o WhatsApp.

COMO ATIVAR:
1. No sistema/app Yooga, vá em Ajustes > Configurações.
2. Ative a opção "Habilitar chat" e salve.

COMO APARECE PARA O ESTABELECIMENTO:
- No painel de pedidos do delivery, ao clicar sobre um pedido em andamento, o operador verá a opção "Chat com o cliente".
- Basta clicar nela para iniciar a conversa em tempo real sobre aquele pedido específico.

COMO APARECE PARA O CLIENTE:
- Assim que o pedido é realizado no cardápio digital, o cliente verá o botão "Chat com a loja" na tela de acompanhamento e link de pedidos.
- O cliente poderá enviar mensagens, tirar dúvidas ou solicitar correções.`,

    requiredPoints: [
      "Confirmar que a Yooga possui a funcionalidade nativa de Chat no Delivery",
      "Orientar o caminho exato de ativação: Ajustes > Configurações > Habilitar chat",
      "Explicar que para o estabelecimento a opção 'Chat com o cliente' aparece ao clicar sobre o pedido no painel de delivery",
      "Explicar que para o cliente o botão 'Chat com a loja' fica disponível na tela/link de acompanhamento do pedido",
      "Mencionar que essa função é ideal para evitar o desvio para o WhatsApp e centralizar o suporte do restaurante"
    ],

    commonMistakes: [
      "Dizer que não é possível usar chat no delivery ou que precisa usar WhatsApp",
      "Fornecer um caminho incorreto de ativação no Painel Web (a ativação é em Ajustes > Configurações)",
      "Não explicar como a opção aparece para o cliente na tela de acompanhamento",
      "Não instruir sobre onde clicar no painel de pedidos (dentro do pedido específico)"
    ],

    scoringCriteria: {
      resolution: "Nota máxima se instruir a ativação em Ajustes > Configurações e detalhar as visualizações da loja (no pedido) e do cliente (no acompanhamento). -20 por ponto técnico faltante.",
      empathy: "Acolher a dor do cliente que está sobrecarregado tendo que gerenciar suporte e pedidos em canais separados como WhatsApp comercial.",
      agility: "Fornecer as instruções de ativação logo na primeira mensagem para agilizar o processo do cliente.",
      professionalism: "Ser extremamente claro ao descrever os botões exatos ('Chat com a loja' e 'Chat com o cliente') para evitar confusão."
    },

    relatedArticles: [
      "delivery/chat-no-delivery.md"
    ]
  }
};

/**
 * Encontra a base de conhecimento mais relevante para um cenário específico.
 * @param {string} scenarioTitle - Título do cenário de simulação.
 * @returns {Object|null} O objeto de conhecimento correspondente ou null.
 */
export function getKnowledgeForScenario(scenarioTitle) {
  if (!scenarioTitle) return null;
  
  const titleLower = scenarioTitle.toLowerCase();
  
  for (const [key, knowledge] of Object.entries(YOOGA_KNOWLEDGE_BASE)) {
    if (titleLower.includes(knowledge.scenarioMatch)) {
      return { key, ...knowledge };
    }
  }
  
  return null;
}

/**
 * Analisa a conversa e determina quais required points o agente já cobriu.
 * @param {Array} messages - Array de mensagens da conversa.
 * @param {string[]} requiredPoints - Lista de pontos obrigatórios.
 * @returns {{ covered: string[], missing: string[], coveragePercent: number }}
 */
export function analyzeAgentCoverage(messages, requiredPoints) {
  if (!messages || !requiredPoints) return { covered: [], missing: requiredPoints || [], coveragePercent: 0 };
  
  const agentMessages = messages
    .filter(m => m.sender === 'agent')
    .map(m => m.message.toLowerCase())
    .join(' ');
  
  const covered = [];
  const missing = [];
  
  // Palavras-chave de verificação para cada tipo de ponto
  const keywordChecks = {
    // Venda Offline
    "salvas no navegador": ["salv", "armazen", "guardad", "registrad", "navegador", "local"],
    "não fechar": ["não fech", "nao fech", "não fecha", "manter abert", "mantenha abert", "não saia"],
    "não limpar": ["não limp", "nao limp", "não apag", "não exclua", "cache", "histórico"],
    "sincronização": ["sincroniz", "automatic", "sync", "quando voltar", "internet retorn"],
    "dinheiro e cartão": ["dinheiro", "maquininha", "cartão físic", "espécie"],
    "estoque e financeiro": ["estoque", "financeiro", "atualiz"],
    // iFood
    "painel yooga": ["painel", "configurações", "integrações", "integraç"],
    "vinculados": ["vincul", "mape", "associa", "conecta"],
    "sincronizar cardápio": ["sincroniz", "atualiz", "cardápio"],
    "portal ifood": ["portal ifood", "ifood merchant", "direto no ifood"],
    // NFC-e
    "csc incorreto": ["csc", "código de segurança", "chave"],
    "homologação": ["homologação", "homologaç", "produção", "produç", "ambiente"],
    "contador": ["contador", "contabilidade", "contábil"],
    "certificado": ["certificado", "digital", "a1"],
    // Impressora
    "largura bobina": ["largura", "bobina", "58mm", "56mm", "80mm", "tamanho"],
    "ajustes impressão": ["ajustes", "geral", "impressão", "padrão"],
    "margem": ["margem", "lateral", "margin"],
    "impressão teste": ["teste", "testar", "imprimir"],
    // Pagamento
    "adicionar pagamento": ["adicionar pagamento", "adicionar forma", "pagar", "pagamento"],
    "valor parcial": ["parcial", "parte", "50", "valor"],
    "saldo devedor": ["restante", "saldo", "devedor", "sobra"],
    // Segurança
    "senha cancelamento": ["senha", "cancelamento", "cancel"],
    "permissões cargo": ["permiss", "cargo", "operador", "perfil"],
    "administrador gerente": ["administrador", "gerente", "admin", "supervisor"],
    "auditoria": ["audit", "relatório", "registrad", "histór", "log"],
    // Delivery Chat
    "nativa de chat": ["chat", "nativo", "funcionalidade", "recurso"],
    "caminho exato de ativação": ["ajustes", "configurações", "habilitar", "botão", "ativar"],
    "chat com o cliente": ["pedido", "clicar sobre", "estabelecimento", "verá a opção", "painel"],
    "chat com a loja": ["acompanhamento", "link", "tela", "cliente ver", "comprador"],
    "centralizar o suporte": ["evitar", "desvio", "whatsapp", "centralizar", "restaurante"]
  };
  
  for (const point of requiredPoints) {
    const pointLower = point.toLowerCase();
    
    // Verificação simples: a mensagem do agente contém palavras-chave relevantes
    let isCovered = false;
    
    for (const [checkKey, keywords] of Object.entries(keywordChecks)) {
      if (pointLower.includes(checkKey.split(' ')[0])) {
        isCovered = keywords.some(kw => agentMessages.includes(kw));
        if (isCovered) break;
      }
    }
    
    // Fallback: verificação genérica por palavras significativas do ponto
    if (!isCovered) {
      const significantWords = pointLower
        .split(/\s+/)
        .filter(w => w.length > 4 && !['sobre', 'quando', 'forma', 'entre', 'após', 'antes', 'deve', 'podem'].includes(w));
      
      isCovered = significantWords.some(word => agentMessages.includes(word));
    }
    
    if (isCovered) {
      covered.push(point);
    } else {
      missing.push(point);
    }
  }
  
  const coveragePercent = requiredPoints.length > 0 
    ? Math.round((covered.length / requiredPoints.length) * 100) 
    : 0;
  
  return { covered, missing, coveragePercent };
}
