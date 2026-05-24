---
title: "Fila de Impressão"
category: "Perguntas Frequentes"
source: "https://www.notion.so/Fila-de-Impress-o-24300ee50e90817aafdecd294bc5161a"
scraped_at: "2026-05-22T10:51:15.550Z"
---

# Fila de Impressão

## Contexto

a fila de impressão visa melhorar toda a visibilidade das impressões que ocorrem dentro do sistema do estabelecimento. A ideia é que o estabelecimento tenha com clareza a visibilidade de todas as impressões que deram certo e falharam para reduzir os problemas operacionais que possam acontecer.

> [!NOTE]
>

## Como funciona

Caso a impressão tenha algum erro, o estabelecimento terá acesso de visualizar esse erro e tentar a impressão novamente. Dentro da fila de impressão o estabelecimento tem a sua disposição todas a s impressões realizadas e seus status.

## Como ativar

A partir do momento que o cliente tenho o socket na versão 2.1.0, a fila de impressão sempre vai ser ativada assim que o socket for ativo dentro do sistema.

## Para ativação teremos 3 possíveis cenários

### Cenário 1: Cliente possui socket na versão abaixo de 2.0

É necessário ser realizada uma instalação limpa, ou seja, antes de realizar a atualização do socket será obrigatório seguir esse passo a passo:

