---
title: "Ceará/CE - Informação sobre MFE e NFCe"
category: "Perguntas Frequentes"
source: "https://www.notion.so/Cear-CE-Informa-o-sobre-MFE-e-NFCe-24300ee50e9081a9a575e9026c9c7bda"
scraped_at: "2026-05-22T10:52:41.043Z"
---

# Ceará/CE - Informação sobre MFE e NFCe

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

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/5795e47d-166a-43d0-91d6-ec705dd77ecd/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4665S7IH5TC%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105239Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIHoUgooEIwRNIaFfRfm7NQQAG0%2FqcokfxBdhwoYgSAFDAiEA7TknP2%2FWPHoY%2B0d6xZuNtGkmsAIKlm79b8BPBoJCKw0q%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDEIqrg1rYvLW6cxCNyrcA8uTpMICy0pr314pbjpuwvnFjyaEk%2FOZLDcahy1PBX26bVvD6lHBJkvTpeVf9jwUm%2B5dVe%2Blsh8lC6TOwebt6bDqZemeQi7ibSMt%2BjT90tk%2Fy0zrxsCrzIBHPf7xRiIMHyJWDKC26W2bPYH3g%2Bf74XfHLqOmJBmItSzu8BgXNcMnfeP%2FNdsqnVjp91fzdP1hDv3%2FvB5L21NaueWdjDNR3vX6ikUkmjaSClkLByCjKvfygnXs%2B5ibvH7RERmWWf5fpgJx0hsVwbmCgi62kiG6duW3q3foqskD%2B6M3mpA3nyx8liceOAj7aLG7Ce%2BbmRwTQqc7CKRCEUG6QwQUSuwyNdCbP%2Fk7T5rGqbDN1TJvnlEe0aSMyEt3qrf%2BZsP%2FS9P%2Bfix781MZGvFper%2FNXiPTHU3WcyI4DO%2BOff7p9GPj47Px4v0Nb1HXIHHw%2Brh3wXaJrHTq5m1aK700DI%2FZ7yEV2US1YRlsQxIZxWddvX5ALABzgyOoSrhQx%2FeCwT%2B18A79il%2FWfA%2FZx%2FL4vAEjSWCLYd7xue6dAZVEbSj%2FpuSrFjV7QR9GlXMoBLnzC5QG2dZSNImwvEosXSOFaUa2tJsr5RySMrxXMnMLAkp7gI4oeQqIBt5w1ziIm2iiGOALMPHowNAGOqUBlqDStcRLV1xH%2FP0jgb7nJ2y7IWx6W79j6LhEnumgp4UZWNGHChcpjF6xtGIHZgkaKUhLgVL77da5XdymFyZQya1%2BVWGlov0%2BYj29v9vfAIRDyNc9aFa%2BZ6yX1W%2FoBF%2BghbaJhtjXp%2FdXWNvRERfttJUNKYF3KZmC%2BioAhfD1AilWnz%2BH7a2WYatW41gBXuesr95AklePZPis0hYonrJUGVier4nj&X-Amz-Signature=cd22e447d29261f0dd1400ecc05ef9aa41966f498439efdd4c2ab998a9d71900&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

O Código de Vinculação AC é gerado através de um software, usando o CNPJ do contribuinte e Software House e Certificado da Software House.

