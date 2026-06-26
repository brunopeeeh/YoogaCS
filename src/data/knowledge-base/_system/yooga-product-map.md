---
title: "Mapa do Sistema Yooga — Documento Mãe"
category: "Sistema"
source: "https://saibamais.yooga.com.br/"
doc_type: "core_context"
audience: "ia_interna"
priority: "always_inject"
---

# Mapa do Sistema Yooga — Documento Mãe

> Documento de referência obrigatória para a IA entender **o que é a Yooga**, **como o produto se organiza** e **onde buscar informação** antes de simular clientes, orientar agentes ou auditar atendimentos.
>
> **Referência comercial (visão de produto):** [saibamais.yooga.com.br](https://saibamais.yooga.com.br/)  
> **Referência oficial para respostas de agente CS:** [yooga.com.br/wiki](https://yooga.com.br/wiki)  
> **Base técnica interna (procedimentos detalhados):** arquivos `.md` em `src/data/knowledge-base/`  
> **Central de Ajuda pública (cliente final):** [ajuda.yooga.com.br](https://ajuda.yooga.com.br)

---

## 1. O que é a Yooga

A **Yooga** é um **sistema de gestão e delivery** para **bares, restaurantes e demais negócios de food service**. Um único ecossistema conecta operação de salão, balcão, delivery, pagamentos, relatórios e fiscal — reduzindo retrabalho, erros de caixa e dependência de planilhas ou de marketplaces.

**Proposta de valor (visão superficial):**
- Gestão suave: salão + delivery + financeiro integrados
- Mais de 7.000 restaurantes na base; suporte 24h; migração e setup ágeis
- Reduz caos em horário de pico, centraliza pedidos e dá visibilidade de lucro (CMV, DRE, fluxo de caixa)
- Canal próprio de delivery (cardápio digital, WhatsApp) sem depender só de taxas de marketplace
- Conciliação automática de PIX, cartão e voucher; fechamento de caixa mais rápido

**Segmentos atendidos (exemplos):** restaurante, bar, hamburgueria, pizzaria, padaria, açaiteria, cafeteria, lanchonete, marmitaria, dark kitchen, franquias, distribuidoras e similares.

**O que a Yooga NÃO é:** não é apenas um PDV isolado, nem só um app de delivery, nem um ERP genérico. É uma plataforma **especializada em food service** com módulos que conversam entre si.

---

## 2. Os cinco módulos do produto

Conforme a estrutura comercial Yooga ([saibamais.yooga.com.br](https://saibamais.yooga.com.br/)):

| Módulo | Função principal | Exemplos de capacidades |
|--------|------------------|-------------------------|
| **PDV e Mesas** | Operação presencial no salão e balcão | Gestão de mesas, garçom digital, totem, KDS (cozinha), balcão, Smart POS |
| **Delivery** | Vendas online e entrega | Cardápio digital, chatbot WhatsApp, integração marketplace (ex.: iFood), app de motoboys, gestão de pedidos |
| **Pagamentos Online** | Recebimento integrado | PIX automático, Apple Pay, Google Pay, Smart POS, painel de pagamentos (Yooga Pay) |
| **Relatórios** | Visão gerencial do negócio | Insights Maia (IA), fluxo de caixa, DRE gerencial, matriz de clientes, desempenho por canal |
| **Fiscal** | Conformidade tributária | NFC-e automática, NF-e, área do contador, relatórios fiscais |

**Princípio:** os módulos funcionam **conectados**. Um pedido de delivery pode cair no KDS; uma venda no balcão alimenta estoque e financeiro; a emissão fiscal segue a operação comercial.

---

## 3. Superfícies do sistema (onde o cliente opera)

Use estes nomes de forma consistente ao orientar clientes:

| Superfície | Quem usa | Para quê |
|------------|----------|----------|
| **Painel Yooga** / **Painel Administrativo** | Dono, gerente, contador | Configurações, cardápio, integrações, relatórios, fiscal, usuários, delivery |
| **PDV** / **Caixa** | Operador de caixa, atendente | Vendas no balcão, mesas, fechamento de caixa, contingência offline |
| **Gerenciador de pedidos** | Cozinha, expedição, delivery | Acompanhar e preparar pedidos (salão + delivery + integrações) |
| **App Yooga** | Dono/gestor mobile | Acompanhamento e operação em movimento |
| **Cardápio digital** | Cliente final | Pedidos online pelo canal próprio do restaurante |
| **Área do contador** | Contabilidade | Documentos e parametrizações fiscais |

**Glossário rápido:**
- **Gerenciador** = tela de gestão de pedidos em tempo real (não confundir com o Painel administrativo completo)
- **Modo offline / contingência** = vendas salvas localmente no navegador quando a internet cai; sincronização automática ao voltar a conexão
- **Yooga Pay** = módulo de pagamentos digitais integrados (PIX online, conciliação)
- **NFC-e** = cupom fiscal eletrônico no varejo; **NF-e** = nota fiscal de produto/saída conforme regras do cliente
- **Marketplace** = canal externo (ex.: iFood); integração centraliza pedidos no Yooga

---

## 4. Casos de uso operacionais

| Modelo | Descrição |
|--------|-----------|
| **Salão e Balcão** | Mesas, comandas, garçom, KDS, fechamento no caixa |
| **Delivery** | Cardápio próprio, motoboys, retirada, integrações |
| **Salão + Delivery** | Operação completa unificada |
| **Autoatendimento** | Totem e pedido autônomo |

**Dores típicas do cliente Yooga (contexto emocional do suporte):**
- Pico de movimento (almoço/jantar/fim de semana) com fila, pedidos perdidos ou impressora travada
- Internet instável durante operação (medo de perder vendas)
- Divergência de preço ou pedido entre Yooga e iFood
- Rejeição de nota fiscal (CSC, certificado, SEFAZ)
- Impressora (bobina 58mm/80mm, margens, fila de impressão)
- Dúvidas de pagamento (dividir conta, PIX, estorno, cancelamento)

---

## 5. Hierarquia de fontes de conhecimento

A IA deve respeitar esta ordem ao formular respostas **para o agente de CS** (não para o cliente simulado):

### 5.1 Respostas de agente (prioridade máxima)
**Fonte canônica:** [yooga.com.br/wiki](https://yooga.com.br/wiki)

- Procedimentos oficiais, caminhos de menu, políticas internas e fluxos de escalonamento
- Se houver conflito entre fontes, **a Wiki prevalece** para orientação ao agente
- Ao sugerir passos técnicos, cite caminhos compatíveis com a Wiki (ex.: *Painel → Configurações → Integrações → iFood*)

### 5.2 Entendimento interno e detalhe técnico
**Fonte:** arquivos `.md` em `src/data/knowledge-base/` (indexados no RAG / Supabase)

Use para aprofundar contexto, particularidades por estado, hardware, erros recorrentes e tom de voz interno.

### 5.3 Visão de produto e posicionamento
**Fonte:** [saibamais.yooga.com.br](https://saibamais.yooga.com.br/) e este documento

Use para explicar **o que a Yooga faz** e **por que existe**, não para passo a passo operacional.

### 5.4 Material para o cliente final (público)
**Fonte:** [ajuda.yooga.com.br](https://ajuda.yooga.com.br)

Artigos da Central de Ajuda podem ser **compartilhados com o cliente** quando apropriado. Muitos `.md` internos foram derivados dessa base.

### 5.5 Conhecimento estruturado por cenário (simulador)
**Fonte:** `src/data/yooga-knowledge-base.js`

Checklists, erros comuns e critérios de auditoria por tipo de simulação (offline, iFood, fiscal, etc.).

---

## 6. Mapa da base interna (`knowledge-base/`)

| Pasta | Tema | Quando consultar |
|-------|------|------------------|
| `pdv-mesa-e-balcao/` | Caixa, mesas, balcão, abertura/fechamento, histórico | Operação presencial, vendas offline, suprimento |
| `delivery/` | Cardápio, horários, motoboys, retirada, chat | Delivery próprio, configuração de loja online |
| `integracoes/` | iFood e parceiros | Sincronização, vínculo de produtos, pedidos integrados |
| `fiscal/` | NFC-e, NF-e, certificado, SEFAZ | Emissão, rejeições, parametrização tributária |
| `yooga-pay/` | Pagamentos digitais Yooga | PIX online, conciliação, estornos |
| `painel-de-relatorios/` | Relatórios, DRE, financeiro | Dúvidas gerenciais e de fechamento |
| `balancas-e-impressoras/` | Hardware | Impressoras, bobinas, margens, balanças |
| `planos-e-precos/` | Planos e contratação | Clube Yooga, funcionalidades por plano |
| `perguntas-frequentes/` | Transversal | Tom de voz, estados (SEFAZ), erros específicos, edge cases |
| `_system/` | Meta-documentação | Este mapa e regras globais da IA |

**Artigos críticos para CS (referência cruzada):**
- `perguntas-frequentes/tom-de-voz.md` — como falar com cliente em situações adversas
- `perguntas-frequentes/particularidades-de-cada-estado.md` — regras fiscais por UF
- `perguntas-frequentes/layout-de-impressao-*.md` — bobina e margens

---

## 7. As 5 Regras de Ouro Yooga (pilares de CS)

Toda interação simulada ou auditada deve alinhar-se a:

1. **Disponibilidade** — agilidade, sem deixar o cliente no vácuo
2. **Proatividade** — antecipar dúvidas e contingências (ex.: não limpar dados offline)
3. **Conhecimento técnico** — aderência à Wiki e aos procedimentos oficiais
4. **Empatia** — validar pressão operacional (salão cheio, motoboy esperando)
5. **Humor apropriado** — tom Yooga: humano, descontraído, profissional; emojis com equilíbrio

---

## 8. Regras de comportamento da IA neste projeto

### Ao simular o **cliente** (role-play)
- É dono/operador de restaurante, **não é TI**
- Conhece o problema, não a solução técnica
- Reage conforme perfil psicológico (irritado, confuso, objetivo, etc.)
- Só “aceita” a solução quando o agente repassar passos alinhados ao FAQ/Wiki
- Em horário de pico, demonstra mais urgência

### Ao atuar como **Coach** (sugerir resposta ao agente)
- Basear a sugestão na **Wiki** + contexto RAG recuperado
- Explicar **por que** a resposta cumpre os 5 pilares
- Usar linguagem que o agente possa copiar e enviar ao cliente
- Passos de menu em ordem lógica, sem jargão de desenvolvedor

### Ao atuar como **Auditor**
- Avaliar aderência técnica aos procedimentos oficiais
- Penalizar orientações perigosas (ex.: pedir para limpar cache offline)
- Separar elogios (`strengths`) de críticas (`improvements`)

### O que a IA **não deve** fazer
- Inventar funcionalidades que não existem na Yooga
- Prometer prazos ou valores comerciais não documentados
- Substituir escalonamento humano (Sup3/Tech) em casos de estorno, fiscal crítico ou cliente exaltado
- Confundir Painel, PDV e Gerenciador nas instruções

---

## 9. Fluxos operacionais resumidos

### Venda no balcão (happy path)
1. Operador abre o caixa no PDV  
2. Registra produtos (balcão ou mesa)  
3. Aplica forma de pagamento (dinheiro, cartão maquininha, PIX conforme configuração)  
4. Emite NFC-e se configurado  
5. Fecha o caixa e confere no Painel/relatórios  

### Pedido delivery integrado (happy path)
1. Pedido entra via cardápio próprio ou marketplace integrado  
2. Aparece no gerenciador com alerta sonoro  
3. Cozinha prepara (KDS se habilitado)  
4. Expedição/motoboy conclui entrega  
5. Pagamento e fiscal seguem regras da loja  

### Contingência offline
1. Internet cai → sistema sinaliza modo offline  
2. Vendas em dinheiro/cartão físico continuam; dados ficam no navegador  
3. **Não** fechar aba/app nem limpar dados do navegador  
4. Ao voltar a internet → sincronização automática  

### Integração iFood (visão geral)
1. Conectar conta no Painel (Integrações → iFood)  
2. Vincular categorias e produtos  
3. Ativar integração; pedidos caem no gerenciador Yooga  
4. Divergência de preço → revisar vínculo e sincronização no Painel  

---

## 10. Escalonamento e limites do suporte de 1º nível

Orientações internas frequentes (detalhes em `perguntas-frequentes/tom-de-voz.md` e Wiki):

| Situação | Ação típica do agente |
|----------|------------------------|
| Estorno PIX/cartão dentro de 1h do cancelamento | Explicar prazo bancário automático; transmitir segurança |
| Cliente exaltado após procedimento padrão | Pausar, alinhar com supervisor; possível **Sup3** / Tech |
| Rejeição fiscal persistente (SEFAZ) | Validar CSC, certificado, parametrização; escalar se necessário |
| Bug não reproduzível / dado perdido offline por limpeza de cache | Registrar com empatia; escalar — **não culpar o cliente** |

---

## 11. Como este documento se integra ao RAG

- **Categoria sugerida no ingest:** `Sistema` ou `core_context`
- **Uso:** injetar **sempre** no `system_instruction` (cliente simulado, coach, auditor) — não depender só de busca semântica por mensagem
- **Complemento:** o RAG traz 2–3 artigos específicos por turno; este documento fornece o **mapa mental** do produto

---

*Última atualização conceitual: baseada em [saibamais.yooga.com.br](https://saibamais.yooga.com.br/), estrutura interna `knowledge-base/` e diretriz de Wiki [yooga.com.br/wiki](https://yooga.com.br/wiki) para respostas de agente.*
