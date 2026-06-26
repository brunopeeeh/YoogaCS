---
title: "RJ - Fundo FCP"
category: "Perguntas Frequentes"
source: "https://www.notion.so/RJ-Fundo-FCP-24300ee50e908192b8bced604e3299fa"
scraped_at: "2026-05-22T10:52:37.217Z"
---

# RJ - Fundo FCP

> [!NOTE]
> _**“…Art. 16-F. O contribuinte substituído varejista, inclusive o optante pelo Simples Nacional, ao realizar saída a consumidor final de mercadoria cujo imposto tenha sido retido anteriormente por substituição tributária, deverá preencher obrigatoriamente os campos vBCEfet (N35), pICMSEfet (N36) e vICMSEfet (N37) na NFC-e e na NF-e, utilizando-se, para o cálculo, as alíquotas internas fixadas no artigo 14 da Lei nº 2.657/96, acrescidas do adicional relativo ao Fundo de Combate à Pobreza e às Desigualdades Sociais (FECP), instituído pela Lei nº 4.056/02.

Parágrafo único. Na hipótese de haver redução de base de cálculo concedida em caráter geral, independentemente de termo de acordo ou da prática de ato administrativo de enquadramento do contribuinte relativamente à operação, deverá ser utilizada essa alíquota no campo pICMSEfet (N36) e preenchido o campo pRedBCEfet (N34)….”**_

Resolução que obriga o preenchimento das informações de ICMS Retido e ICMS Efetivo na **NFCE e NFe** para os contribuintes substituídos no RJ.


**ICMS Retido** - Quando o ICSM é pago antecipadamente, de uma vez só, antes da empresa que comprou o produto revendê-lo.

**ICMS Efetivo** - O ICMS Efetivo é o total do imposto cobrado quando vendemos algo diretamente para o consumidor final. Também conta quando não há imposto ou é isento, incluindo o valor adicional. E se houver substituição tributária ou cobrança antecipada em operações interestaduais, isso também é considerado.

👉 ****Oque é FCEP?**
  O Fundo de Combate à Pobreza é um tributo instituído para minimizar as desigualdades sociais entre os estados, contribuindo para uma qualidade de vida mais justa para todos os brasileiros. Seu valor e cobrança está conectado ao ICMS (Impostos sobre a Circulação de Mercadorias e Serviços), de forma a funcionar como uma alíquota adicional no recolhimento desse tributo.


👉 ****O que devemos informar nos grupos ICMS-60 ICMS-500?**
  **pRedBCEfet (N34)** - Segundo a regra de validação deverá ser preenchido com percentual de redução, caso estivesse submetida ao regime comum de tributação, para obtenção da base de cálculo efetiva (vBCEfet).
**vBCEfet (N35)** - segundo a regra de validação deverá ser preenchido com Valor da base de cálculo que seria atribuída à operação própria do contribuinte substituído, caso estivesse submetida ao regime comum de tributação, obtida pelo produto do vProd por (1- pRedBCEfet).
**pICMSEfet (N36)** - segundo a regra de validação deverá ser preenchido com a Alíquota do ICMS na operação a consumidor final, caso estivesse submetida ao regime comum de tributação.
**vICMSEfet (N37)** - segundo a regra de validação deverá ser preenchido Obtido pelo produto do valor do campo pICMSEfet pelo valor do campo vBCEfet, caso estivesse submetida ao regime comum de tributação.



  > [!NOTE]
  > **Importante! **Os campos do ICMS Efetivo, são concorrentes com os campos **vBCSTRet_N26** e **vICMSSTRet_N27.

**Então caso seja informado os campos **vBCSTRet_N26** e **vICMSSTRet_N27**, os campos do ICMS Efetivo não devem constar no XML.