1. No PC do cliente acessar a aba “Adicionar ou remover programas” e apagar o “YoogaAppService”
  ![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/0c6ec995-49d3-4503-817d-c4056eee7fdf/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4666CEG5HKL%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105114Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJIMEYCIQCd6P4Id%2FYYXF6gvzU25Pp8%2FMZ%2F3%2BScjwt0gn7hAVwktwIhAOs0ZvPTDdhkFjwnH94PQgPhRdmzc702ETdRiBeYAqZHKv8DCBoQABoMNjM3NDIzMTgzODA1Igy1%2FipuZDjZ4jWKnhAq3AMlI%2BrIpe417ZRU3kdtG%2FoI9tTduucTFQ%2BIUOhbXPX5TiRxqH13gmxoEEmx5MhOg81593pJ2WZvJhocHYFPnQimcVmcY3zSurHmfsmo%2FTGgjrZpbra9wEvZg8r3QFmTELoMOxqqSdgDCGsNj5uxI3NmSlSTAG%2FBjzdbPv9x1JSD1fNi3pdHqJGEvqLZwYtuGzF%2Fwd9ZOdo9sYuIkCe7fHVSRznVBTElsUVTO4%2FAEImo%2FkEyhFrG5E6wgnq7tzaJ4QTupG8QMkBKRIMIN%2FLm1H%2F%2FnX0ZPhPMqrd120%2FFuqmJcQtV3TdqMG0rc%2BrXeb9eV2XONy7TJHkXo5FDsGjm300AItXXdtuALvy3XC4DDny5Q9iiHkbUcwtsJpP2PAoBtQMvNozCySlIpe94Urj5PtI%2FlQAXgEMJkjthyHrWj8bNxiWafFHgnFr3NUzh9ou0vB3dhwboSUIaQrx9gCEk52z0K%2BoSf6eBkDNZC%2FhbAs4tX6Um9wCD%2Fw6R%2FxVSzxS54pNEwQL9LjZrZBvXYMWtu2QxSMAitMB7%2B1jpCJuTfdcoarQBpJbNOefHQIYXXWRNEOEk8ZKKYx%2FygqsdM6QL9kTTm4pAGFyf4ZJzabSSnMQRXN5J05T98tmUXdIwuTDNv8DQBjqkAVxw65tYLn5Kg%2FE7E3I19Ngw%2F%2FiPyT6h3eP0DTvVlxP3IyTMsJVtcqGK6QiF%2BhHpLaQJT7yRxxGIN0UO5fsOty%2FwlRgK7%2FcvVEU18b9NgpXUCVJm2r3RFcCLbwpuLqVbq9iMunMP5fo7pUwhwvwDWhAUkUKg1s6Kk4icl8%2BpLvlWILQPGxFjlE2TbvoF1PSkDk%2FuGDOSBg%2B%2BPS%2FsizXN25kltubj&X-Amz-Signature=ac31b7c8159470dd803799cff0617166e3c9f2a513dac617c0ca963d2ddaf467&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

1. Acessar “Arquivos de programa (x86)” e apagar a pasta “YoogaAppService”
  ![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/28c4a392-e0dc-4e6f-b4b8-870c6a0e47e4/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466WXJJLBLQ%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105114Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJIMEYCIQCTZKT2%2Fri5uLzlSMC25pCDAI%2FtQGcbvwvw5nTwAhZd8AIhAM7fLYjXN1Q3Vi85Yx9DUwBypjylhNuZWuFt31R7rri9Kv8DCBoQABoMNjM3NDIzMTgzODA1IgyP5s1n52j61gTFvO4q3AMFZjdkWLR9cbM3ToTNU6SfkKtIoolpEygGgn4On%2Bd0Rodh0LE%2FXd%2FcWTd48beefspWynuMnwTI0WH6VDgzK0AYLaylA5Dt4%2FTOA22o8PFFpIaLNiwvMQZJ2MLdfnI%2BxDERvwcWnRC5EdiTJLzPCGXEM%2FWy7AbiLUK3%2B2I%2FFs4PkZpUHfg%2FGCnK4lfqQWVyPrhoKo%2FSCNlUrIl70mnmXscDbX4PgGPV81q2HtJWznvkyUCcPKIv1GvUed5Kk1fQvDuISqH0w6diCbZNbMHP1Zmu%2Bcy7ETUkJZII5ZrbrKDAJC6sI7RK8lYUwIs4KilGn9tBIAnoUDH%2BnjOZhvnsAdPuoDdwQes2E1HDn8nDH130oaQMXb8s9wMs%2BpQZShSWxG7kOpv440cGH9%2BN9xWrkVUZUT9ewJa8vmdZZ%2F6uzgcL0uB2w8rQuFzOGG2KT9Ym%2BY0kx5N%2Fc49gkIG1lu9GkiPRaG1OKjTi2XftZvO34osGHjCjnAybhGLTTMKb35rxflN3fKMYsxB6lRIrSacKX%2BVXblQ7ZPkx18K3r9C2GsgFIMf30WXlqQiwfoW0REfOyU77CfLoQ4WXvJM5%2BEqaDlcFqqFuCD%2FCa8QFxYse0Y4UT5wBkaslslRiqaZB1zDAvsDQBjqkAdjUHCDArSak1BTcY4biCAt83UWysQKAPVMBaSe%2BXQhUpMtV7Yrg9SRiLmEeOQluqKdAaMntmSNtUT2pznR5%2B5qfRbURsIbKRTq68Sc889b1mxatIrxiL%2BFgD4QSO59xH1vEHN5eAW3oJgCIgriKMB9DhH4d6KIoCjKk2BPi2s1hAg86u9u7pFbS5D4%2B9oPSPl0bP%2FJJyF%2BClsth8hae0WKHkv91&X-Amz-Signature=2d4a301195b81f16b840ac544ccb499959232feb45194fe78dd661fa5d50793f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

1. Realizar a instalação normal do Yooga através de [yooga.com.br/download](http://yooga.com.br/download) ou [yooga.com.br/suporte](http://yooga.com.br/suporte)


### Cenário 2: Cliente já possui socket em uma versão igual ou superior a 2.0

Basta realizar a atualização normal do socket e fazer o processo inicial de colocar o **Token de impressão **no socket.

### Cenário 3: Cliente novo

Basta realizar a atualização normal do socket e fazer o processo inicial de colocar o **Token de impressão **no socket.

## Como desativar

Se por algum motivo esteja acontecendo algum problema nas impressões temos ainda a disponibilidade de realizar um Rollback de segurança e retirar a Fila de impressão do sistema, com isso basta retirar a seguinte config do idi:

> modulo_impressao_v2

## Dúvidas Frequentes

### Caso ocorra erro de impressão, o modal aparece para qual usuário?

O modal do erro aparece somente para o usuário que realizou a ação de impressão e ele tem a possibilidade de tentar novamente ou ignorar.

### Como funciona para os clientes que tem a categoria “Não imprimir”?

Nesse caso a fila de impressão tem uma inteligência que entende que esse é o funcionamento correto nesse caso, ou seja, não aparece o modal de erro, porém, a categoria de impressão precisa com obrigatoriedade estar com o nome NAO_IMPRIMIR.

### Ao desativa, o cliente perde alguma configuração de impressão?

Não, caso seja preciso realizar o rollback toda a configuração de impressão continua salva no sistema.