Não feche o gerador ainda, mais para frente vamos usar.

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/cd7caf37-c43b-4014-9f6b-100de11e90e6/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4665S7IH5TC%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105239Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIHoUgooEIwRNIaFfRfm7NQQAG0%2FqcokfxBdhwoYgSAFDAiEA7TknP2%2FWPHoY%2B0d6xZuNtGkmsAIKlm79b8BPBoJCKw0q%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDEIqrg1rYvLW6cxCNyrcA8uTpMICy0pr314pbjpuwvnFjyaEk%2FOZLDcahy1PBX26bVvD6lHBJkvTpeVf9jwUm%2B5dVe%2Blsh8lC6TOwebt6bDqZemeQi7ibSMt%2BjT90tk%2Fy0zrxsCrzIBHPf7xRiIMHyJWDKC26W2bPYH3g%2Bf74XfHLqOmJBmItSzu8BgXNcMnfeP%2FNdsqnVjp91fzdP1hDv3%2FvB5L21NaueWdjDNR3vX6ikUkmjaSClkLByCjKvfygnXs%2B5ibvH7RERmWWf5fpgJx0hsVwbmCgi62kiG6duW3q3foqskD%2B6M3mpA3nyx8liceOAj7aLG7Ce%2BbmRwTQqc7CKRCEUG6QwQUSuwyNdCbP%2Fk7T5rGqbDN1TJvnlEe0aSMyEt3qrf%2BZsP%2FS9P%2Bfix781MZGvFper%2FNXiPTHU3WcyI4DO%2BOff7p9GPj47Px4v0Nb1HXIHHw%2Brh3wXaJrHTq5m1aK700DI%2FZ7yEV2US1YRlsQxIZxWddvX5ALABzgyOoSrhQx%2FeCwT%2B18A79il%2FWfA%2FZx%2FL4vAEjSWCLYd7xue6dAZVEbSj%2FpuSrFjV7QR9GlXMoBLnzC5QG2dZSNImwvEosXSOFaUa2tJsr5RySMrxXMnMLAkp7gI4oeQqIBt5w1ziIm2iiGOALMPHowNAGOqUBlqDStcRLV1xH%2FP0jgb7nJ2y7IWx6W79j6LhEnumgp4UZWNGHChcpjF6xtGIHZgkaKUhLgVL77da5XdymFyZQya1%2BVWGlov0%2BYj29v9vfAIRDyNc9aFa%2BZ6yX1W%2FoBF%2BghbaJhtjXp%2FdXWNvRERfttJUNKYF3KZmC%2BioAhfD1AilWnz%2BH7a2WYatW41gBXuesr95AklePZPis0hYonrJUGVier4nj&X-Amz-Signature=0cc5f185b6b1f5965bac9533900734ff2395283d705027a3348f60eb204e7506&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

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

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/eae1b590-0aff-440f-8767-ed39009f0321/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YUEFFPN7%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105240Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQCgI%2FCES2g35Mj5efHSAgXSm%2FE%2FFY7a4l5apu8mFEOawwIhALPn38weKqsoFUFR6bik18Fj3mNUxTBLnoXdXNJuFThFKv8DCBsQABoMNjM3NDIzMTgzODA1IgyTEYX1MgNtW81MqS8q3AOdH%2ByL8jb%2FgwhKqW997bEHpJ6ejiOonh2dPuypoUzLUJluVL8xX%2BSBMsc8acpZ1yawr6ep1pqs5HdBPn0HCLZ80skeB1fL2wavqvsZTKfm0oxaTiotLRDT6A5RUKcAxCSgKf34aoXEz5mI%2BBGVCyp01qvHt3aIrnACcrENx9JkUk8uq0d8N2uMRB31Sfkz2AsUkhIgM%2FdkYfK45KZFgFK9EuZN8qXgGSx67udz9iQrfddGaN7nxRFI5NLab2%2Be9nBelYWHj5eTuJ%2F6zAFn6w%2Bvxp6uPbE5AYChup3%2F2B40BbZZ7inx102hzBN0WqYd1Fx0h9no0FkVdZYvBdRvl0xgBels1tVyaMmrKidR00oJiX6immlEt1VB9bUzWiJJ7Sl%2B2Tt8YxEXHSs5hPD8mmo4r6zfML5rlhtknbhxRy6DaQJu%2F5283lv3QWfrGBeVYVzuxNLOP8LKMu7XMsSjBdwFOgnSIL8Nq87g9eUTm3oD3U759IxY7s3QqTOTQ%2FefmEnlmiPc6ayGjO3p9F8hbT5%2FgFRDebwSWsJJIxPE1%2B1sSNWDnj8avi441OLCOb34a8irTGrYLdaE9Yh1yUM%2BZpHAoSgTEHKzP3GCx6vl0LCQUJGtja2IHdj0iv%2BrDjD22sDQBjqkAZcFgGLoNiKIqyuzhVD832NsMigVDwQNcFzcgVsLxcAKFKR99dFxFaTmt56Jq6%2FEvsTTlEB8QVUln5EgOviOLM3HdNJVCYp%2By0tUCjy7WbnoURfZ2GH6UYZbpeE6BEggSjG3ZAx0oyIdehLqnufuQh2maq4OIsRkF67n2b9tINl5cC6ZPIh2oa8P3B9ai326IHGYgjFVnB%2FjBGeYqFAY3FJTH8AA&X-Amz-Signature=a72f1a23812fc9d4ee328c846783cbf25e7cb9c50832805e5aff86e061e3d49d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Só é possivel seguir para o próximo passo se o monitor ficar Verde que significa MFE Disponível.
Após a instalação esperar no mínimo 1 minuto para esperar o monitor responder.
Caso não tenha resposta, vamos tentar reiniciar o monitor:


