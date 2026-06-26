---
title: "Particularidades de cada estado"
category: "Perguntas Frequentes"
source: "https://www.notion.so/Particularidades-de-cada-estado-24300ee50e90810ab4fcc29f8bade005"
scraped_at: "2026-05-22T10:53:08.356Z"
---

# Particularidades de cada estado

**Informativo
Atualmente Ceara pode emitir NFCe normalmente igual ao demais estados, portanto, o alinhamento de CFe foi descontinuado.

[Untitled](https://www.notion.so/452f091a5da84215be93d8c644b2bc51) - Importante!!


~~No Ceará em duas formas de emitir cupom fiscal eletrônico


Nós emitimos nos dois modelos, porém tem regras.~~

~~
~~~~**Modelo 59 CFe**~~~~: Somente App - O cliente precisa ter um aparelho chamado MFe, esse aparelho que emite o cupom fiscal CFe.~~

~~
~~~~**Alinhamentos para orientar o cliente: **~~~~
~~

👉 **~~**Comercial**~~
  **I**ndicar um MFE de preferencia TANCA ou EPSON.


Faturamento maior que 250 mil é necessário usar o MFe, **não tem como ser Emissor, tem que emitir tudo no app.

Caso o faturamento seja inferior a 250 mil, ele pode ser  App + Emissor emitindo a NFCe pela Yooga.

👉 **~~**Onboarding**~~
**Ativação
Indicar um MFE de preferencia TANCA ou EPSON.


**Instruções de como funciona:
**1º **A contabilidade precisa vincular o MFe ao CNPJ do cliente na Sefaz. Caso contrario será exibo uma mensagem no momento da ativação que o “equipamento difere do esperado”


  Ela vai precisar do numero de série que fica no aparelho para fazer o vinculo.


Link para fazer o cadastro
[https://cfe.sefaz.ce.gov.br/mfe#/](https://cfe.sefaz.ce.gov.br/mfe#/)


**2º Ativação
Agendar com Markin, para fazer a ativação.

**O que precisa para ativar ?
- Modulo MFe
- Códigos fiscais cadastrados
- Java 32 e 64bits
- Comunicador CFE Driver 64bits


**1 - Instalar o Desk e ativar a config MFe
Depois de instalar o Desk, instale o Java 32 Bits e a API do MFe manualmente.

[**Java 32bits**](https://javadl.oracle.com/webapps/download/AutoDL?BundleId=247134_10e8cce67c7843478f41411b7003171c)

[**API DESK**](/24300ee50e908104a873d224bceb082c) Instalação por rota- [Arquivos para Atualizar Desk](https://drive.google.com/drive/u/1/folders/1EKdqzhBu0Rc1ZhF4_IUfolcVBZCoFHWM)

[**API MFE DESK**](https://drive.google.com/drive/u/1/folders/1YNarFe8ar7_GdHx9U4mfSY5FW87HotLQ) (colar os arquivos na pastas AppData\Local\Programs\api )

**2 - Instalação do MFe
Instalar o driver do MFe e ativador, este processo varia de acordo com o fabricante do MFe.

**Baixe o **[**Comunicador Driver MFE**](https://servicos.sefaz.ce.gov.br/internet/download/projetomfe/DriverMFE_Instalador-x86-01.05.18.exe) e instale no computador do cliente, depois de instalar é necessário verificar se o monitor está verde, é um sinal que o MFe está comunicando corretamente.

**3 - Ativação e Associação
**Portal do MFe (Software House)
Esse site serve para associar a empresa do nosso cliente ao CNPJ da Yooga.

Ele não associa o MFe, somente o CNPJ da empresa, que associa o MFe ao CNPJ do cliente é a contabilidade.

[https://cfe.sefaz.ce.gov.br/mfe#/](**https://cfe.sefaz.ce.gov.br/mfe#/**)** >** Acesso Restrito > Software Houses

- CNPJ: 29.306.272/0001-04
- Senha: tcmcbxkbrdsc
- Tipo de Vínculo: Software House


**Menu Esquerdo > Vincular Aplicativo Comercial
Preencher o CNPJ e Código de Vinculação AC*

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/5795e47d-166a-43d0-91d6-ec705dd77ecd/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466RDCZAIQX%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105255Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIBWxmWpaUeNz2UjoCZ4k3ENRK6xLZePdXlAtEoU7FrCmAiEArA8KWaAdnAd4gu6%2FV4KZkXLhIexErv7cF5Z03iYWlJ0q%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDIwJrzCQjHLZSj006CrcAys54V%2F8rX6snLzYrLpD7mp0kmgvDoYMpoLYWs7x8BQx0mAELjEMUU5IRqzBVkgt%2BCbxsM2Y1kO%2F9tuB760%2Fo7%2Fuonz%2BwzJM91Twf%2F4Ikz6amLQE8DrHpp%2FTCf6TfJh%2BZYtG7IMuQN55XqdH43ghjQT5OaGEqasInAd20tYploL2ryvU%2FResESMO6qTpZWGUhHUK523l47CQSPqpPgjk7DpqM%2BGl3cTMaG42AJweXc%2BX0HM29HOAriSbFJv%2BF1tLhRe1ctJ%2BZgVZmLlN3TI1F0ZO7DSfNQGgp33QIaOuQCaGX17kch2HlUM4sXtEniECReRoeVe6RuVtRGPBznta0lp%2Bk5AcpZt2J1Q8ee8mXIvvlHaSM5PXk%2FETzfxHXKCMdtOCjQds9ci6VUb0Ocy1PQ6ThNgQyS7sOgFlYZXiliNOyeDYs4kgPzTKmFzkRVadTule55bb6n6Om%2F3qEL9IYk%2FhbVW8PK6dM%2FVB7dVcoNIIYhGJ1is8TS%2BkdQpzusYG70I9iCgMS4zAc6xW7sOnLpswxuh9TvxR26IMadCI988oBq9QK0bRaqCCXN7c6Q2FPXudYn2rHIXAfH0j%2BQL9HgzdcaqyWZ%2BFI7YguIBrY5OA8MxkPzF9IryNRusfMMDowNAGOqUBQJTPSYuaffvsTKt99s8QbpDl5v7k42bfxrS4p0WL6tUxkeqYPgb1sJCe7yfin64O9NWogRKEDUpwQh9PF5XgPP6L6TjruXcepwaIE2XF4%2F%2FlgeprdCaOgDiy6ZJ4ZdjzAh9xWgUcl48EDZU%2F6Y0OOeIf0DlEutMjWrfTIgeTIWI2HGQcdN0KLV0rUbUmbqFDk5xYyhUOxNmE16gvFwIUaSwEAkWt&X-Amz-Signature=c6b83d44e737be5d00ca828a11de55fc9835fbf8b6994e5db5b9af415506e9f4&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

O Código de Vinculação AC é gerado através de um software, usando o CNPJ do contribuinte e Software House e Certificado da Software House.

Não feche o gerador ainda, mais para frente vamos usar.

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/cd7caf37-c43b-4014-9f6b-100de11e90e6/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466RDCZAIQX%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105255Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIBWxmWpaUeNz2UjoCZ4k3ENRK6xLZePdXlAtEoU7FrCmAiEArA8KWaAdnAd4gu6%2FV4KZkXLhIexErv7cF5Z03iYWlJ0q%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDIwJrzCQjHLZSj006CrcAys54V%2F8rX6snLzYrLpD7mp0kmgvDoYMpoLYWs7x8BQx0mAELjEMUU5IRqzBVkgt%2BCbxsM2Y1kO%2F9tuB760%2Fo7%2Fuonz%2BwzJM91Twf%2F4Ikz6amLQE8DrHpp%2FTCf6TfJh%2BZYtG7IMuQN55XqdH43ghjQT5OaGEqasInAd20tYploL2ryvU%2FResESMO6qTpZWGUhHUK523l47CQSPqpPgjk7DpqM%2BGl3cTMaG42AJweXc%2BX0HM29HOAriSbFJv%2BF1tLhRe1ctJ%2BZgVZmLlN3TI1F0ZO7DSfNQGgp33QIaOuQCaGX17kch2HlUM4sXtEniECReRoeVe6RuVtRGPBznta0lp%2Bk5AcpZt2J1Q8ee8mXIvvlHaSM5PXk%2FETzfxHXKCMdtOCjQds9ci6VUb0Ocy1PQ6ThNgQyS7sOgFlYZXiliNOyeDYs4kgPzTKmFzkRVadTule55bb6n6Om%2F3qEL9IYk%2FhbVW8PK6dM%2FVB7dVcoNIIYhGJ1is8TS%2BkdQpzusYG70I9iCgMS4zAc6xW7sOnLpswxuh9TvxR26IMadCI988oBq9QK0bRaqCCXN7c6Q2FPXudYn2rHIXAfH0j%2BQL9HgzdcaqyWZ%2BFI7YguIBrY5OA8MxkPzF9IryNRusfMMDowNAGOqUBQJTPSYuaffvsTKt99s8QbpDl5v7k42bfxrS4p0WL6tUxkeqYPgb1sJCe7yfin64O9NWogRKEDUpwQh9PF5XgPP6L6TjruXcepwaIE2XF4%2F%2FlgeprdCaOgDiy6ZJ4ZdjzAh9xWgUcl48EDZU%2F6Y0OOeIf0DlEutMjWrfTIgeTIWI2HGQcdN0KLV0rUbUmbqFDk5xYyhUOxNmE16gvFwIUaSwEAkWt&X-Amz-Signature=2855c2f256817d1dd318f1edf3bcb16bbcef51d3596f04014509f3e44239616c&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Agora o processo é dentro do ativador do MFe, vai ser necessário ativar e depois associar a Yooga, usar a mesma assinatura, lembrando sempre usar nosso código padrão de ativação 00000000 que são os oitos zeros.

**4 - Inserir a Config dentro do banco do Desk
Para configuração do MFe no Yooga, é necessário configurar os seguintes campos na tabela _cfe_config_:

**Abrir o Heid > **_**cfe_config **_** > Clicar em adicionar
**Feito isso é só fazer uma venda e ver se vai emitir certinho.
**Quem esta habil para ativar:

Markin e Matheus


O que precisa para ativar ?
- Modulo MFe
- Códigos fiscais cadastrados
- [Comunicador CFE Driver 64bits](https://servicos.sefaz.ce.gov.br/internet/download/projetomfe/DriverMFE_Instalador-x64-01.05.18.exe)
- [API de impressão versão 2.0 MFe](https://drive.google.com/file/d/1t0KqIU6L4oN5TB5aa-U4RdIheGhUnlUD/view?usp=drive_link)
- Eléctron atualizado - Solicitar ao Phill no privado para forçar uma atualização do eléctron pelo IDI do cliente.
- Ativar config MFe -na Customers - fiscal_modulo_mfe - true

Extras: consultar status do mfe - [https://cfe.sefaz.ce.gov.br/mfe/servicos#/modulo-fiscal](https://cfe.sefaz.ce.gov.br/mfe/servicos#/modulo-fiscal) é necessário o numero de série.


**1 - Acessar o computador do cliente
Precisa ser o computador aonde o MFe esta conectado.


**2 - Verificar se o MFe esta conectado no computador
Ele fica exibido no painel de controle na parte de impressoras e dispositivos como se fosse uma impressora conectado na porta COM.

**3 - Instalação do MFe
Instalar o driver do MFe e ativador, este processo varia de acordo com o fabricante do MFe, o MFe é conectado via USB.

**Elgin
- Não precisa de driver
- Ativador - [Link ](https://d2u2qhufg0q9tn.cloudfront.net/assets/arquivos/imgCard_e833b859-ef9c-4763-b941-29a4be94dd95_ativador-sat_1_1_12.zip)

**Tanca
**- Não precisa de driver
- Ativador - [Link](https://www.tanca.com.br/assets/conteudo/drivers/TM-1000/MFE_Ativacao.zip) - Usar a versão 32bits é que funciona melhor na maior parte das vezes.

**Gertec
**- Driver - [Link](https://www.gertec.com.br/wp-content/uploads/2022/06/Gertec_Full-Installer_V2.2.2.0-3.zip)
- Ativador - [Link](https://www.gertec.com.br/wp-content/uploads/2022/06/Ativador_GerMFE_V1.0.6.0.zip)


Esse tutoria vai ser feito com base no ativador Tanca porque ele funciona para todos modelos.


**4 - **Baixe o** **[**Comunicador Driver MFE**](https://servicos.sefaz.ce.gov.br/internet/download/projetomfe/DriverMFE_Instalador-x64-01.05.18.exe) e instale no computador do cliente, após instalar é necessário verificar se o monitor está verde, é um sinal que o MFe está comunicando corretamente.

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/eae1b590-0aff-440f-8767-ed39009f0321/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VXGTNIQD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105256Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQDsIubcR4HzaPY8gnUhZ6%2BO%2FeB5gY9euuBUoyG1a%2FWwtQIhAMjiG%2FB6PniykWZlgA1pFQAV7edxVZG2pJlLQowdX0G%2FKv8DCBwQABoMNjM3NDIzMTgzODA1IgwifooCf0dOMYLOwjgq3ANd2nV6sfQXl9r4pIdZ%2BNuXA%2B2OSyYKQ6xDSjN4%2FgYCkd2VM47E9P3ZXTIJXpwDdXbiF1IGGrfO5%2Bbi%2FpaFgiiJ3qO6rXGB7t0vpJh5nldZvTEsMwXnnx4dUqNRuCKxRWuMXKJI%2Fimwfgi4lg5Lz5rtuaFvQMpaXNghsQ8hDfZcHEfc3tose7rhSejoiBi1z69Bji33aEUfC538A9fkk%2BAAK0qJBKy5KrurGbxaRJ6KgEMTdYjZzEeCD6jdm5Dl3eGGO0bJzrKblcjCKYEijdkhmXKpBxMA6AvtuK%2F%2FasMZ0B24o9ELp3dqFBMStxo5HeeYM%2FRP1vprdqJDyn9Xr5wJ3pJFnV6YNN%2Basnd3j%2BrPIwfzOUBdzbtm2i4Y6JWHmf08rQ0Zmg00KPtf40%2F4XfIhiiz4lp9WO%2BHWZk8zfPchXc41XZhYUhfcpaQG9rSP%2Bkuz6xogmiep5ARC%2BSGQzW2TICBle9zsSjgufLFXY%2F1Pjsu9rALdgggRs2FzrAKuvsJxix0%2Foy7V%2BixVaUwkHRi44ySQuwb8pPjwh6tqLkkI4VtE%2BNAZ9xRwyoMKTcN7Zh3Y04A6t9rnDiwqIVeu4YPIUjgTXrB28LDEdWxfJQ0CJxFey0CSTrFfuIrH%2BzCp6cDQBjqkAYU6Pw40UOdjaU5TR55QYWC2UWvgMRQhPwoFf3KdvKJDhKqjRNnciQsArgANS2tM8%2FOIm0rIcKJruKrQizOeUEdJ6fu1UNXlHVYUtkV4Wq21gPyUhc1FZ42kshwPBNGejBeIAfOuURBXkj7NIs5zHhULvrubZR5qVE7yhz%2BbJQojSbVu93SIzlGKJ6j%2FHsrNWOjrWJ7kas%2FLBoepb34DvbECCnU%2F&X-Amz-Signature=823baba73bf5040dc43f412fac8e1f615f88ea00585e14d9a8187f1c6a284502&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Só é possivel seguir para o próximo passo se o monitor ficar Verde que significa MFE Disponível.
Após a instalação esperar no mínimo 1 minuto para esperar o monitor responder.
Caso não tenha resposta, vamos tentar reiniciar o monitor:


Acesse a pasta C:\ > Procure uma pasta chamada **Comunicador > Delete a pasta

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/6b82cf74-89c1-4dae-8d80-3b595f92957b/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VXGTNIQD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105256Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQDsIubcR4HzaPY8gnUhZ6%2BO%2FeB5gY9euuBUoyG1a%2FWwtQIhAMjiG%2FB6PniykWZlgA1pFQAV7edxVZG2pJlLQowdX0G%2FKv8DCBwQABoMNjM3NDIzMTgzODA1IgwifooCf0dOMYLOwjgq3ANd2nV6sfQXl9r4pIdZ%2BNuXA%2B2OSyYKQ6xDSjN4%2FgYCkd2VM47E9P3ZXTIJXpwDdXbiF1IGGrfO5%2Bbi%2FpaFgiiJ3qO6rXGB7t0vpJh5nldZvTEsMwXnnx4dUqNRuCKxRWuMXKJI%2Fimwfgi4lg5Lz5rtuaFvQMpaXNghsQ8hDfZcHEfc3tose7rhSejoiBi1z69Bji33aEUfC538A9fkk%2BAAK0qJBKy5KrurGbxaRJ6KgEMTdYjZzEeCD6jdm5Dl3eGGO0bJzrKblcjCKYEijdkhmXKpBxMA6AvtuK%2F%2FasMZ0B24o9ELp3dqFBMStxo5HeeYM%2FRP1vprdqJDyn9Xr5wJ3pJFnV6YNN%2Basnd3j%2BrPIwfzOUBdzbtm2i4Y6JWHmf08rQ0Zmg00KPtf40%2F4XfIhiiz4lp9WO%2BHWZk8zfPchXc41XZhYUhfcpaQG9rSP%2Bkuz6xogmiep5ARC%2BSGQzW2TICBle9zsSjgufLFXY%2F1Pjsu9rALdgggRs2FzrAKuvsJxix0%2Foy7V%2BixVaUwkHRi44ySQuwb8pPjwh6tqLkkI4VtE%2BNAZ9xRwyoMKTcN7Zh3Y04A6t9rnDiwqIVeu4YPIUjgTXrB28LDEdWxfJQ0CJxFey0CSTrFfuIrH%2BzCp6cDQBjqkAYU6Pw40UOdjaU5TR55QYWC2UWvgMRQhPwoFf3KdvKJDhKqjRNnciQsArgANS2tM8%2FOIm0rIcKJruKrQizOeUEdJ6fu1UNXlHVYUtkV4Wq21gPyUhc1FZ42kshwPBNGejBeIAfOuURBXkj7NIs5zHhULvrubZR5qVE7yhz%2BbJQojSbVu93SIzlGKJ6j%2FHsrNWOjrWJ7kas%2FLBoepb34DvbECCnU%2F&X-Amz-Signature=daccab699d17d5d0273dd7f1677612f7f65c064a9b780dda209b92b5642c269e&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Abra o gerenciador de tarefas > Serviços > **Reiniciar Comunicador

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/c4f554b1-5ca5-4a8e-bed9-f07fb838d8a3/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VXGTNIQD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105257Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQDsIubcR4HzaPY8gnUhZ6%2BO%2FeB5gY9euuBUoyG1a%2FWwtQIhAMjiG%2FB6PniykWZlgA1pFQAV7edxVZG2pJlLQowdX0G%2FKv8DCBwQABoMNjM3NDIzMTgzODA1IgwifooCf0dOMYLOwjgq3ANd2nV6sfQXl9r4pIdZ%2BNuXA%2B2OSyYKQ6xDSjN4%2FgYCkd2VM47E9P3ZXTIJXpwDdXbiF1IGGrfO5%2Bbi%2FpaFgiiJ3qO6rXGB7t0vpJh5nldZvTEsMwXnnx4dUqNRuCKxRWuMXKJI%2Fimwfgi4lg5Lz5rtuaFvQMpaXNghsQ8hDfZcHEfc3tose7rhSejoiBi1z69Bji33aEUfC538A9fkk%2BAAK0qJBKy5KrurGbxaRJ6KgEMTdYjZzEeCD6jdm5Dl3eGGO0bJzrKblcjCKYEijdkhmXKpBxMA6AvtuK%2F%2FasMZ0B24o9ELp3dqFBMStxo5HeeYM%2FRP1vprdqJDyn9Xr5wJ3pJFnV6YNN%2Basnd3j%2BrPIwfzOUBdzbtm2i4Y6JWHmf08rQ0Zmg00KPtf40%2F4XfIhiiz4lp9WO%2BHWZk8zfPchXc41XZhYUhfcpaQG9rSP%2Bkuz6xogmiep5ARC%2BSGQzW2TICBle9zsSjgufLFXY%2F1Pjsu9rALdgggRs2FzrAKuvsJxix0%2Foy7V%2BixVaUwkHRi44ySQuwb8pPjwh6tqLkkI4VtE%2BNAZ9xRwyoMKTcN7Zh3Y04A6t9rnDiwqIVeu4YPIUjgTXrB28LDEdWxfJQ0CJxFey0CSTrFfuIrH%2BzCp6cDQBjqkAYU6Pw40UOdjaU5TR55QYWC2UWvgMRQhPwoFf3KdvKJDhKqjRNnciQsArgANS2tM8%2FOIm0rIcKJruKrQizOeUEdJ6fu1UNXlHVYUtkV4Wq21gPyUhc1FZ42kshwPBNGejBeIAfOuURBXkj7NIs5zHhULvrubZR5qVE7yhz%2BbJQojSbVu93SIzlGKJ6j%2FHsrNWOjrWJ7kas%2FLBoepb34DvbECCnU%2F&X-Amz-Signature=f7242c80f3ce0e420bb3d5683f4c6c22e1961df95d1a5dcf5c34ea6a06479906&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Aguarde para ver se o monitor ficou verde, caso não, peça o cliente trocar porta usb, desligar e ligar o MFe.

**5 - Ativação e Associação
**Entre no Portal do MFe (Software House) **[https://cfe.sefaz.ce.gov.br/mfe#/](**https://cfe.sefaz.ce.gov.br/mfe#/**)**
Esse site serve para associar a empresa do nosso cliente ao CNPJ da Yooga.
Ele não associa o MFe, somente o CNPJ da empresa, quem associa o MFe ao CNPJ do cliente é a contabilidade, então não tem como ativar o MFE se ele não foi associado pela contabilidade.

**Acesso Restrito > Software Houses
![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/2361098b-64b9-4104-96a9-935afaf2fbb8/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VXGTNIQD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105257Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQDsIubcR4HzaPY8gnUhZ6%2BO%2FeB5gY9euuBUoyG1a%2FWwtQIhAMjiG%2FB6PniykWZlgA1pFQAV7edxVZG2pJlLQowdX0G%2FKv8DCBwQABoMNjM3NDIzMTgzODA1IgwifooCf0dOMYLOwjgq3ANd2nV6sfQXl9r4pIdZ%2BNuXA%2B2OSyYKQ6xDSjN4%2FgYCkd2VM47E9P3ZXTIJXpwDdXbiF1IGGrfO5%2Bbi%2FpaFgiiJ3qO6rXGB7t0vpJh5nldZvTEsMwXnnx4dUqNRuCKxRWuMXKJI%2Fimwfgi4lg5Lz5rtuaFvQMpaXNghsQ8hDfZcHEfc3tose7rhSejoiBi1z69Bji33aEUfC538A9fkk%2BAAK0qJBKy5KrurGbxaRJ6KgEMTdYjZzEeCD6jdm5Dl3eGGO0bJzrKblcjCKYEijdkhmXKpBxMA6AvtuK%2F%2FasMZ0B24o9ELp3dqFBMStxo5HeeYM%2FRP1vprdqJDyn9Xr5wJ3pJFnV6YNN%2Basnd3j%2BrPIwfzOUBdzbtm2i4Y6JWHmf08rQ0Zmg00KPtf40%2F4XfIhiiz4lp9WO%2BHWZk8zfPchXc41XZhYUhfcpaQG9rSP%2Bkuz6xogmiep5ARC%2BSGQzW2TICBle9zsSjgufLFXY%2F1Pjsu9rALdgggRs2FzrAKuvsJxix0%2Foy7V%2BixVaUwkHRi44ySQuwb8pPjwh6tqLkkI4VtE%2BNAZ9xRwyoMKTcN7Zh3Y04A6t9rnDiwqIVeu4YPIUjgTXrB28LDEdWxfJQ0CJxFey0CSTrFfuIrH%2BzCp6cDQBjqkAYU6Pw40UOdjaU5TR55QYWC2UWvgMRQhPwoFf3KdvKJDhKqjRNnciQsArgANS2tM8%2FOIm0rIcKJruKrQizOeUEdJ6fu1UNXlHVYUtkV4Wq21gPyUhc1FZ42kshwPBNGejBeIAfOuURBXkj7NIs5zHhULvrubZR5qVE7yhz%2BbJQojSbVu93SIzlGKJ6j%2FHsrNWOjrWJ7kas%2FLBoepb34DvbECCnU%2F&X-Amz-Signature=69c3b7cc5aaca77176ceba10c2e483a6fb21c4a8dc30903f335f89a876d41638&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

- CNPJ: 29.306.272/0001-04
- Senha: tcmcbxkbrdsc
- Tipo de Vínculo: Software House

**Menu Esquerdo > Vincular Aplicativo Comercial
O Código de Vinculação AC é gerado através de um software, usando o CNPJ do contribuinte e Software House e Certificado da Software House.

**Gerando o código de vinculação
**Abra o gerador:

CNPJ Software House: **29306272000104
CNPJ Contribuinte: CNPJ do cliente sem os pontos

Selecione o certificado digital da Yooga e informe a senha

**Clique em** “Assinar”

**Copie o** código de vinculação

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/cd7caf37-c43b-4014-9f6b-100de11e90e6/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VXGTNIQD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105257Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQDsIubcR4HzaPY8gnUhZ6%2BO%2FeB5gY9euuBUoyG1a%2FWwtQIhAMjiG%2FB6PniykWZlgA1pFQAV7edxVZG2pJlLQowdX0G%2FKv8DCBwQABoMNjM3NDIzMTgzODA1IgwifooCf0dOMYLOwjgq3ANd2nV6sfQXl9r4pIdZ%2BNuXA%2B2OSyYKQ6xDSjN4%2FgYCkd2VM47E9P3ZXTIJXpwDdXbiF1IGGrfO5%2Bbi%2FpaFgiiJ3qO6rXGB7t0vpJh5nldZvTEsMwXnnx4dUqNRuCKxRWuMXKJI%2Fimwfgi4lg5Lz5rtuaFvQMpaXNghsQ8hDfZcHEfc3tose7rhSejoiBi1z69Bji33aEUfC538A9fkk%2BAAK0qJBKy5KrurGbxaRJ6KgEMTdYjZzEeCD6jdm5Dl3eGGO0bJzrKblcjCKYEijdkhmXKpBxMA6AvtuK%2F%2FasMZ0B24o9ELp3dqFBMStxo5HeeYM%2FRP1vprdqJDyn9Xr5wJ3pJFnV6YNN%2Basnd3j%2BrPIwfzOUBdzbtm2i4Y6JWHmf08rQ0Zmg00KPtf40%2F4XfIhiiz4lp9WO%2BHWZk8zfPchXc41XZhYUhfcpaQG9rSP%2Bkuz6xogmiep5ARC%2BSGQzW2TICBle9zsSjgufLFXY%2F1Pjsu9rALdgggRs2FzrAKuvsJxix0%2Foy7V%2BixVaUwkHRi44ySQuwb8pPjwh6tqLkkI4VtE%2BNAZ9xRwyoMKTcN7Zh3Y04A6t9rnDiwqIVeu4YPIUjgTXrB28LDEdWxfJQ0CJxFey0CSTrFfuIrH%2BzCp6cDQBjqkAYU6Pw40UOdjaU5TR55QYWC2UWvgMRQhPwoFf3KdvKJDhKqjRNnciQsArgANS2tM8%2FOIm0rIcKJruKrQizOeUEdJ6fu1UNXlHVYUtkV4Wq21gPyUhc1FZ42kshwPBNGejBeIAfOuURBXkj7NIs5zHhULvrubZR5qVE7yhz%2BbJQojSbVu93SIzlGKJ6j%2FHsrNWOjrWJ7kas%2FLBoepb34DvbECCnU%2F&X-Amz-Signature=3ba434152abcd3f0d9cdd99363f42e18166f0489fe3bc8fe9a5c9840922aca42&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/5795e47d-166a-43d0-91d6-ec705dd77ecd/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VXGTNIQD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105257Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQDsIubcR4HzaPY8gnUhZ6%2BO%2FeB5gY9euuBUoyG1a%2FWwtQIhAMjiG%2FB6PniykWZlgA1pFQAV7edxVZG2pJlLQowdX0G%2FKv8DCBwQABoMNjM3NDIzMTgzODA1IgwifooCf0dOMYLOwjgq3ANd2nV6sfQXl9r4pIdZ%2BNuXA%2B2OSyYKQ6xDSjN4%2FgYCkd2VM47E9P3ZXTIJXpwDdXbiF1IGGrfO5%2Bbi%2FpaFgiiJ3qO6rXGB7t0vpJh5nldZvTEsMwXnnx4dUqNRuCKxRWuMXKJI%2Fimwfgi4lg5Lz5rtuaFvQMpaXNghsQ8hDfZcHEfc3tose7rhSejoiBi1z69Bji33aEUfC538A9fkk%2BAAK0qJBKy5KrurGbxaRJ6KgEMTdYjZzEeCD6jdm5Dl3eGGO0bJzrKblcjCKYEijdkhmXKpBxMA6AvtuK%2F%2FasMZ0B24o9ELp3dqFBMStxo5HeeYM%2FRP1vprdqJDyn9Xr5wJ3pJFnV6YNN%2Basnd3j%2BrPIwfzOUBdzbtm2i4Y6JWHmf08rQ0Zmg00KPtf40%2F4XfIhiiz4lp9WO%2BHWZk8zfPchXc41XZhYUhfcpaQG9rSP%2Bkuz6xogmiep5ARC%2BSGQzW2TICBle9zsSjgufLFXY%2F1Pjsu9rALdgggRs2FzrAKuvsJxix0%2Foy7V%2BixVaUwkHRi44ySQuwb8pPjwh6tqLkkI4VtE%2BNAZ9xRwyoMKTcN7Zh3Y04A6t9rnDiwqIVeu4YPIUjgTXrB28LDEdWxfJQ0CJxFey0CSTrFfuIrH%2BzCp6cDQBjqkAYU6Pw40UOdjaU5TR55QYWC2UWvgMRQhPwoFf3KdvKJDhKqjRNnciQsArgANS2tM8%2FOIm0rIcKJruKrQizOeUEdJ6fu1UNXlHVYUtkV4Wq21gPyUhc1FZ42kshwPBNGejBeIAfOuURBXkj7NIs5zHhULvrubZR5qVE7yhz%2BbJQojSbVu93SIzlGKJ6j%2FHsrNWOjrWJ7kas%2FLBoepb34DvbECCnU%2F&X-Amz-Signature=5c2b4701bbf46ca2abd92735afcba51af663a105e8a80a202fbb96bf10913fd9&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


Informe o CNPJ do cliente e o código de vinculação e clique em **Salvar**.


**Não feche o gerador ainda, mais para frente vamos usar.
Agora o processo é dentro do ativador do MFe;

Consulte o Modulo via DLL

 vai ser necessário ativar e depois associar a Yooga, usar a mesma assinatura, lembrando sempre usar nosso código padrão de ativação 00000000 que são os oitos zeros.

**Feito isso é só fazer uma venda e ver se vai emitir certinho.
**Homologação
> [!NOTE]
> **A pessoa responsável ativação fiscal é que faz o processo de homologação.

Atualmente - Markin ou Matheus Delmaestro
É necessário realizar 15 vendas NFe e NFCe em HOMOLOGAÇÃO. Depois, contactar a contabilidade para ativar o ambiente em produção e enviar o CSC de produção, aguardar 24 horas para fazer a venda de teste.

# Importante ⚠️

**Só é necessário fazer a homologação caso o cliente nunca tenha feito emissão de NFCe e NFe antes.

> [!NOTE]
> **A pessoa responsável ativação fiscal é que faz o processo de homologação.

Atualmente - Markin ou Matheus Delmaestro
- Mato Grosso do Sul/MS - Necessário EMITIR NFCe e NFE EM HOMOLOGAÇÃO


👉 **NFCe - Cupom Fiscal
  É necessário emitir 4 notas em homologação:
- 1 Autorização de NFC-e normal.
- 1 Autorização de NFC-e em modo offline - Contingência
- 1 Inutilização de numeração.
- 1 Cancelamento de NFC-e.


👉 ****NFe - Danfe Modelo 55  **
  Ser credenciado no ambiente de homologação e ter realizado os seguintes testes:
1-Autorização de NF-e
1-Cancelamento de NF-e
1-Inutilização de numeração
Caso a contabilidade já tenha feito o credenciamento em produção, só aguardar o dia seguinte e mudar o sistema para produção.

Na hora que for emitir a contingência é necessário informar a data atual e o horário tem que ser -4 horas ao horário no momento da ativação. Caso a contabilidade já tenha feito o credenciamento em produção, só aguardar 30 minutos que a produção é ativada automaticamente.

# Importante ⚠️

**Só é necessário fazer a homologação caso o cliente nunca tenha feito emissão de NFCe e NFE antes, isso se aplica a qualquer sistema emissor.

**Autorização de Uso
**Paraná/PR - Solicitar autorização de USO (Indicamos que o contador do cliente faça esse procedimento)
**Um pouco diferente dos outros estados, no PR é necessário solicitar essa autorização mesmo que ele já seja um emissor de NFCe ativo.

Solicitar ao Marcos Fernandes ( Marking ) para realizar a liberação dos clientes na Sefaz de PR.

👉 **Caso o cliente tenha dificuldades em Realizar o processo de solicitação segue o passo a passo :
  [O primeiro passo é acessar o site da Receita do Paraná](https://receita.pr.gov.br/) (se preferir, copie e cole este endereço no seu navegador: [receita.pr.gov.](https://receita.pr.gov.br/)).

  - Acessar com Usuário e Senha ou com o certificado digital.
  - No menu da esquerda, vá no seguinte caminho: UPD > Autorização de Uso > Cadastro de Autorização de Uso.


  ![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/e36d78cf-81f7-4236-a902-09e81a68310b/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YY3HWYCF%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105259Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIA0TVg0DschSJXNtfcxOJe3my3PKO1fE%2B5QGkW8xd8rEAiEAq6OxmqwCnFRoFOBMrlX2QxrwSBOnxcoZs3nNOd8cP58q%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDOTp1jEDx79ECbvf%2BircA6zfZhN9A9mxCDJJHR8bKMBTrNEwrylTo1Q58DDT%2FgzKGQ2entLOovJs98OU1oDpWR78CQ%2BoZXH2sb4eTugXaubtrkeGGjLLpmnSN7YKOtYIb22AoM%2B2psbZH1%2BDI2TTH2WKXWg%2BFda%2BLJWzBwdasj%2B4V0CuBDRJknz0tJBrIj1FXBr%2BUrvrnTMgwIKrFLIfF5yc46%2F1Li18Le0d%2BJoZ9HuCHq0nbQzZbut0y9%2Fn8H6STzFmeDT3Gu8cOHGS6BDrVPbX7R8r93uqGlPN1lsh%2BA44JXCefLjO1sTqnRpAJHeSiWsiEXAudGRs29FtgfBT%2BJQh3eXOGBUQHdepMSOa3mYnKuv0hqc6TSAfcof1OG7FOWhN1ITiQ9VZccgyB%2FsnenOQv1o8UreXmYnogDnTotCfroFozoxF9jS4TJOb8uVCPKcMNuey0vbpx5FLdZ7LhxH97zLOK90i3zfI7dhJO3PDC1IU3qdezu2R87csNs1iQZTwHPwvh7QWUMQApKdwiWOGUOBkXYJr%2Bn7cgQ%2F5ZINKvR17UP8FjE85B%2FCJUw2H3AsfhM2gdvxu2bDzfnBZ6vpde5NNYFzfAjEoS4cV%2B7dXbhOb870eNWOVM38f4NDywdR6E5gBu%2Br%2FZNsPMNfowNAGOqUBdLI7xZSVjmHnr0jA1zQ8DKBdys5MyIdR%2Bn6aDIP%2BawI%2FbST3HW2FOIQvJw2d16UfY6kEiJNJwkdrr%2BgNZrb8ZagjqBzRh8oflRhL77CanL7fmBpMQMizgpx3n8R2UUTlWMFqFerCElO0BFhsD2JYmIhLbfta%2FMc7Ud5qGrqHrCryscfWkkoCqxFZeQ4c3OaflpuMvwrBREFQ462xldrVHosdGCke&X-Amz-Signature=3da28e56c44574cda0d12072671a81735f4acaa7134aab401b58c3411aabcd3d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

  Informar o CNPJ da Yooga: 29.306.272/0001-04 IE: Isento

  Código de sistema : 76894

  ![Imagem](https://lh3.googleusercontent.com/nuLv0KVZaF1H0ibvSof53SXbn6vAFMiRMr0wq33Ar1Ouf80WoJHQI-KusJ-PNNG10FWqo_N7jaF-M1ASWHyinFkkFou4ISHpmkckEuIBGsF_R1zvctPwLRt74DwoBtplUVJGiVS1--X7HHRUMRQPWfI)

  ---

  Marque as opções de credenciamento e preencha os dados do seu estabelecimento. No campo "CAD/ICMS", digite o número da inscrição encontrada através do link [http://www.fazenda.pr.gov.br/Servicos/Consultar-cadastro-ICMS](http://www.fazenda.pr.gov.br/Servicos/Consultar-cadastro-ICMS).



  ![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/1ea7e5cc-a2e0-4398-bdbf-de813f8df9ab/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YY3HWYCF%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105259Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIA0TVg0DschSJXNtfcxOJe3my3PKO1fE%2B5QGkW8xd8rEAiEAq6OxmqwCnFRoFOBMrlX2QxrwSBOnxcoZs3nNOd8cP58q%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDOTp1jEDx79ECbvf%2BircA6zfZhN9A9mxCDJJHR8bKMBTrNEwrylTo1Q58DDT%2FgzKGQ2entLOovJs98OU1oDpWR78CQ%2BoZXH2sb4eTugXaubtrkeGGjLLpmnSN7YKOtYIb22AoM%2B2psbZH1%2BDI2TTH2WKXWg%2BFda%2BLJWzBwdasj%2B4V0CuBDRJknz0tJBrIj1FXBr%2BUrvrnTMgwIKrFLIfF5yc46%2F1Li18Le0d%2BJoZ9HuCHq0nbQzZbut0y9%2Fn8H6STzFmeDT3Gu8cOHGS6BDrVPbX7R8r93uqGlPN1lsh%2BA44JXCefLjO1sTqnRpAJHeSiWsiEXAudGRs29FtgfBT%2BJQh3eXOGBUQHdepMSOa3mYnKuv0hqc6TSAfcof1OG7FOWhN1ITiQ9VZccgyB%2FsnenOQv1o8UreXmYnogDnTotCfroFozoxF9jS4TJOb8uVCPKcMNuey0vbpx5FLdZ7LhxH97zLOK90i3zfI7dhJO3PDC1IU3qdezu2R87csNs1iQZTwHPwvh7QWUMQApKdwiWOGUOBkXYJr%2Bn7cgQ%2F5ZINKvR17UP8FjE85B%2FCJUw2H3AsfhM2gdvxu2bDzfnBZ6vpde5NNYFzfAjEoS4cV%2B7dXbhOb870eNWOVM38f4NDywdR6E5gBu%2Br%2FZNsPMNfowNAGOqUBdLI7xZSVjmHnr0jA1zQ8DKBdys5MyIdR%2Bn6aDIP%2BawI%2FbST3HW2FOIQvJw2d16UfY6kEiJNJwkdrr%2BgNZrb8ZagjqBzRh8oflRhL77CanL7fmBpMQMizgpx3n8R2UUTlWMFqFerCElO0BFhsD2JYmIhLbfta%2FMc7Ud5qGrqHrCryscfWkkoCqxFZeQ4c3OaflpuMvwrBREFQ462xldrVHosdGCke&X-Amz-Signature=2721ab56c6185d725240748fa9c7f7b29739653b65fbb31b0480e489ad139fd4&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

  Após finalizar os passos na tela, é preciso aguardar o prazo da Sefaz de até 48h para liberar a emissão de nota fiscal para a empresa.

Emitimos apenas NFCe modelo 65. Não emitimos ECF, não trabalhamos com ECF. Para ser gerado primeiro precisamos liberar o credenciamento dele em nosso sistema para depois a contabilidade gerar o certificado. Para essa liberação acione o responsável fiscal (marcos fernandes)

**Não atendemos fiscalmente
**Motivos

1- Não temos com integrar as formas de pagamento PIX, Credito, debito, voucher do delivery na NFCe.
2 - Não geremos SPED, na PB é obrigatório mesmo para Simples Nacional.

> [!NOTE]
>
[**Lei**](https://www.sefaz.pb.gov.br/legislacao/211-portarias/portarias-2017/4497-portaria-n-00166-2017-gser)** - Portaria

Resumindo, vendas crédito e debito tem que serem realizadas por maquinas TEF ou POS em que o sistema de vendas esteja integrado a ela. Não pode ser igual as maquinhas que o motoboy leva para fazer o recebimento sem vinculo com o sistema de automação da empresa.

A lei veio para fiscalizar o uso de maquininhas que não tenha vinculo com o CNPJ da empresa ou seja, evitar a sonegação.
>

Na final da NFC-e de clientes da Paraíba, tem essa informação a mais para se adequar à lei.

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/52d7575e-857d-4134-80e8-806257e2a4d0/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466VSNNTQ4K%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105300Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIC0nIvNtFD40Q2kKWKghZTK7XA8Jyt7firLssf6cBw8xAiEApq1KknZxJQ8VRWJzgh%2BMT3WG%2FRcpcfeQkx1uLG6HVRAq%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDB6aKQAjAoXSCwTLwyrcAykeEcUmwb8iBes9BraioiILNK99qlfPyHQCMgQ%2BgjJcWHG5JUcDnjlBuTTz1KNwTytdAFnlS7oBqI0uZBXQohhrgsEA5etPPsPSUmCRk5EMYfHC%2FoTAZfg5UVRSV6Wm21zFJ5HNmnEBNc%2BWtqwOGoPRP6%2Fs4rSi5yCS7eS%2B0M8jJ0IpbBu2nosr5msZ8%2FiNvdsbr%2FytRpDbf93bmTyoXieQLeJg%2BY%2Bf3GUG%2Fz0BUSjpfO5U4svrDRJaInx1XiHnMsBy2XZdKcUcbRJurk0F%2Fa4vpzAmv9c1WUQEpt%2BfbRjoDiKdAJWi4ztlFTKPzt0XM%2Bqs7nW%2Be6U3pld%2BrhookUm%2FwSKcYpTfLVYhPhsCEDPv4YTCRPzDh%2B3mj0ophqt5WWtkHSbH2fSfZkY7uPMMPfPrKvd6I2vb4Q8u19uvdj62g81dtAYPQZ8LyOq8YsaoeKQrtucjIAc5FRA73P4OtyxJ5I8PWjw%2Fudvz24p0YcwOMQonijlnspAV3tFaMoNws2N%2BJ2OkrywLCKXCvo7r06sx3SWemMg67n8Cm3OoJr9hHR%2F65s%2BmHtdHpzSUK52KYs5eZcyghQQ9rzoZKA5sm40LP432GiiwFuI%2FwYiQqE4kpLH8VZyRrvfQF%2F1MMMPpwNAGOqUB7YWSAMz%2FrPKvGxkbMHnfCJXnJe8vlCSE10bfb3gqme4RR%2FKZG4xtSUaUsXR1iZwfPVn5BgZ0%2FuNFevdE8Oc3gUVVgtNI9kckZUarSczGJSFK0t9wxjpLGXF3zjsrAEjRDlSqafhIeX8x2%2F8hLatYXM9EYb0%2FKdfop2k0%2FxQvLPnZ5o8n6c2i40lJ84uAU7%2BHEOmhp1Dgl2%2FDHlp7adyoqJ2TY5Th&X-Amz-Signature=566e04bc7b37344bcb4954bc96499c98210889989629909eaa762a9dd0743103&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

## Exceções

- Caldinho Prime Bar e Restaurante (46057 app; 101394 emissor)
  No emissor está conforme a imagem acima, porém o cliente insistiu que essa informação deveria constar na DAV também. Então, Tech criou a config _config_texto_final_impressao_ para se adequar à necessidade do cliente, ficando assim.

  ![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/c6e5fd26-24b5-4a30-9826-11cd04440a39/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4662LIYY3UU%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105300Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIEF2AVL6TLCpRBl12In9JyQZELSCFMWkKm4g2%2B%2FlgKOhAiApsDOWk5bbKeBseCEQQCIokdx278I8o4Z5TwqKw6MxUyr%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMZ7TwHv%2BoG5MZ3f2eKtwDqS9ScZLDfkXlM%2FHGjmbu%2BMNTY9A83iwLY2yHelZddWBh4d%2Bs1cu8BeuC0zbnGPuxUMvVjcOIrbQPocOMZJI4nT5ZbaRqYSSHDWGXukO39f8%2B7fCteqepbOyNNVjywh4IZActEIXCOVVjLMy2W7An715WfosGeXnsOQgSmkPZUmxKm9PCOLO5ja4AuR4tQBjxbn3jjIg%2FKekXGQcBWfqD5iUtHw81dHZx0e7kVLZuIrwKi19wEcYVL2Ywo4B0WIo%2Bk9%2BGSnqUSK%2FUeYs4NVme6xxNW5l%2Few8bGjaRYzizRfdRWzIB7PQiABvmXQ0AftFaMIWwndk8biDH%2BzT7lMJPw7u0AkeUBvrfsX3iE4I%2B1Jk%2FhNvg8lLiDMkUy1uIq8gyPrko7N9UIP9v3rtPwAhyXuycXUk31fQ4nFk53sQTfu0geGXcmO0RbSV3vONtn3nEfUFw48uc9I9A0UeicwulWo%2BYscKPPMF3cqOKnAyr%2BILVoHOLTN3HVJO%2FzgyojxGt92lAoSD%2FsiLdv%2FT2I%2FV99hY7ItOENtDIbbZf69M3oaKKWaHoWCtIQI1SNODc5jzohGv%2FBLSZywHOOj8sx%2F%2BCMuQbkT2lzQD1WWfTJ8Jal1qLOg9VsXJrtpBJE8cw277A0AY6pgHgWqiNTYhKM0d7aHrrY9M9DVBRl1rV%2BUlqQS%2F5MVEJlTdyAUptYv%2Fn9mXpc9GWACEu7giUpdBE7KZYse%2F6EEAYMGZNLzJud2GEBi1MG%2FI9X0V6HbEKvn9zr3auGHOmThktsvYr%2BzH9h9XsENbRm6NkGCkfvEYR189w8Cd1EoOP%2FLaqGs%2BhR0ljMgoNxdXO5uABrupJ6H99%2FHG%2F%2FGZNaDeYMvh6cg2z&X-Amz-Signature=a2fc92c7ed29162a77a892da2c38d5af1e88daf551f937b4e0224e76931bcce5&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

**Exceção

**Quando o cliente é franquias é necessário alinhar junto a contabilidade esses pontos e a geração do arquivo SPED.
**Integração POS
**Oque tem de peculiar no MT ?** Obrigatoriedade em integração de meios de pagamentos digitais.

**Quais são as formas de pagamento que tem essa obrigatoriedade ?** PIX, CREDITO, DEBITO.

**Como as vendas são interligadas ? **Ao serem finalizadas dentro das** **maquininhas da **Stone- POS Sunmi P2 **integrada com o sistema** Yooga.

**Temos integrações com outras maquininhas ? **Sim, temos a **Vero **para cliente que usam o banco **BANRISUL **mas só para modulo **Balcão**.

**Essa obrigatoriedade é para Delivery e Presencial ?** Somente **presencial.
**Cliente pode ter emissor? **Não pode, tem que emitir tudo pelo app.

Segue informações sobre a Integração Stone.

[Integração com maquininha Stone](https://www.notion.so/24300ee50e908146a7efe7df88f0207b)


Segue documento feito pelo Markin, com mais informações sobre as Leis e outras informações.
[Untitled](https://www.notion.so/ce59e818f0094259bf3cb5baef109fd2)

Config CPF


[CPF obrigatório ( RS e MT)](https://www.notion.so/24300ee50e908130920be32e555b2a99)

- Obrigatório o uso de maquininhas Stones, para integração das formas de pagamento.
- Não é possível usar Emissor.


[**A partir de quando essa integração será obrigatória e quem é obrigado?**](https://atendimento.receita.rs.gov.br/notaintegrada#panel-2050)

**Desde 01/01/24**, todos os estabelecimentos estão obrigados.

**Obs.:** A obrigatoriedade de integração **não se aplica**:

a) à NFC-e emitida na forma do Regime Especial da Nota Fiscal Fácil - NFF;

b) às cantinas, desde que estabelecidas em escolas, nas operações de venda realizadas de forma presencial.

c) vendas a delivery.

d) vendas efetuadas por MEI.

[**Quais os Meios de Pagamento Eletrônicos devem ser integrados à emissão de NFC-e.**](https://atendimento.receita.rs.gov.br/notaintegrada#panel-2047)** ?

Atualmente, a Receita estadual exige a integração de pagamentos via PIX de QR Code dinâmico e de cartões de crédito e débito.

[**As empresas deverão implementar o TEF, ou algum sistema específico?**](https://atendimento.receita.rs.gov.br/notaintegrada#panel-2052)
Não existe obrigatoriedade de se utilizar o TEF, e nem de qualquer outro sistema específico.

As empresas podem utilizar qualquer sistema emissor e qualquer sistema de pagamento, desde que informem os dados necessários na NFC-e no Comprovante de Pagamento.

PDT - [Untitled](https://www.notion.so/8e49a6521d8d4620ba6e01d74b2c173f)
Notificação, Lei - [Untitled](https://www.notion.so/46d5b6d0a71c4b3d9a208cd54b17e77b)
Ativação Suporte - [Integração com maquininha Stone](https://www.notion.so/24300ee50e908146a7efe7df88f0207b)


**Config CPF Obrigatário
[CPF obrigatório ( RS e MT)](https://www.notion.so/24300ee50e908130920be32e555b2a99)

**Informativo
Em São Paulo, existem duas opções de vendas de cupom fiscal:

- CFe SAT modelo 59.
- NFCe modelo 65.


**Na Yooga, emitimos somente NFCe modelo 65.
Vantagens!!! [- As NFCe modelo 65 não precisam constar no arquivo REDF (quando se emite pelo SAT, é necessário importar as vendas nesse sistema), todos os dados migrarão automaticamente para o Programa “Nota Fiscal Paulista”.](https://portal.fazenda.sp.gov.br/servicos/nfce/Paginas/perguntas-frequentes.aspx#:~:text=As%20NFC%2Des%20(modelo%2065,Programa%20%E2%80%9CNota%20Fiscal%20Paulista%E2%80%9D.&text=Dever%C3%A1%20enviar%20o%20arquivo%20REDF%20normalmente%2C%20para%20estes%20documentos.)

- Não precisa comprar o aparelho SAT que custa em média 700 reais.
- Não precisa do SAT estar ligado e conectado na internet para emitir NFCe.
- Pode emitir a NFCe em qualquer computador ou celular.
- A contabilidade pode acompanhar as emissões das notas em tempo real.


Atualmente o credenciamento de NFCe sem a necessidade de ativação de SAT. Informação divulgada pelo site Fazenda de SP, [clique aqui](https://portal.fazenda.sp.gov.br/servicos/sat/Paginas/Sobre.aspx) _**" Com a revogação do Artigo 2°, § 6º  da **_[_**Portaria CAT-12/2015**_](https://legislacao.fazenda.sp.gov.br/Paginas/pcat122015.aspx)_**, não se faz mais necessário ter um SAT Ativo para credenciamento na NFC-e."**_

Não é necessário os nossos clientes adquirirem o aparelho SAT para ativarmos o fiscal dele no modelo 65 NFCe.

Continua sendo obrigatório:

- Todos os dados fiscais necessários em:
[Ativação fiscal na Yooga - Documentação - Diferenças entre estados - TEF/POS](https://www.notion.so/24300ee50e90818f9a87ebccb5848d20)

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

**Ativar Configuração
Em MG o processo de ativação é normal como nos outros estados, a peculiaridade é somente o arquivo Sintegra. O Sintegra é um arquivo em formato de texto que possui as informações fiscais de entrada e saídas realizadas no mês, realizado internamente pela Yooga. Atualmente somente para clientes de MG.

Na ativação é preciso colocar o número zero antes da inscrição estadual nos clientes de MG. Você pode tentar primeiro com 1 zero, se não for tente com 2 zeros, e se ainda não for tente com 3 zeros antes da inscrição estadual.


### ⚠️ Obrigatório ativar essa config em todos clientes de MG ⚠️

### Customers > Configurações > Pesquisar : modulo_entrada_nota_v2 > Ativar


[Entrada de Notas - V2 - Funcionalidades](https://www.notion.so/24300ee50e908128aefbf87035536fb3)

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/851a0ee2-55f6-4058-986d-90d4ae3fd4d2/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4665A4V4VEI%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105307Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJHMEUCIQDpzLLYSKqrc9dZWSOiZ6W7U5ik%2BvURGFAMM3jFEsV45gIgHuM8V%2Bo0K0%2BB3PHJ1eCd1IQkweowZDuzdv6NDMLRt0kq%2FwMIGhAAGgw2Mzc0MjMxODM4MDUiDC7J0gQ2xpbQOfc9gCrcA3KHDYV3A88eQKxSpzJ1aqOMz0n3poBORH1MNxJReX6j7z5%2FUPJB0UIhUFgVoDGtM5yoEVvuZaRYYTiILIVaJl5d4bdNq3ov%2BUiM30%2BcWMJkfRAbG8QpZhaUNd0wIdAmhOgHz%2FmbqvmaI%2BYZMfgg%2BImLFTGt4FKnaomZ6exUOr5ndA2h0Isrq%2BbTd4nUQp4mz%2FEJpbLxCc2OImKpR3kBStPMo1kjRgOB0ZtrS%2F4jxGeRNRz0%2F0dlES3dfoxhlyEPfS02FLq7DF0RX%2B6wBbiyBLCfaA9k0wrUkhB8qSmbfoWf2cck3vcKBQi4f4DzZZRNamIGILsmxqNfZV7cP%2Bzb2kNTjiCGzcqMMBWkSwMXmr%2BWvK5RrDXDd9EJnb%2FUXDsv2VhCOqok3OLkoSRYwVeG9JeriETFp8evPd%2BnmDdv4PNuIkPXpBhfOyW5PTHOGKAFDM46UHPIqRtdnZPMX0rz9KtJPbnczKfI%2F9Qidyc%2BgffpiXmRGRWMI6xU36pqOr%2FLOzOxBBFd7ZcnDMn8ntmA%2BKBHIfMcduUg2US9w0BYfrh1yoT0IxUwc%2F7RWAfHA1UqP4%2Broj%2B6FLJX%2Fq867LPvF6uo3fyw58u%2Bbkftm5gBq7NW8lzj1bXtPtyRUzuJMIW%2FwNAGOqUB28aExuROdEjkcwhVwIbsOhqFNKkigvNQbW1VK8uYPT9U0BGgvKGKT%2BoxoadSjT1bWmGJiuhmZOMFg1SF2Pw%2BAWr%2BgeaDjBQJdzC%2B2OSaRuPiInJWFil1kIX5EU25No%2B5my2pzDy3Bay6%2BQvaTrvufNBuNMFHGrsBNCY0METjMcDepIr75kbmUqg73eKbwwrOBDQDseVQ9Xk6Yjvzf6HGfkWjgrCs&X-Amz-Signature=5c66367c4975672abbe32824ee09d46b65cda65794ed2554c9d59770f89be5ca&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)
