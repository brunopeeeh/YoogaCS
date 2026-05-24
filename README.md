# 💻 Yooga CS Coach — Simulador de Atendimento e Portal de Capacitação

> [!NOTE]
> Esta é a central oficial de conhecimento, operação e engenharia do **Yooga CS Coach**, uma plataforma gamificada de ponta criada especificamente para o treinamento, capacitação técnica e auditoria de performance do time de **Customer Success (CS) / Suporte** da Yooga.

O **Yooga CS Coach** utiliza Inteligência Artificial e busca semântica em tempo real para recriar com precisão o dia a dia do analista de atendimento Yooga. A plataforma simula conversas com clientes baseando-se em perfis psicológicos realistas e utiliza artigos oficiais da nossa Central de Ajuda ([ajuda.yooga.com.br](https://ajuda.yooga.com.br)) para avaliar o conhecimento técnico e a aplicação dos nossos valores corporativos.

---

## 🎯 Objetivo e Visão Geral

O projeto foi concebido para capacitar de forma contínua a equipe de **15 analistas de CS da Yooga**. Através da gamificação prático-teórica, o sistema reduz o tempo médio de atendimento (TMA), homogeneíza as resoluções técnicas de problemas do dia a dia (fiscal, impressoras, delivery) e assegura que todo analista domine o tom de voz Yooga.

```
       JORNADA DO ANALISTA YOOGA CS
+------------------------------------------+
| 1. Estudo da Central de Ajuda (FAQ)      |
+------------------------------------------+
                     |
                     v
+------------------------------------------+
| 2. Quiz de Conhecimento Técnico          |
+------------------------------------------+
                     |
                     v
+------------------------------------------+
| 3. Simulador de Chat com IA Realista     |
+------------------------------------------+
                     |
                     v
+------------------------------------------+
| 4. Auditoria de Qualidade Pós-Chat       |
+------------------------------------------+
                     |
                     v
+------------------------------------------+
| 5. Emissão de Badges e Certificação      |
+------------------------------------------+
```

---

## 🌟 As 5 Regras de Ouro Yooga (Pilares de CS)

Toda a plataforma — do prompt da IA do cliente à nota final gerada pela Auditoria — é orientada pelos cinco pilares de excelência Yooga. Cada mensagem enviada pelo analista afeta diretamente estas métricas em tempo real:

1. 🕐 **Disponibilidade (Agilidade e Foco):** Agilidade nas respostas e prontidão em ajudar. Avalia se o analista mantém o cliente assistido sem deixá-lo no vácuo e se responde com velocidade e precisão.
2. 🚀 **Proatividade:** Capacidade de antecipar as próximas dúvidas do cliente, sugerir soluções alternativas ou planos de contingência (como instruir a não limpar dados em vendas offline) antes mesmo de serem solicitados.
3. 📖 **Conhecimento Técnico (Domínio do FAQ):** Aderência aos guias e manuais oficiais da Yooga. Exige a explicação correta de caminhos de menu, chaves fiscais (NFC-e), largura de bobinas (58mm/80mm) ou fluxos de integração.
4. ❤️ **Empatia:** Habilidade em reconhecer e validar as emoções do cliente, principalmente em horários de alta pressão operacional (casa cheia, fila no caixa, motoboys aguardando).
5. 🎭 **Humor Apropriado (Tom de Voz Descontraído):** O uso equilibrado e natural de emojis e mensagens calorosas que trazem a humanidade e descontração típicas da marca Yooga, quebrando a frieza do suporte de forma profissional.

---

##  JORNADA E GUIA PRÁTICO DO AGENTE DE SUPORTE

O painel de agentes oferece um ecossistema completo de desenvolvimento e autoavaliação contínua.

### 1. Trilhas de Aprendizado Interativas
As trilhas estruturam a base de conhecimento necessária para o suporte diário. Cada módulo conta com links diretos de artigos integrados à Central de Ajuda Yooga:
* **PDV & Operação de Caixa:** Abertura, fechamento, suprimento de caixa e operações offline.
* **Delivery & Integração iFood:** Como conectar contas parceiras, parear categorias, vincular produtos e forçar a sincronização de cardápios.
* **Fiscal: Emissão de Notas (NFC-e):** Parametrização tributária (NCM, CFOP, CSOSN), instalação de Certificado A1 na nuvem Yooga e tratativa de rejeições do SEFAZ (ex: código CSC inválido).

> [!TIP]
> **A dinâmica do Quiz:** Após ler o artigo técnico, o analista responde a um quiz com perguntas reais. Acertar todas as questões libera o acesso à simulação prática e concede as **Badges de Especialista** no perfil do agente.

---

### 2. O Simulador de Chat Hiper-Realista
O coração da plataforma é um ambiente de chat que replica as principais ferramentas de Helpdesk do mercado. Ao iniciar um cenário, a IA assume o papel do cliente seguindo regras dinâmicas:

#### A. Perfis Psicológicos do Cliente
Cada simulação seleciona ou cria um perfil com tom de voz exclusivo, forçando o operador a adaptar sua abordagem:
* **Irritado:** Fala de forma ríspida, usa caixa alta ("URGENTE", "INADMISSÍVEL") e reclama do tempo de resposta. Exige altíssima empatia e controle emocional do analista.
* **Confuso:** Tem dificuldades com informática. Não entende termos técnicos comuns e requer explicações extremamente didáticas, passo a passo, sem jargões.
* **Objetivo:** Vai direto ao ponto. Prefere respostas curtas, precisas e pragmáticas, sem enrolação.
* **Indeciso:** Hesita em seguir os passos sugeridos ou em tomar decisões técnicas. Precisa de direcionamento proativo e segurança do atendente.
* **Emotivo:** Expressa afeto ou ansiedade de forma intensa. Responde muito bem a emojis e palavras calorosas.
* **Impaciente:** Pressiona constantemente pelo próximo passo e quer que o problema seja resolvido "para ontem".
* **Detalhista:** Faz perguntas técnicas minuciosas sobre cada passo do sistema operacional, querendo entender a causa raiz.

#### B. Contextualização Sazonal e Pressão Operacional
O motor de IA calcula a urgência do cliente com base no horário. Se a simulação ocorrer próxima a **horários de pico de alimentação** (ex: das 11h30 às 13h30 ou 19h00 às 21h30) ou finais de semana, a urgência é amplificada nos diálogos da IA, que simula o desespero de ter um salão cheio de clientes esperando.

---

### 3. O Coach de IA Pedagógico
Se o analista se sentir travado durante uma simulação complexa, ele pode invocar o **Coach de IA** clicando em "Pedir ajuda ao Coach" (disponível no máximo **2 vezes por simulação**):
* O Coach realiza uma busca semântica em frações de segundo na base de FAQ e analisa o histórico de mensagens trocadas.
* Sugere a resposta redigida perfeitamente alinhada às Regras de Ouro da Yooga.
* **O diferencial:** O Coach apresenta uma **Justificativa Pedagógica** detalhando por que aquela resposta é ideal (ex: *"Esta resposta acalma o tom com empatia, instrui o caminho exato de menu e antecipa a proatividade instruindo sobre a contingência offline"*).

> [!WARNING]
> Solicitar a ajuda do Coach de IA aplica uma penalidade controlada sobre a pontuação final da simulação, estimulando a autoconfiança do analista antes de pedir ajuda.

---

### 4. A Auditoria de Qualidade Pós-Atendimento
Ao atingir a resolução ou o limite de interações, o chat é encerrado e a simulação é submetida ao **Auditor de Qualidade Sênior Yooga (IA)**. O auditor processa a transcrição e retorna:
* **Pontuação Consolidada (0 a 100):** Média ponderada com base no desempenho global.
* **Métricas Individuais por Pilar:** Gráficos detalhando as notas exatas de *Disponibilidade, Proatividade, Conhecimento Técnico, Empatia e Humor*.
* **Feedback Construtivo:** Lista detalhada com os exatos pontos fortes demonstrados pelo operador e sugestões claras com o que melhorar nas próximas interações.
* **Prescrição de Estudos (Trilha Recomendada):** Com base nas fraquezas detectadas (ex: nota baixa em Conhecimento Técnico Fiscal), a IA indica artigos específicos do FAQ para o analista reler e reforçar seu aprendizado.

---

## 👑 GUIA DO ADMINISTRADOR E LÍDER DE CS

Os líderes e gestores de Customer Success contam com ferramentas de auditoria e gestão da equipe de forma centralizada.

### 1. Dashboard de Métricas de Performance
O Painel Administrativo fornece uma visão em tempo real da evolução coletiva dos **15 analistas de CS**:
* **KPIs Consolidados:** Total de simulações realizadas, número de badges e certificados emitidos na semana, média geral das notas de auditoria e taxa média de acionamento do Coach de IA.
* **Desempenho por Pilar:** Gráficos interativos (`recharts`) que identificam qual pilar é o calcanhar de Aquiles da equipe (ex: se a proatividade geral está baixa, sugerindo a necessidade de um workshop de processos).
* **Rankings de Conquistas:** Visualização dos agentes que mais concluíram trilhas de estudo e suas respectivas badges.

### 2. Cadastro e Vetorização de Cenários Customizados
Os gestores podem simular problemas reais recentes ocorridos no suporte criando cenários personalizados:
1. Acesse o menu **"Cenários de Teste"** no painel do administrador.
2. Defina o **Título**, **Problema Inicial** (como o cliente inicia o chat), **Cargo/Perfil do Cliente**, **Nível de Dificuldade** e as **Metas de Resolução** (objetivos específicos que o analista é obrigado a cumprir).
3. Ao salvar, o sistema processa o cenário no banco de dados local. Ele fica imediatamente disponível para toda a equipe treinar.

---

### 3. Emissão de Relatórios Executivos em PDF
Utilizando a montagem programática de alta fidelidade da biblioteca `jspdf`, o administrador pode exportar relatórios formatados para impressão em apenas um clique:

#### A. Relatório Consolidado Gerencial
* Destinado a reuniões executivas e diretoria.
* Traz gráficos agregados de performance, dados estatísticos de acerto em quizzes, badges mais raras e evolução temporal das notas de suporte do time Yooga.

#### B. Feedback de Auditoria Individual (1:1)
* Ideal para o líder de CS aplicar feedbacks individuais periódicos.
* Consolida todo o histórico de um analista específico:
  * Desempenho geral comparado à média da equipe.
  * Pontuação média por Pilar Yooga.
  * Histórico de simulações com observações detalhadas de pontos fortes e pontos fracos apontados pelo auditor de IA.
  * Recomendações de plano de desenvolvimento individual (PDI).

---

## 🛠️ ARQUITETURA TÉCNICA E ENGENHARIA

O **Yooga CS Coach** foi desenvolvido sob premissas rigorosas de agilidade, modularidade e resiliência, garantindo que o sistema funcione com excelência mesmo em cenários de contingência.

### 1. Stack Tecnológica de Alta Performance
* **Framework Principal:** React + Vite, permitindo compilações e atualizações em frações de segundo (`HMR`).
* **Design System & Estética Premium:** CSS Vanilla puro + Tailwind CSS v3 e Tailwind-Animate para transições fluidas. Componentes acessíveis montados sobre as primitivas do **Radix UI** (Accordion, Dialog, Tabs, Dropdown) e ícones vetorizados consistentes do **Lucide React**.
* **Micro-animações:** Framer Motion fornecendo feedbacks táteis sutis nas interações do simulador de chat e carregamentos de IA.
* **Geração de PDF:** `jspdf` parametrizado programaticamente no lado do cliente (zero consumo de servidores).

---

### 2. Arquitetura de Dados Local-First (Supabase Ready)
O sistema opera integralmente sob o paradigma **Local-First**, armazenando dados relacionais no `localStorage` e `sessionStorage` do navegador através de uma modelagem reativa localizada em `src/entities/all.js` e `src/entities/Knowledge.js`:
* **Abstração Relacional (`createEntity`):** Implementa funções assíncronas padrão de bancos relacionais (`list`, `filter`, `get`, `create`, `update`, `delete`).
* **Sincronização de Sessão:** O usuário ativo é gerenciado na sessão do navegador (`sessionStorage`), simulando tokens de autenticação reais.
* **Preparação para Supabase:** A estrutura modular e a nomenclatura das entidades (`User`, `Scenario`, `Simulation`, `AgentPerformance`) foram desenhadas de forma a permitir que a migração para tabelas reais do **Supabase** seja feita apenas reescrevendo o arquivo do cliente (`base44Client.js` ou as próprias funções das entidades), mantendo 100% da lógica dos componentes de interface intacta.

---

### 3. Motor de IA & Resiliência (Cadeia de Rotação de Modelos)
A comunicação com o LLM é centralizada em `src/integrations/Core.js`. Para contornar os estritos limites de cota gratuita (erros `429 Too Many Requests`) comuns no Free Tier da API do Gemini, o sistema implementa uma **cadeia de rotação dinâmica de modelos de contingência**:

```
                  REQUISIÇÃO DO SIMULADOR / AUDITORIA / COACH
                                       |
                                       v
                     +-----------------------------------+
                     | Tentativa 1: gemini-2.5-flash     |
                     +-----------------------------------+
                                       |
                     +-----------------+-----------------+
                     | (Sucesso)       | (Erro 429 / 404)
                     v                 v
                 [Retorna]   +-----------------------------------+
                             | Tentativa 2: gemini-2.0-flash     |
                             +-----------------------------------+
                                       |
                     +-----------------+-----------------+
                     | (Sucesso)       | (Erro 429 / 404)
                     v                 v
                 [Retorna]   +-----------------------------------+
                             | Tentativa 3: gemini-2.0-flash-lite|
                             +-----------------------------------+
                                       |
                     +-----------------+-----------------+
                     | (Sucesso)       | (Erro 429 / 404)
                     v                 v
                 [Retorna]   +-----------------------------------+
                             | Tentativa 4: gemini-2.5-flash-lite|
                             +-----------------------------------+
                                       |
                     +-----------------+-----------------+
                     | (Sucesso)       | (Erro 429 / 404)
                     v                 v
                 [Retorna]   +-----------------------------------+
                             | Fallback Determinístico Local     |
                             +-----------------------------------+
```

Cada modelo possui sua própria cota independente no console do Google Cloud, garantindo que o simulador permaneça no ar mesmo em picos extremos de acessos coletivos da equipe Yooga.

---

### 4. Motor RAG Local-First e Busca Semântica
Para fornecer o contexto técnico correto do FAQ ao Coach de IA e à IA do cliente, o sistema implementa um pipeline **RAG (Retrieval-Augmented Generation)** inteiramente no lado do cliente:

#### A. O Algoritmo de Vetorização Determinístico Offline
Caso a internet sofra oscilações ou a chave da API do Gemini não esteja configurada, o motor executa um algoritmo matemático determinístico em JavaScript puro para gerar embeddings de 768 dimensões com base no texto inserido:
```javascript
function generateDeterministicVector(text) {
  const vector = [];
  const dim = 768;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (text.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  }
  for (let d = 0; d < dim; d++) {
    vector.push(Math.sin(hash + d) * 0.1);
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}
```
Esse vetor normalizado permite o cálculo exato do **produto escalar (similaridade cosseno)** contra a nossa base de dados indexada.

#### B. Boosting Semântico por Palavras-Chave
Para garantir que problemas altamente recorrentes (como *contingência offline*, *largura de bobina*, *código CSC inválido*, *taxa de entrega por distância*) tragam o artigo do FAQ com precisão cirúrgica, o motor avalia o texto do prompt e adiciona pesos multiplicadores de similaridade (+0.08 para título e +0.03 para conteúdo) ao detectar palavras-chave críticas.

#### C. Ingestão e Vetorização Automatizada (scripts/)
A plataforma inclui scripts utilitários robustos em NodeJS na pasta `scripts/` para gerenciar a base de dados:
* `ingest-faq.js`: Lê os artigos estendidos configurados e realiza a chamada de embeddings oficial (`text-embedding-004`) na API do Gemini, compilando e salvando a base vetorial em `src/data/faq-embeddings.json` (36MB).
* `scrape-and-ingest.js` / `scrape-faq-to-md.mjs`: Automatizam raspagens adicionais e atualizações de páginas na central de ajuda.

---

## ⚙️ CONFIGURAÇÃO E INSTALAÇÃO RÁPIDA

Siga o passo a passo para colocar a plataforma Yooga CS Coach em funcionamento na sua máquina local:

### 1. Pré-requisitos
Certifique-se de possuir o **Node.js** (versão 18 ou superior) instalado em sua máquina.

### 2. Configuração de Variáveis de Ambiente
Na raiz do projeto, você encontrará o arquivo `.env` para gerenciar a chave de IA. Certifique-se de que ele possui a estrutura abaixo preenchida:
```env
# Chave da API do Google Gemini (Obtenha gratuitamente em: https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY="SUA_CHAVE_API_AQUI"
```

*Nota: Se a chave estiver ausente ou inválida, o sistema ativará automaticamente os fallbacks matemáticos e as respostas locais simuladas baseadas em RAG sem interromper o fluxo de navegação.*

### 3. Execução Local
Navegue até o diretório do projeto e execute os comandos no terminal:

```bash
# Instalar dependências de ponta do ecossistema React/Tailwind
npm install

# Iniciar o servidor de desenvolvimento ultraveloz do Vite
npm run dev
```

Abra o seu navegador no endereço retornado (geralmente [http://localhost:5173/](http://localhost:5173/)).

---

## 🔑 CREDENCIAIS DE TESTE PADRÃO

Para validar os dois fluxos de experiência da plataforma (Agente e Administrador), utilize as credenciais pré-configuradas no banco reativo local:

### 👨‍💼 Perfil do Administrador (Líder de CS)
* **E-mail:** `bruno.oliveira@yooga.com.br` (ou `admin@yooga.com.br`)
* **Senha:** `123456` (ou `admin123`)
* **Permissões:** *Visualizar métricas agregadas da equipe inteira, auditar analistas individualmente, cadastrar novos cenários no simulador e exportar relatórios executivos em PDF.*

### 🧑‍💻 Perfil do Agente (Analista de Atendimento)
* **E-mail:** `mariana.silva@yooga.com.br` (ou `pedro.oliveira@yooga.com.br`)
* **Senha:** `user123`
* **Permissões:** *Estudar os artigos técnicos do FAQ, realizar Quizzes de teste, obter Badges e Certificações, treinar interativamente com clientes virtuais, solicitar auxílio pedagógico ao Coach de IA e consultar feedbacks da auditoria pós-chat.*

---

## 🎨 Princípios do Design System
A identidade visual do Yooga CS Coach foi desenvolvida para se integrar perfeitamente à proposta estética corporativa da Yooga:
* **Paleta Cromática:** Gradientes profundos de azuis e cinzas elegantes de altíssimo contraste (acessibilidade AAA), abolindo padrões clichês e tons de roxo/violeta não corporativos.
* **Componentização Premium:** Bordas sutilmente arredondadas (`rounded-xl` e `rounded-2xl`), contrastes suaves de vidro fosco (glassmorphism) e interfaces móveis responsivas focadas na agilidade do operador.
* **Feedbacks Dinâmicos:** Estados visuais claros para botões de carregamento e ações de IA, garantindo que o atendente entenda o andamento de cada requisição.