Acesse a pasta C:\ > Procure uma pasta chamada **Comunicador > Delete a pasta

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/6b82cf74-89c1-4dae-8d80-3b595f92957b/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YUEFFPN7%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105240Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQCgI%2FCES2g35Mj5efHSAgXSm%2FE%2FFY7a4l5apu8mFEOawwIhALPn38weKqsoFUFR6bik18Fj3mNUxTBLnoXdXNJuFThFKv8DCBsQABoMNjM3NDIzMTgzODA1IgyTEYX1MgNtW81MqS8q3AOdH%2ByL8jb%2FgwhKqW997bEHpJ6ejiOonh2dPuypoUzLUJluVL8xX%2BSBMsc8acpZ1yawr6ep1pqs5HdBPn0HCLZ80skeB1fL2wavqvsZTKfm0oxaTiotLRDT6A5RUKcAxCSgKf34aoXEz5mI%2BBGVCyp01qvHt3aIrnACcrENx9JkUk8uq0d8N2uMRB31Sfkz2AsUkhIgM%2FdkYfK45KZFgFK9EuZN8qXgGSx67udz9iQrfddGaN7nxRFI5NLab2%2Be9nBelYWHj5eTuJ%2F6zAFn6w%2Bvxp6uPbE5AYChup3%2F2B40BbZZ7inx102hzBN0WqYd1Fx0h9no0FkVdZYvBdRvl0xgBels1tVyaMmrKidR00oJiX6immlEt1VB9bUzWiJJ7Sl%2B2Tt8YxEXHSs5hPD8mmo4r6zfML5rlhtknbhxRy6DaQJu%2F5283lv3QWfrGBeVYVzuxNLOP8LKMu7XMsSjBdwFOgnSIL8Nq87g9eUTm3oD3U759IxY7s3QqTOTQ%2FefmEnlmiPc6ayGjO3p9F8hbT5%2FgFRDebwSWsJJIxPE1%2B1sSNWDnj8avi441OLCOb34a8irTGrYLdaE9Yh1yUM%2BZpHAoSgTEHKzP3GCx6vl0LCQUJGtja2IHdj0iv%2BrDjD22sDQBjqkAZcFgGLoNiKIqyuzhVD832NsMigVDwQNcFzcgVsLxcAKFKR99dFxFaTmt56Jq6%2FEvsTTlEB8QVUln5EgOviOLM3HdNJVCYp%2By0tUCjy7WbnoURfZ2GH6UYZbpeE6BEggSjG3ZAx0oyIdehLqnufuQh2maq4OIsRkF67n2b9tINl5cC6ZPIh2oa8P3B9ai326IHGYgjFVnB%2FjBGeYqFAY3FJTH8AA&X-Amz-Signature=af2040d304cf8998247308bfb22b91dd890cf16f56ea5f827057b7d933b53843&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Abra o gerenciador de tarefas > Serviços > **Reiniciar Comunicador

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/c4f554b1-5ca5-4a8e-bed9-f07fb838d8a3/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YUEFFPN7%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105240Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQCgI%2FCES2g35Mj5efHSAgXSm%2FE%2FFY7a4l5apu8mFEOawwIhALPn38weKqsoFUFR6bik18Fj3mNUxTBLnoXdXNJuFThFKv8DCBsQABoMNjM3NDIzMTgzODA1IgyTEYX1MgNtW81MqS8q3AOdH%2ByL8jb%2FgwhKqW997bEHpJ6ejiOonh2dPuypoUzLUJluVL8xX%2BSBMsc8acpZ1yawr6ep1pqs5HdBPn0HCLZ80skeB1fL2wavqvsZTKfm0oxaTiotLRDT6A5RUKcAxCSgKf34aoXEz5mI%2BBGVCyp01qvHt3aIrnACcrENx9JkUk8uq0d8N2uMRB31Sfkz2AsUkhIgM%2FdkYfK45KZFgFK9EuZN8qXgGSx67udz9iQrfddGaN7nxRFI5NLab2%2Be9nBelYWHj5eTuJ%2F6zAFn6w%2Bvxp6uPbE5AYChup3%2F2B40BbZZ7inx102hzBN0WqYd1Fx0h9no0FkVdZYvBdRvl0xgBels1tVyaMmrKidR00oJiX6immlEt1VB9bUzWiJJ7Sl%2B2Tt8YxEXHSs5hPD8mmo4r6zfML5rlhtknbhxRy6DaQJu%2F5283lv3QWfrGBeVYVzuxNLOP8LKMu7XMsSjBdwFOgnSIL8Nq87g9eUTm3oD3U759IxY7s3QqTOTQ%2FefmEnlmiPc6ayGjO3p9F8hbT5%2FgFRDebwSWsJJIxPE1%2B1sSNWDnj8avi441OLCOb34a8irTGrYLdaE9Yh1yUM%2BZpHAoSgTEHKzP3GCx6vl0LCQUJGtja2IHdj0iv%2BrDjD22sDQBjqkAZcFgGLoNiKIqyuzhVD832NsMigVDwQNcFzcgVsLxcAKFKR99dFxFaTmt56Jq6%2FEvsTTlEB8QVUln5EgOviOLM3HdNJVCYp%2By0tUCjy7WbnoURfZ2GH6UYZbpeE6BEggSjG3ZAx0oyIdehLqnufuQh2maq4OIsRkF67n2b9tINl5cC6ZPIh2oa8P3B9ai326IHGYgjFVnB%2FjBGeYqFAY3FJTH8AA&X-Amz-Signature=387c1c49b6850c5f8824389bc6898afad31573722e170f36f9f4e9a023939a28&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Aguarde para ver se o monitor ficou verde, caso não, peça o cliente trocar porta usb, desligar e ligar o MFe.

