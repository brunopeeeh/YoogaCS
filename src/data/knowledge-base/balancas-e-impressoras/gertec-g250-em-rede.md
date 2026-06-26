---
title: "Gertec G250 em REDE"
category: "Balancas E Impressoras"
source: "https://www.notion.so/Gertec-G250-em-REDE-24300ee50e9081a28daac6695d2659d7"
scraped_at: "2026-05-22T10:51:02.187Z"
---

# Gertec G250 em REDE

## Como configurar

**1.** Peça para o parceiro deixar a impressora conectada via USB para instalação. Se já estiver conectada via rede não tem problema, mas garanta que o USB esteja conectado.

**2.** Baixe a pasta em_ _[_github.com/gertecdeveloper/G250-G250W_](https://github.com/gertecdeveloper/G250-G250W)_ > Code > Download zip_

![Imagem](https://lh7-us.googleusercontent.com/tjoGPLsFvivE9MAbkkX9-lBnKC769kY2A5U8Fto2cC_WDmGbz61P9EWAm1vznTYtmo2d6VZYS5Sgh-yHHhhZdIZi-PR4iYUKN9fTakDicU2K3mkTTGwlhWq0CFlOx1f-fF_aMvzMgCaK9G8SFx6BZnw)

**3.** Descompacte a pasta e abra a pasta _G250Utility_Customer Beta v2.34 - Configurador rede\_ e execute o arquivo que está nela.*

**4. **Marque _USB_ (1), marque apenas _USB Printing Device_ (2) e então em _Interfaces Test_ (3). A bolinha ficando verde, a conexão via USB foi bem sucedida

![Imagem](https://lh7-us.googleusercontent.com/bSIxvS6jSgOafyRPK6EaaIU5N6IHSHmGnUzXENwTvjbXaiV4PecvxLQc95NzkbwWeNLTrbFYenBVEo-6rNfsYdd45Y2D4FRPzXJ2EyZr48S3Oix5i5pvtHJ3YlqxkMevfLoIMVypxOxg-xXw0uEcMww)

**5.** Agora, clique em _Parameter Setting_ (1) e depois em _Load_ (2). Ao clicar, mais embaixo, em _Communication Parameter Setting_, vai aparecer o _IP_ e _Gateway_ padrões.

![Imagem](https://lh7-us.googleusercontent.com/Xcm8YdnPBFOJkT3YiYGy1pQ-dhUY_CwcO3G9WiC9vVfylXwortjuRYCnE9Sep2eh2JHyuT4dpKAk8obYhL5q5HRtrxs98P39bGk6raDB38NcTWCqoIQpLDtpwrLJQrZZ7SmggO0i0Lw1P12WMiM3HaI)

**6. **Você deve verificar pelo CMD se esse IP mostrado está na mesma faixa de IP do computador. Abra o CMD pelo Menu Iniciar do Windows e digite _ipconfig_ e dê enter.

![Imagem](https://lh7-us.googleusercontent.com/ZghFWDIqbdBeVuWS2-P35LWejlXdBFNvqprDd2VeVlidyHzh5rbOpkBZXu-sl1GL0E2XQQZLVT5U5MQjEMoFzeF7oqLYJsbluCrSO42qqGx9jXgSi7NNjGEipnxMGKbKUo9YmDwELG-22zTNnZ-zQVU)

Vamos pegar o exemplo do IP acima (192.168.43.100). Se aparecer 192.168.43.x em _Endereço IPv4_, o IP do computador está na mesma faixa do IP da impressora.

Se não estiver (que normalmente é o caso), você deve trocar o IP da impressora. Vamos dizer que o _ipconfig_ retornou 192.168.5.1 em _Endereço IPv4_. Troque o IP da impressora assim:

![Imagem](https://lh7-us.googleusercontent.com/B-kj_dNzBDYyHFMCoioVFlKj8Es2Z4xKB_bLTGUDTITACFFo7KPj6_kdyCNSk2weL8lQcpPBFzo2s6xbQyD7klDGOH8bEZ1Vvta7GaV4fhqBT04vHCmY-bh2tuJVhAGw5pAxpspWzar1Xy11K690Xb4)

**Mas como saber qual IP colocar?
No CMD, você pode digitar _arp -a_ para ver os IPs já utilizados e não escolher um deles por engano.

![Imagem](https://lh7-us.googleusercontent.com/SViKVh68RsWNH9enhpHcGNp6htdnBk2aXZHkMvzywcq8-LWP5RZIdSfR7QVUeyvpOncFT4MwgSpEO_5Qc6Wq8D4tBtNgAJ-fqPZcDLSZlufPkr7RWgWMDo8ZlqsGfovNIHAnmxTFw3LoCOmbS1NgnH0)

Então poderá escolher qualquer IP que não esteja na lista, aleatoriamente, de .2 até .253.

Para testar o IP, digite _ping + IP_ no CMD. Exemplo:

![Imagem](https://lh7-us.googleusercontent.com/59rD9pKFwUAwNEbufNDFCM-XY3IXuuvH_vQxxoRpVWCqIv3BUeuUONV-f2Mq-6iBqKySYo5TaiWAsdbXMTzpYXRYxdnItYqKm-IGpgKBsG2c5liUMeJEwQ2_Iq3Bzba4801vJ7S0F2ihxrSZWbLksio)

Olhe apenas para a porcentagem. Se estiver 0% você pode usar esse IP.

**7.** Após trocar o IP, peça para o parceiro desligar e ligar a impressora pelo botão, para que a impressora valide o novo IP.

**8.** Agora, garanta com o parceiro que a impressora está conectada via rede.

**9.** Após a confirmação, marque _Ethernet _(1), escreva o IP novo (2), marque apenas _Ethernet (3) e Send (4)._ A bolinha ficando verde, a conexão via rede foi bem sucedida.

![Imagem](https://lh7-us.googleusercontent.com/HdmRiVE38nc_3nCL6RzLNHKumiqyxsj40UTD18fK3QZmktcHBKRUQjmWi7a1fBhwg4fUXSDEverl8ZP_oqIFJ1Ea8D-W0kFEgE0OmfPZvRCHNzNqHRmfmLDZXXJ2-yqc9wR2mcby3fH1s_0lwkw6ztc)

**10.** Agora na pasta _\Driver_Spooler_Ferramentas\Driver G250 Spooler_VCOM\_ execute o arquivo _Driver G250 Spooler_VCOM._

![Imagem](https://lh7-us.googleusercontent.com/Y7t1_JWjdVqFR3S23MEi9sor4IgoAObHL7DjkjuG2gQdYJcO3qlf4PJyLfWShdLXDYGY64Dsx8gMdkhRNpSvjzNIx6CECrZsz7VNOg17FMqKjXCwgZHCgb-9FZW7SJGSEbERGqlYwyue2nK8Y-UXtpg)

**11.** Terminando a instalação, o driver aparecerá na lista de impressoras e você poderá criar a porta no IP definido. Avance até concluir.

![Imagem](https://lh7-us.googleusercontent.com/FXKniOkYqNgRBpwHjMW6THSWAF-Jv_xT33UVZ8WcQKNKwlmDf-2hJAbleHlpkF5wIWnh_wd72ZZbSbTM5Ekecy9M335bnGBVF2wrETwqmd6gB4vwWBgJY8OElOXlqj0UL36anJSZsBoYpgZ6l_gIf1Q)

![Imagem](https://lh7-us.googleusercontent.com/0LY2jnIxa5bNuZhiUlXcqO-l4rgwszfzDuEIzvGscvlMqxMtGXN7e8wVzUvT8ozcQcLL8AtETlnuSRbdCkHXSG4GcM2J3RbMbALSKXoV6yCA0jLup8nQBBS98ipjRcXgDWZCILDiuAFIOg6zUCJbiUA)

Selecione a porta criada, clique em Aplicar e faça uma impressão de teste.

![Imagem](https://lh7-us.googleusercontent.com/Q3Sdo9K3J7RjjrXvwejwOvPPFQz-0daOFrN48HERLoPe-d2gj_z5QjOlpazvN47FAANPIqIR5rIr9dLlXVtoj-El8tR8vKJCi078APq5iPRztToiXhjv00JjxNw0XifVQ9TvzZXVcYlr2nFsxDIDFsc)

> [!NOTE]
> Se não conseguir com a pasta

### Assuntos relacionados:

[Como Configurar a Impressora no App](https://www.notion.so/24300ee50e9081dbb54ed3e6dbfedb2e)

## 📝 Tag para finalizar o chat