Encontrei essa info [aqui](https://atendimento.tecnospeed.com.br/hc/pt-br/articles/360013716733-Regra-Tributaria-Saiba-tudo-sobre-o-ICMS-Efetivo).
👉 ****Cenários **
  [REF](https://blog.oobj.com.br/icms-efetivo/)

  **Cenário 1 **– Quando há a saída do Substituto em operações com cobrança do ICMS por ST (normalmente saída do industrial)

  Os impostos possíveis são os seguintes:

  - CST 10, 30 ou 70
  - CSOSN 201, 202 ou 203
  O cálculo a ser feito é de **ICMS Presumido (crédito)** nos campos já existentes da NFe.

  ICMS Presumido (CRÉDITO) = vICMSST + vICMS* + vFCPST + vFCP*

  ---

  **Cenário 2 **– Quando há saída do Substituído para NÃO consumidor final em operações com ICMS cobrado anteriormente por ST (normalmente saída do atacadista)

  Os impostos possíveis são os seguintes:

  - CST 60
  - CSOSN 500
  Lembrando que como a operação NÃO é destinada a consumidor final, o campo indFinal é igual a 0.

  O cálculo a ser feito é de **ICMS Presumido (crédito)** nos campos já existentes da NFe.

  ICMS Presumido (CRÉDITO) = vICMSSTRet + vFCPSTRet

  ---

  **Cenário 3** – Quando há saída do Substituído para consumidor final em operações com ICMS cobrado anteriormente por ST (normalmente saída do varejista)

  Os impostos possíveis são os seguintes:

  - CST 60
  - CSOSN 500
  Lembrando que como a operação é destinada a consumidor final, o campo indFinal é igual a 1.

  O cálculo a ser feito é de **ICMS Efetivo (débito)** nos campos incluídos pela NT 2016.002.

  ICMS Efetivo (DÉBITO) = vICMSEfet

  vBCEfet = vProd * (1 – pRedBCEfet)

  vICMSEfet = pICMSEfet * vBCEfet

  ---






👉 ****Erros que vão acontecer se não atualizarmos os sistema.**
  👉 ****Rejeição 906 - Não informado campo de ICMS Efetivo obrigatório **
    - **Mensagem**: Não informado campo de ICMS Efetivo obrigatório quando CST = 60 ou CSOSN=500 e operação com consumidor final [nItem: nnn]
    - **Regra de Validação**: Se Informado **CST = 60** ou** CSOSN=500** e** indFinal=1** (id:B25a), preenchimento obrigatório dos campos do grupo opcional para informações do ICMS Efetivo (N33) Observação: Implementação opcional a critério da UF.
    - **Solução**: Se você preencher o campo **indFinal=1** (id:B25a) com o** CST=60** ou **CSOSN=500** é obrigatório o preenchimento dos campos que fazem parte do ICMS Efetivo.

  👉 ****Rejeição 938 - Rejeição : Não informada vBCSTRet, pST, vICMSSubstituto e vICMSSTRet [nItem: 999]**
👉 ****Exemplo: Informações base para o calculo dos novos campos.
**
  Campo com as **tags 60 e 500** a serem salvos de uma NF Entrada

  Produto: R$ 100,00        /         IVA 30%          /          Alíquota interna de 18%

  Valor do ST na NF Entrada = (R$ 130,00 * 18% = 23,40) - (R$ 100,00 * 18% = 18,00) = R$ 5,40



  **vBCSTRet             = Base de Cálculo ICMS Retido na operação anterior:           130,00
pST                      = Alíquota suportada pelo Consumidor Final (interna):          18%
vICMSSubstituto = Valor do ICMS próprio do Substituto (100,00*18%):            18,00
vICMSSTRet        = Valor do ICMS ST Retido na operação anterior:                    5,40
> [!NOTE]
> **Nota técnica :  Onde tem as instruções para implementar na XML
> [!NOTE]
> **Resumo
Deve ser informado os dados de ST Retido no momento que for realizar a operação de saída da mercadoria na qual foi adquirida com ICMS-ST. ( NFCE ou NFe ). Tanto mercadoria adquiridas por Remetente direto (Recebida da indústria) quando Remetente indireto (Recebido de revenda- CST 60 CSOSN 500)

Referente ao ICMS Efetivo, não sei se tem outro estado obrigando essa informação, até agora só o RJ, talvez Bahia em breve. De qualquer forma temos que ter essa funcionalidade para caso todos estados decidir tornar isso obrigatório.


Essas informações elas tem como base as notas de compras dos clientes, uma vez que ela tenha a entrada de notas V2 ativada, já vai ser possivel gerar as informações dentro da NFCe.

👉 ****Como aplicar os valores para toda a base de produtos dos clientes ?**
  Em conversa com o Phill, queremos fazer uma atualização via banco de dados em todos produtos sujeitos a ST do estado do RJ. Iremos informar a alíquota, base e vr de icms com 0,01 centavos para evitar erro ao gerar a nota.

Uma vez que ainda não temos as informações reais das entradas das notas dos clientes.

👉 ****Todos terão que usar a V2 ?**
Uma vez que as informações vêm da nota fiscal de entrada, teremos que ativar a entrada V2 nos clientes de RJ, pois a V2 já armazena as informações das XML, só temos que atribuir os valores ao cadastro do produto, estamos pensando em deixar só no front do dashboard e não no app.


👉 ****Qual é a base de valores que deveram ser levada em consideração, ultima nota ou ponderado ?
**
  A lei não é tão clara quanto os valores que serão discriminados, então pode acontecer de contabilidade pedirem os valores das ultimas notas ou um valor ponderado. Acredito que a melhor opção é ter as duas e o cliente que decide com a contabilidade.

> [!NOTE]
> Implementação realizada
