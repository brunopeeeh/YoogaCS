# 📊 Resumo Executivo: Yooga CS Coach

> **Documento de Apresentação Gerencial**
> Projeto: Simulador de Atendimento e Portal de Capacitação

---

## 🎯 1. Visão Geral do Projeto

O **Yooga CS Coach** é uma plataforma gamificada de ponta criada com Inteligência Artificial para o treinamento, capacitação técnica e auditoria de performance do time de **Customer Success (CS)** da Yooga.

O objetivo do sistema é reduzir o tempo de rampa de novos colaboradores, diminuir o Tempo Médio de Atendimento (TMA) e padronizar o tom de voz e a qualidade técnica dos analistas (homogeneizando as tratativas de fiscal, impressoras e delivery).

---

## 🚀 2. Entregas Realizadas (O que já está funcionando)

A plataforma conta com um ecossistema completo de desenvolvimento prático e teórico:

*   **Trilhas de Aprendizado Interativas e Quizzes:** Módulos de estudo conectados à Central de Ajuda (PDV, Delivery, Fiscal). O analista lê o artigo e realiza um teste de conhecimento para liberar as simulações e ganhar *Badges* de especialista.
*   **Simulador de Chat Hiper-Realista (IA):** Um ambiente que simula ferramentas de Helpdesk. A IA assume o papel do cliente com diversos **perfis psicológicos** (irritado, confuso, objetivo, emotivo) e injeta pressão operacional (simulando horários de pico e restaurante cheio).
*   **Coach Pedagógico de IA:** Durante a simulação, se o analista travar, ele pode acionar o "Coach" (usando busca semântica no FAQ). O Coach não só sugere a resposta ideal, mas explica *o porquê* pedagógico, baseando-se nas regras da empresa.
*   **Auditor de Qualidade Pós-Chat:** Ao fim do atendimento, o "Auditor Sênior (IA)" analisa toda a conversa e gera uma nota de 0 a 100, avaliando o analista em 5 pilares (Disponibilidade, Proatividade, Conhecimento Técnico, Empatia e Humor), com feedbacks construtivos claros.
*   **Dashboard Gerencial para Liderança:** Painel onde o Líder de CS acompanha as métricas da equipe, identifica quais pilares precisam de treinamento e consegue criar **Cenários Customizados** (ex: simular um problema de integração do iFood que ocorreu ontem).

---

## 🧠 3. Os 5 Pilares de Excelência (Regras de Ouro)

Toda a plataforma, da simulação à nota final, é orientada e audita os analistas em cinco métricas essenciais da cultura Yooga:
1.  **Disponibilidade:** Agilidade nas respostas e foco no cliente.
2.  **Proatividade:** Antecipar soluções (ex: orientar contingência offline).
3.  **Conhecimento Técnico:** Domínio total do sistema operacional e dos manuais.
4.  **Empatia:** Capacidade de acalmar e entender o lado do dono de restaurante em momentos de pressão.
5.  **Humor Apropriado:** Uso equilibrado do tom de voz humano, caloroso e descontraído padrão Yooga.

---

## 💻 4. Tecnologia e Engenharia

A arquitetura do sistema foi projetada para alta resiliência e performance sem gerar custos desnecessários:

*   **Motor RAG e Busca Semântica Local:** Todo o processamento de busca em artigos ocorre em tempo real, utilizando vetorização inteligente sem depender excessivamente de chamadas de nuvem pesadas.
*   **Cadeia de IA Anti-Queda (Resiliência):** O sistema tem uma hierarquia de modelos de IA (Gemini 2.5 Flash, 2.0 Flash Lite, etc). Se um modelo cair ou atingir limite de requisições, o sistema pula automaticamente para o próximo de forma invisível para o usuário.
*   **Exportação PDF Programática:** Geração de relatórios executivos direto do navegador do gestor em um clique.
*   **Frontend Premium:** Desenvolvido com React, Vite e Tailwind, oferecendo uma experiência de *SaaS Premium*, rápida e acessível.

---

**Conclusão:** O **Yooga CS Coach** transforma o treinamento da equipe de um modelo passivo e teórico para um formato de simulação de alta pressão, guiado por dados. Ele permite à liderança monitorar o crescimento dos analistas e garante que todos entreguem a excelência que a marca exige.