**5 - Ativação e Associação
**Entre no Portal do MFe (Software House) **[https://cfe.sefaz.ce.gov.br/mfe#/](**https://cfe.sefaz.ce.gov.br/mfe#/**)**
Esse site serve para associar a empresa do nosso cliente ao CNPJ da Yooga.
Ele não associa o MFe, somente o CNPJ da empresa, quem associa o MFe ao CNPJ do cliente é a contabilidade, então não tem como ativar o MFE se ele não foi associado pela contabilidade.

**Acesso Restrito > Software Houses
![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/2361098b-64b9-4104-96a9-935afaf2fbb8/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YUEFFPN7%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105240Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQCgI%2FCES2g35Mj5efHSAgXSm%2FE%2FFY7a4l5apu8mFEOawwIhALPn38weKqsoFUFR6bik18Fj3mNUxTBLnoXdXNJuFThFKv8DCBsQABoMNjM3NDIzMTgzODA1IgyTEYX1MgNtW81MqS8q3AOdH%2ByL8jb%2FgwhKqW997bEHpJ6ejiOonh2dPuypoUzLUJluVL8xX%2BSBMsc8acpZ1yawr6ep1pqs5HdBPn0HCLZ80skeB1fL2wavqvsZTKfm0oxaTiotLRDT6A5RUKcAxCSgKf34aoXEz5mI%2BBGVCyp01qvHt3aIrnACcrENx9JkUk8uq0d8N2uMRB31Sfkz2AsUkhIgM%2FdkYfK45KZFgFK9EuZN8qXgGSx67udz9iQrfddGaN7nxRFI5NLab2%2Be9nBelYWHj5eTuJ%2F6zAFn6w%2Bvxp6uPbE5AYChup3%2F2B40BbZZ7inx102hzBN0WqYd1Fx0h9no0FkVdZYvBdRvl0xgBels1tVyaMmrKidR00oJiX6immlEt1VB9bUzWiJJ7Sl%2B2Tt8YxEXHSs5hPD8mmo4r6zfML5rlhtknbhxRy6DaQJu%2F5283lv3QWfrGBeVYVzuxNLOP8LKMu7XMsSjBdwFOgnSIL8Nq87g9eUTm3oD3U759IxY7s3QqTOTQ%2FefmEnlmiPc6ayGjO3p9F8hbT5%2FgFRDebwSWsJJIxPE1%2B1sSNWDnj8avi441OLCOb34a8irTGrYLdaE9Yh1yUM%2BZpHAoSgTEHKzP3GCx6vl0LCQUJGtja2IHdj0iv%2BrDjD22sDQBjqkAZcFgGLoNiKIqyuzhVD832NsMigVDwQNcFzcgVsLxcAKFKR99dFxFaTmt56Jq6%2FEvsTTlEB8QVUln5EgOviOLM3HdNJVCYp%2By0tUCjy7WbnoURfZ2GH6UYZbpeE6BEggSjG3ZAx0oyIdehLqnufuQh2maq4OIsRkF67n2b9tINl5cC6ZPIh2oa8P3B9ai326IHGYgjFVnB%2FjBGeYqFAY3FJTH8AA&X-Amz-Signature=7e2727521cfc1fe4cdc8a1982904f435dfe6a52e95fe206e1bc044eb9db6d263&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

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

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/cd7caf37-c43b-4014-9f6b-100de11e90e6/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YUEFFPN7%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105240Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQCgI%2FCES2g35Mj5efHSAgXSm%2FE%2FFY7a4l5apu8mFEOawwIhALPn38weKqsoFUFR6bik18Fj3mNUxTBLnoXdXNJuFThFKv8DCBsQABoMNjM3NDIzMTgzODA1IgyTEYX1MgNtW81MqS8q3AOdH%2ByL8jb%2FgwhKqW997bEHpJ6ejiOonh2dPuypoUzLUJluVL8xX%2BSBMsc8acpZ1yawr6ep1pqs5HdBPn0HCLZ80skeB1fL2wavqvsZTKfm0oxaTiotLRDT6A5RUKcAxCSgKf34aoXEz5mI%2BBGVCyp01qvHt3aIrnACcrENx9JkUk8uq0d8N2uMRB31Sfkz2AsUkhIgM%2FdkYfK45KZFgFK9EuZN8qXgGSx67udz9iQrfddGaN7nxRFI5NLab2%2Be9nBelYWHj5eTuJ%2F6zAFn6w%2Bvxp6uPbE5AYChup3%2F2B40BbZZ7inx102hzBN0WqYd1Fx0h9no0FkVdZYvBdRvl0xgBels1tVyaMmrKidR00oJiX6immlEt1VB9bUzWiJJ7Sl%2B2Tt8YxEXHSs5hPD8mmo4r6zfML5rlhtknbhxRy6DaQJu%2F5283lv3QWfrGBeVYVzuxNLOP8LKMu7XMsSjBdwFOgnSIL8Nq87g9eUTm3oD3U759IxY7s3QqTOTQ%2FefmEnlmiPc6ayGjO3p9F8hbT5%2FgFRDebwSWsJJIxPE1%2B1sSNWDnj8avi441OLCOb34a8irTGrYLdaE9Yh1yUM%2BZpHAoSgTEHKzP3GCx6vl0LCQUJGtja2IHdj0iv%2BrDjD22sDQBjqkAZcFgGLoNiKIqyuzhVD832NsMigVDwQNcFzcgVsLxcAKFKR99dFxFaTmt56Jq6%2FEvsTTlEB8QVUln5EgOviOLM3HdNJVCYp%2By0tUCjy7WbnoURfZ2GH6UYZbpeE6BEggSjG3ZAx0oyIdehLqnufuQh2maq4OIsRkF67n2b9tINl5cC6ZPIh2oa8P3B9ai326IHGYgjFVnB%2FjBGeYqFAY3FJTH8AA&X-Amz-Signature=b1b15d72ea9a88d547d146502704a23a490db91daccef5eeec44d501b6b366c4&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/5795e47d-166a-43d0-91d6-ec705dd77ecd/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YUEFFPN7%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105240Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQCgI%2FCES2g35Mj5efHSAgXSm%2FE%2FFY7a4l5apu8mFEOawwIhALPn38weKqsoFUFR6bik18Fj3mNUxTBLnoXdXNJuFThFKv8DCBsQABoMNjM3NDIzMTgzODA1IgyTEYX1MgNtW81MqS8q3AOdH%2ByL8jb%2FgwhKqW997bEHpJ6ejiOonh2dPuypoUzLUJluVL8xX%2BSBMsc8acpZ1yawr6ep1pqs5HdBPn0HCLZ80skeB1fL2wavqvsZTKfm0oxaTiotLRDT6A5RUKcAxCSgKf34aoXEz5mI%2BBGVCyp01qvHt3aIrnACcrENx9JkUk8uq0d8N2uMRB31Sfkz2AsUkhIgM%2FdkYfK45KZFgFK9EuZN8qXgGSx67udz9iQrfddGaN7nxRFI5NLab2%2Be9nBelYWHj5eTuJ%2F6zAFn6w%2Bvxp6uPbE5AYChup3%2F2B40BbZZ7inx102hzBN0WqYd1Fx0h9no0FkVdZYvBdRvl0xgBels1tVyaMmrKidR00oJiX6immlEt1VB9bUzWiJJ7Sl%2B2Tt8YxEXHSs5hPD8mmo4r6zfML5rlhtknbhxRy6DaQJu%2F5283lv3QWfrGBeVYVzuxNLOP8LKMu7XMsSjBdwFOgnSIL8Nq87g9eUTm3oD3U759IxY7s3QqTOTQ%2FefmEnlmiPc6ayGjO3p9F8hbT5%2FgFRDebwSWsJJIxPE1%2B1sSNWDnj8avi441OLCOb34a8irTGrYLdaE9Yh1yUM%2BZpHAoSgTEHKzP3GCx6vl0LCQUJGtja2IHdj0iv%2BrDjD22sDQBjqkAZcFgGLoNiKIqyuzhVD832NsMigVDwQNcFzcgVsLxcAKFKR99dFxFaTmt56Jq6%2FEvsTTlEB8QVUln5EgOviOLM3HdNJVCYp%2By0tUCjy7WbnoURfZ2GH6UYZbpeE6BEggSjG3ZAx0oyIdehLqnufuQh2maq4OIsRkF67n2b9tINl5cC6ZPIh2oa8P3B9ai326IHGYgjFVnB%2FjBGeYqFAY3FJTH8AA&X-Amz-Signature=bf9dce1c11093cbad5135e0bf081d72a663729db587b8e14bfbdb65dcd86cd71&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


Informe o CNPJ do cliente e o código de vinculação e clique em **Salvar**.


**Não feche o gerador ainda, mais para frente vamos usar.
Agora o processo é dentro do ativador do MFe;

Consulte o Modulo via DLL

 vai ser necessário ativar e depois associar a Yooga, usar a mesma assinatura, lembrando sempre usar nosso código padrão de ativação 00000000 que são os oitos zeros.

**Feito isso é só fazer uma venda e ver se vai emitir certinho.