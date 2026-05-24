---
title: "Ativação - App"
category: "Perguntas Frequentes"
source: "https://www.notion.so/Ativa-o-App-24300ee50e90813a9543d98ef972ab41"
scraped_at: "2026-05-22T10:52:26.224Z"
---

# Ativação - App

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

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/eae1b590-0aff-440f-8767-ed39009f0321/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664QGQK5YD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105225Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIH6M%2BLMEYb49crEosYtpZ%2BIUoiWPFvsi1jW3ouSJd%2B33AiBkVCxMQy6Lt1MPzt6RdofkOn0sp3UcYQGgHZQKOiZi6yr%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMx1HTswLrkv%2FCLB2bKtwDvGP469uj35X%2B8bbbWJYsO%2BUQWwmE2QA7SkPsCf1dz8arZM%2Fw68hhsX%2FsiYK85A2oy6W1WlI3SXE7WMESWDF4Ml0%2FUvSyTpHhDBgBzClTfDphqp9eXKbnX7BTT7kEGrfOW9VTnTXKb70Bak0g4MAXTl46dvd4CAR61D0HqocurGzZCZKoXjS5GDMHe2vbjMoxZ8UB3gnoIp6%2BfMGjrm2lC2r76e0utSdFNceZ%2BF%2F5DBnTdKVtVAjalCx50uRzBYfbSsksr69l0fSCY4hji7Ox5d0W43H5ko5yBB%2F9LNZ7EdBO7PS41Fyr7C%2FuxTjaumFfZZNpCSqTxRq5I7FWNY6kW5jyV8JSV8B5IUK23cSsUFaVP3rtmzLAWYAy6capQsOAoKyhb8oZE%2Fpngfwxbns1scvLl31zcgjKo192V29%2F0H7%2FpjzoB5OS9oDnmAy6T99tQW32VSAJQ8x%2BM2VP46gGxh20P%2B59qet3mkVKiXTJeY04xbz%2BOCkG0SboMP96fqATpL3hVNaNSYUh7Gjx86ZGJfUGPiKPhNMJQ9etY1dcWyStrV8Php4QdOPgGL9ovKmgpRrk4t9RC2MDeUlOg7s%2BKikJZrWjG6zQfU4H91P7BqUOBo7PRQCGPdINCXMwxcDA0AY6pgEkR7UKOcOBfBykuQiTs8EoQBpTRemS5XaMRG8G5fHtgjpCfZi3B%2BiXrehjHSomlE%2FPdJu0TymfTMQATpSGS2%2BrZjAqYA2mBbIjtiEFmX4UE09BaUR7EjNeM98ouu%2BBJRDjhjdjv4211f8%2BiHeVW%2B5rrogaMK2Rfgm23qsYul27FpaOJYtoFLemO7aC75LLo6OYIFTifHdgEJ4zDah0S7uRlKWKJsfW&X-Amz-Signature=5f7e0f044e4b900de58872100ede2071d49936c578636680630122001f450d1d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Só é possivel seguir para o próximo passo se o monitor ficar Verde que significa MFE Disponível.
Após a instalação esperar no mínimo 1 minuto para esperar o monitor responder.
Caso não tenha resposta, vamos tentar reiniciar o monitor:


Acesse a pasta C:\ > Procure uma pasta chamada **Comunicador > Delete a pasta

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/6b82cf74-89c1-4dae-8d80-3b595f92957b/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664QGQK5YD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105225Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIH6M%2BLMEYb49crEosYtpZ%2BIUoiWPFvsi1jW3ouSJd%2B33AiBkVCxMQy6Lt1MPzt6RdofkOn0sp3UcYQGgHZQKOiZi6yr%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMx1HTswLrkv%2FCLB2bKtwDvGP469uj35X%2B8bbbWJYsO%2BUQWwmE2QA7SkPsCf1dz8arZM%2Fw68hhsX%2FsiYK85A2oy6W1WlI3SXE7WMESWDF4Ml0%2FUvSyTpHhDBgBzClTfDphqp9eXKbnX7BTT7kEGrfOW9VTnTXKb70Bak0g4MAXTl46dvd4CAR61D0HqocurGzZCZKoXjS5GDMHe2vbjMoxZ8UB3gnoIp6%2BfMGjrm2lC2r76e0utSdFNceZ%2BF%2F5DBnTdKVtVAjalCx50uRzBYfbSsksr69l0fSCY4hji7Ox5d0W43H5ko5yBB%2F9LNZ7EdBO7PS41Fyr7C%2FuxTjaumFfZZNpCSqTxRq5I7FWNY6kW5jyV8JSV8B5IUK23cSsUFaVP3rtmzLAWYAy6capQsOAoKyhb8oZE%2Fpngfwxbns1scvLl31zcgjKo192V29%2F0H7%2FpjzoB5OS9oDnmAy6T99tQW32VSAJQ8x%2BM2VP46gGxh20P%2B59qet3mkVKiXTJeY04xbz%2BOCkG0SboMP96fqATpL3hVNaNSYUh7Gjx86ZGJfUGPiKPhNMJQ9etY1dcWyStrV8Php4QdOPgGL9ovKmgpRrk4t9RC2MDeUlOg7s%2BKikJZrWjG6zQfU4H91P7BqUOBo7PRQCGPdINCXMwxcDA0AY6pgEkR7UKOcOBfBykuQiTs8EoQBpTRemS5XaMRG8G5fHtgjpCfZi3B%2BiXrehjHSomlE%2FPdJu0TymfTMQATpSGS2%2BrZjAqYA2mBbIjtiEFmX4UE09BaUR7EjNeM98ouu%2BBJRDjhjdjv4211f8%2BiHeVW%2B5rrogaMK2Rfgm23qsYul27FpaOJYtoFLemO7aC75LLo6OYIFTifHdgEJ4zDah0S7uRlKWKJsfW&X-Amz-Signature=176fa4e33a85dc0ab9b354436f5f4dc681da6fe540984c8362eaf51757cdcfc6&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Abra o gerenciador de tarefas > Serviços > **Reiniciar Comunicador

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/c4f554b1-5ca5-4a8e-bed9-f07fb838d8a3/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664QGQK5YD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105225Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIH6M%2BLMEYb49crEosYtpZ%2BIUoiWPFvsi1jW3ouSJd%2B33AiBkVCxMQy6Lt1MPzt6RdofkOn0sp3UcYQGgHZQKOiZi6yr%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMx1HTswLrkv%2FCLB2bKtwDvGP469uj35X%2B8bbbWJYsO%2BUQWwmE2QA7SkPsCf1dz8arZM%2Fw68hhsX%2FsiYK85A2oy6W1WlI3SXE7WMESWDF4Ml0%2FUvSyTpHhDBgBzClTfDphqp9eXKbnX7BTT7kEGrfOW9VTnTXKb70Bak0g4MAXTl46dvd4CAR61D0HqocurGzZCZKoXjS5GDMHe2vbjMoxZ8UB3gnoIp6%2BfMGjrm2lC2r76e0utSdFNceZ%2BF%2F5DBnTdKVtVAjalCx50uRzBYfbSsksr69l0fSCY4hji7Ox5d0W43H5ko5yBB%2F9LNZ7EdBO7PS41Fyr7C%2FuxTjaumFfZZNpCSqTxRq5I7FWNY6kW5jyV8JSV8B5IUK23cSsUFaVP3rtmzLAWYAy6capQsOAoKyhb8oZE%2Fpngfwxbns1scvLl31zcgjKo192V29%2F0H7%2FpjzoB5OS9oDnmAy6T99tQW32VSAJQ8x%2BM2VP46gGxh20P%2B59qet3mkVKiXTJeY04xbz%2BOCkG0SboMP96fqATpL3hVNaNSYUh7Gjx86ZGJfUGPiKPhNMJQ9etY1dcWyStrV8Php4QdOPgGL9ovKmgpRrk4t9RC2MDeUlOg7s%2BKikJZrWjG6zQfU4H91P7BqUOBo7PRQCGPdINCXMwxcDA0AY6pgEkR7UKOcOBfBykuQiTs8EoQBpTRemS5XaMRG8G5fHtgjpCfZi3B%2BiXrehjHSomlE%2FPdJu0TymfTMQATpSGS2%2BrZjAqYA2mBbIjtiEFmX4UE09BaUR7EjNeM98ouu%2BBJRDjhjdjv4211f8%2BiHeVW%2B5rrogaMK2Rfgm23qsYul27FpaOJYtoFLemO7aC75LLo6OYIFTifHdgEJ4zDah0S7uRlKWKJsfW&X-Amz-Signature=96d9432254890fb147b131f0bf421fbce59a435d4ee3af8c7c345ffa31494eca&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

Aguarde para ver se o monitor ficou verde, caso não, peça o cliente trocar porta usb, desligar e ligar o MFe.

**5 - Ativação e Associação
**Entre no Portal do MFe (Software House) **[https://cfe.sefaz.ce.gov.br/mfe#/](**https://cfe.sefaz.ce.gov.br/mfe#/**)**
Esse site serve para associar a empresa do nosso cliente ao CNPJ da Yooga.
Ele não associa o MFe, somente o CNPJ da empresa, quem associa o MFe ao CNPJ do cliente é a contabilidade, então não tem como ativar o MFE se ele não foi associado pela contabilidade.

**Acesso Restrito > Software Houses
![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/2361098b-64b9-4104-96a9-935afaf2fbb8/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664QGQK5YD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105225Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIH6M%2BLMEYb49crEosYtpZ%2BIUoiWPFvsi1jW3ouSJd%2B33AiBkVCxMQy6Lt1MPzt6RdofkOn0sp3UcYQGgHZQKOiZi6yr%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMx1HTswLrkv%2FCLB2bKtwDvGP469uj35X%2B8bbbWJYsO%2BUQWwmE2QA7SkPsCf1dz8arZM%2Fw68hhsX%2FsiYK85A2oy6W1WlI3SXE7WMESWDF4Ml0%2FUvSyTpHhDBgBzClTfDphqp9eXKbnX7BTT7kEGrfOW9VTnTXKb70Bak0g4MAXTl46dvd4CAR61D0HqocurGzZCZKoXjS5GDMHe2vbjMoxZ8UB3gnoIp6%2BfMGjrm2lC2r76e0utSdFNceZ%2BF%2F5DBnTdKVtVAjalCx50uRzBYfbSsksr69l0fSCY4hji7Ox5d0W43H5ko5yBB%2F9LNZ7EdBO7PS41Fyr7C%2FuxTjaumFfZZNpCSqTxRq5I7FWNY6kW5jyV8JSV8B5IUK23cSsUFaVP3rtmzLAWYAy6capQsOAoKyhb8oZE%2Fpngfwxbns1scvLl31zcgjKo192V29%2F0H7%2FpjzoB5OS9oDnmAy6T99tQW32VSAJQ8x%2BM2VP46gGxh20P%2B59qet3mkVKiXTJeY04xbz%2BOCkG0SboMP96fqATpL3hVNaNSYUh7Gjx86ZGJfUGPiKPhNMJQ9etY1dcWyStrV8Php4QdOPgGL9ovKmgpRrk4t9RC2MDeUlOg7s%2BKikJZrWjG6zQfU4H91P7BqUOBo7PRQCGPdINCXMwxcDA0AY6pgEkR7UKOcOBfBykuQiTs8EoQBpTRemS5XaMRG8G5fHtgjpCfZi3B%2BiXrehjHSomlE%2FPdJu0TymfTMQATpSGS2%2BrZjAqYA2mBbIjtiEFmX4UE09BaUR7EjNeM98ouu%2BBJRDjhjdjv4211f8%2BiHeVW%2B5rrogaMK2Rfgm23qsYul27FpaOJYtoFLemO7aC75LLo6OYIFTifHdgEJ4zDah0S7uRlKWKJsfW&X-Amz-Signature=bfc050014b4b4d2c4b3b06a4c9d9dcdab501df7373031cf3b4ebad81f91c9ebc&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

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

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/cd7caf37-c43b-4014-9f6b-100de11e90e6/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664QGQK5YD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105225Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIH6M%2BLMEYb49crEosYtpZ%2BIUoiWPFvsi1jW3ouSJd%2B33AiBkVCxMQy6Lt1MPzt6RdofkOn0sp3UcYQGgHZQKOiZi6yr%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMx1HTswLrkv%2FCLB2bKtwDvGP469uj35X%2B8bbbWJYsO%2BUQWwmE2QA7SkPsCf1dz8arZM%2Fw68hhsX%2FsiYK85A2oy6W1WlI3SXE7WMESWDF4Ml0%2FUvSyTpHhDBgBzClTfDphqp9eXKbnX7BTT7kEGrfOW9VTnTXKb70Bak0g4MAXTl46dvd4CAR61D0HqocurGzZCZKoXjS5GDMHe2vbjMoxZ8UB3gnoIp6%2BfMGjrm2lC2r76e0utSdFNceZ%2BF%2F5DBnTdKVtVAjalCx50uRzBYfbSsksr69l0fSCY4hji7Ox5d0W43H5ko5yBB%2F9LNZ7EdBO7PS41Fyr7C%2FuxTjaumFfZZNpCSqTxRq5I7FWNY6kW5jyV8JSV8B5IUK23cSsUFaVP3rtmzLAWYAy6capQsOAoKyhb8oZE%2Fpngfwxbns1scvLl31zcgjKo192V29%2F0H7%2FpjzoB5OS9oDnmAy6T99tQW32VSAJQ8x%2BM2VP46gGxh20P%2B59qet3mkVKiXTJeY04xbz%2BOCkG0SboMP96fqATpL3hVNaNSYUh7Gjx86ZGJfUGPiKPhNMJQ9etY1dcWyStrV8Php4QdOPgGL9ovKmgpRrk4t9RC2MDeUlOg7s%2BKikJZrWjG6zQfU4H91P7BqUOBo7PRQCGPdINCXMwxcDA0AY6pgEkR7UKOcOBfBykuQiTs8EoQBpTRemS5XaMRG8G5fHtgjpCfZi3B%2BiXrehjHSomlE%2FPdJu0TymfTMQATpSGS2%2BrZjAqYA2mBbIjtiEFmX4UE09BaUR7EjNeM98ouu%2BBJRDjhjdjv4211f8%2BiHeVW%2B5rrogaMK2Rfgm23qsYul27FpaOJYtoFLemO7aC75LLo6OYIFTifHdgEJ4zDah0S7uRlKWKJsfW&X-Amz-Signature=1ad726d2d401343830c4cfdca502fc38444d4059cb2cffa388353c5a87e30e8e&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/5795e47d-166a-43d0-91d6-ec705dd77ecd/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4664QGQK5YD%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105225Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIH6M%2BLMEYb49crEosYtpZ%2BIUoiWPFvsi1jW3ouSJd%2B33AiBkVCxMQy6Lt1MPzt6RdofkOn0sp3UcYQGgHZQKOiZi6yr%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMx1HTswLrkv%2FCLB2bKtwDvGP469uj35X%2B8bbbWJYsO%2BUQWwmE2QA7SkPsCf1dz8arZM%2Fw68hhsX%2FsiYK85A2oy6W1WlI3SXE7WMESWDF4Ml0%2FUvSyTpHhDBgBzClTfDphqp9eXKbnX7BTT7kEGrfOW9VTnTXKb70Bak0g4MAXTl46dvd4CAR61D0HqocurGzZCZKoXjS5GDMHe2vbjMoxZ8UB3gnoIp6%2BfMGjrm2lC2r76e0utSdFNceZ%2BF%2F5DBnTdKVtVAjalCx50uRzBYfbSsksr69l0fSCY4hji7Ox5d0W43H5ko5yBB%2F9LNZ7EdBO7PS41Fyr7C%2FuxTjaumFfZZNpCSqTxRq5I7FWNY6kW5jyV8JSV8B5IUK23cSsUFaVP3rtmzLAWYAy6capQsOAoKyhb8oZE%2Fpngfwxbns1scvLl31zcgjKo192V29%2F0H7%2FpjzoB5OS9oDnmAy6T99tQW32VSAJQ8x%2BM2VP46gGxh20P%2B59qet3mkVKiXTJeY04xbz%2BOCkG0SboMP96fqATpL3hVNaNSYUh7Gjx86ZGJfUGPiKPhNMJQ9etY1dcWyStrV8Php4QdOPgGL9ovKmgpRrk4t9RC2MDeUlOg7s%2BKikJZrWjG6zQfU4H91P7BqUOBo7PRQCGPdINCXMwxcDA0AY6pgEkR7UKOcOBfBykuQiTs8EoQBpTRemS5XaMRG8G5fHtgjpCfZi3B%2BiXrehjHSomlE%2FPdJu0TymfTMQATpSGS2%2BrZjAqYA2mBbIjtiEFmX4UE09BaUR7EjNeM98ouu%2BBJRDjhjdjv4211f8%2BiHeVW%2B5rrogaMK2Rfgm23qsYul27FpaOJYtoFLemO7aC75LLo6OYIFTifHdgEJ4zDah0S7uRlKWKJsfW&X-Amz-Signature=da2f7840ed35709ac244df990eac8de42cdf8469974374aad3433172677bd90f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)


Informe o CNPJ do cliente e o código de vinculação e clique em **Salvar**.


**Não feche o gerador ainda, mais para frente vamos usar.
Agora o processo é dentro do ativador do MFe;

Consulte o Modulo via DLL

 vai ser necessário ativar e depois associar a Yooga, usar a mesma assinatura, lembrando sempre usar nosso código padrão de ativação 00000000 que são os oitos zeros.

**Feito isso é só fazer uma venda e ver se vai emitir certinho.