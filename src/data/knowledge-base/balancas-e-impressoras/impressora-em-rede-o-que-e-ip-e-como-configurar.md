---
title: "Impressora em rede | O que é IP e como configurar"
category: "Balancas E Impressoras"
source: "https://www.notion.so/Impressora-em-rede-O-que-IP-e-como-configurar-24300ee50e90819b913ad118ebd80376"
scraped_at: "2026-05-22T10:51:01.088Z"
---

# Impressora em rede | O que é IP e como configurar

## Tópicos

[_Entendendo o que é IP_](/24300ee50e90819b913ad118ebd80376)

[_Como configurar_](/24300ee50e90819b913ad118ebd80376)

[_Endereço IPV4_](/24300ee50e90819b913ad118ebd80376)

[_Como verificar se a porta está disponível na rede local_](/24300ee50e90819b913ad118ebd80376)

[_Máscara de Sub-rede e Gateway Padrão_](/24300ee50e90819b913ad118ebd80376)

---

## 🤔**Entendendo o que é IP
- O IP é um endereço exclusivo que identifica um dispositivo na internet ou em uma rede local;
- Para que a impressora envie a impressão por rede é preciso que ela esteja na mesma rede local do computador;
- Para localizar a rede local do computador você deve abrir o **CMD **no computador do cliente, digitar **ipconfig **e pressionar **enter**;
![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/4e860a31-b6d6-409d-a5c1-f7830b76189f/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466V5HTFVSG%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105057Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFEaCXVzLXdlc3QtMiJHMEUCIHxIUYUiDK5WkBnGeLkG70OUteSqlbSABQnZzJ7R%2FdFPAiEA1OKI0jTZkijXZtIxcOGK1NeUlJ083WxKZxRQbBisw6oq%2FwMIGhAAGgw2Mzc0MjMxODM4MDUiDPTAzh4KEpgasqmFWircA9duc20JqkpbCbvIeQDK6wuX3prITCuX1R2u0YmZfNTIP49v6S0wg4WT8dyV5F%2BJyEzyz7LD7bgwZ8Z79oqt1pkNMg81SvhtchHTH3uEG1EdSg831K9TkXZFva6dRpGNjIDFLMhc3t%2F1Zbd%2BVFHOFcM9ALiV4JilIeKQRVce6IZhRGZGHXRdgI2RDTtp0blR%2FXTSVMNqpDZhGsY6iMJABa6dBuXioEQ5hL5NblSsu2UXIuJ0oGje7KxxSK2tmUZoskST%2Fz6CbQs%2FXvdJeNpcRvHX5t4z%2BXjETSJE%2Bkc2jug8tVjK%2FOSkQ34ognQduvquDXoSjLJeEtG3xeKz3B0G4umg752k9yvaT6NdL1s4M7LM14MAyPxuDpR3grPVqanEcJZmIohdZEhlnAOMxxi4QPz2qaXtNBv0UwuUd6gn151SD6PrwNztBop%2B5U4PTc%2B1MzfBwaz7N6v5lRAv31ngtO2ol8pwtMIx7sKf3RELUz7FY0zA7iTFjUYi7dnFD%2F7Jr9Moc7WmNX%2BMUvu5k27V0Hp%2FoMVAcFsFDomwR72Aa5R3f5sFqUxGLs%2BFvNIAuq%2BmAgf8pJCMEpF%2FBAC2ubvJksygm9nUROw5FyZuJoSdgZYDQ2tiwLAisIXFzBotMOS9wNAGOqUBmEqix%2FkdZbS0fHx0vQ6nE0FLs6LA4QOppcxIkSvaZCRgVJESDGGqyOcOLMb6GrsMznN6LmpzTx1fYBnT7CR9WH9SUzXsMbFMDp06ZFatYEpgbE%2FvcL84W0Yyowrr2T3Q8M8Z3HwYLFT2CpiI5VXvuD1t2JUcaG6SSTcXaONd1Bu7ZKXZdxhYB%2B7oq%2BZvN53xXQcv25421uM74pbEFvfQ24wX9zsj&X-Amz-Signature=a97c772de9b136d260b4e95ec31e5043c7436adbf070405141f6a5c665578d2b&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/3a8f182b-b187-4e57-9799-8733c110fe1c/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4662C2AUPYI%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105057Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFIaCXVzLXdlc3QtMiJGMEQCIBdbuDtF2Len7TXCwalpMJSVDZV22wI734W0Mqbh6h2gAiBe%2B9DjlZDK3gMbNJcbrdPkrGOTTDPvvqPmIug3IamOEir%2FAwgaEAAaDDYzNzQyMzE4MzgwNSIMzv%2BFAJlcRJK6LSjPKtwDGnXcvIz%2FEIXJ8PNT0GlpKTTSk3eiY6qhSmu8%2BRRNKQ%2FuaG9L0di2mEJITKituJmdo3QOOH7QQFRO9bQ2fAxxtaVIWgm%2F1%2BDztluh1YueX7DQnEFuHWTe7W%2FQ7rjeJeEE8D%2B9VDHHfiKgNDq%2BeCOfq2vmR6vvCDaQRTSovBhHi4QptD7HZIA6m%2BeFH6IKElpe7WyyYcWyGGCh2buKJYCD1iJC6b%2B0J18DZwfTuri%2FM4vvqBWl%2Fp9KUqgrKMN%2BYK%2F%2B59hgrMKkD7kdewynJJMZ0sxoYnNas%2Bed4lHoZDrRQeeok9USxtbnaeFq5GmYqofzuetyh%2BMTY0ZiCKUKhDg0z78vSm8GRjb75r5wiPcXMnTf6u%2FYDOk5b%2B9EvJjlV1sqdNIv3jJdA0q6bPNHzx4SJc9GCpzWLbZCKyAbIllXhWX4U09ZROu5Ayn6W%2FTZWf69PMCBPPQyvxto1cJVkNA%2FxUJgKeK7N1OtGvNmC3cjlm0xZkXlug8MZBJLTfolJBPCtwC2jbv9g3Q7Xi%2FqAOxczzhHbENaTz0%2FumEB5o7Y2aRqivUY9roCR6hyD6DBWHQMVJKox02izOTjU4ZgYdFvQ1PDSSHS16il6xvFVm50BKyVfKLBmMyNFuCtDEYw%2FL%2FA0AY6pgHqRlljWL59j1BLZtO4T6qG6i9yVvW4bJ2szxBEBMOBdyxPqQkNzQZt%2FDlHm%2BpiGR9knFHqHQ8MI0TncfQJVs3%2BWq6Kd2nDulK%2FtLtJZ81OlpDGbRFBHqN4c9xs5hDqfWd8agANUbOXzsooqdQ1u2BEwslnDPnT0Pp2mp5SCMNlGnx4sOvLwtGD3yie4dEatkQKa%2Bhpo6%2FPrF6OjdKz5DoiGyYwktiG&X-Amz-Signature=f51385a8357c54770aaa8735aed31cf722fa5ae4d27ce136f25c1b37bff0f4a5&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/bc59b282-8475-4103-8647-0eceba81b46e/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466YKE7IJ3Q%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105058Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQCklOEHO78YLb78nz5YzSAZH6ALpxEiZIMl0offTYVyIQIhAM6q30eJK8JoRD1nM7jBo9V%2B6hlFstLtCAgF2Mo7PQGhKv8DCBwQABoMNjM3NDIzMTgzODA1IgyPjcrMpT%2F3uFySXBQq3ANg%2FM6Wf2uB55uixriUXwiBJsEwbWPLmmeW4vJGQniUHUeFWX09OeoiZLixdOZMX8UU%2BF%2FM9b3HZHtt%2B0SLiuI7M%2Fncwqr2PwrZV2GLuVgaRjfyHzChxvOjmYvsl4Kt27QWKar8DlVjpK2DAd1Rc1UelJ3PrXuGiTgxULH61dxSPS8hIu9LlAJHmoYKTCHSsz8fK5gzPubUOlWxKdfTqn4zABimzG4nedDkG98fU20zv88adNAhEPp87va2sEp%2Ffn6rdCRr4sIkJfyiFJoZkyd3xsKr3cAi3dhk9nrv0anGM7pFkY%2Fr6SReASgb0s5sPvbddJP6FiTJJT3cuRz57CkM40KTR7RWfIGrnJXhp04J2%2Ba8G9g0UVZimFCchmX2Rth7hMYFtCdCR7GLPZUUIEEMqTN%2BS0ZtCJ5sPVeEHarkemxOtJ1ATsVmrS0UNJ3kBSjrUFA5FzhBIwdCUeblbJ9Kj0eRPmHKtt57GnQ5Wyz9vf0N08Xyt1%2BNM7Y%2Bal%2F9zOFEJgaixmwroUrDKtuLlpOb9z3UdQDpbhW1ySjoGynZN%2F9%2BRNhQmFYBPYL5wH3kA3eKr6mbgU4tkKXPWLV%2F1aq143hMemAVsYqPoh5FiqM797eS%2FSVS6YGQfxc3JDDZ6MDQBjqkATHX5yfpqv%2FwSpAcypcvkbtn8mY4J9s1g1jqINVjqIFJuQPf3ANbpwr5viWWZYAUeKS78CI%2B%2BxINhdHnEfWkZUHfEps9WqtppTC9EQX%2F2zzE6KiUYHYAx%2Bf0zMG%2Bso8hZu5eW0T7QqDv1FYo%2FBivmBGAu7xE3Yyd6lzOYUfyBTY4R05Y35MA3ZLFVSESG7xPK%2BDUfAvoKwaI3c5khDTS6n%2B%2FN0Zz&X-Amz-Signature=fc1bed59bb5b81a91beed125be1b69ec326200a1cae637a22094d5040ef09f42&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

- No terceiro Registro de tela acima o que deve ser levado em consideração são os tópicos **endereço ipv4, Máscara de Sub-rede **e **Gateway Padrão.
👉 ****Endereço IPV4**
👉 ****Máscara de Sub-rede**
👉 ****Gateway Padrão**
## 😎Como Configurar

- Após identificar a rede local do computador, você deverá criar uma porta para a impressora nessa rede local;
- Cada porta na rede local é identificada pelos últimos 3 dígitos do IP;
![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/45c48d57-fcd7-4e26-a69a-bbd9aae56fd4/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466ZUYGNFDE%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105055Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJIMEYCIQC6%2FGWhqa1AH1NQ5Tm6egPOBEBKU%2F1X2Ygykj%2FoCj7p6gIhAMjRDgFPpquLvUXJQLpesEcZJBkpaq3%2F%2FgRWhXTOt3QsKv8DCBwQABoMNjM3NDIzMTgzODA1IgxGKGdYoKEIpXRy7yEq3APAXFxXTrc9q9QqQezai0gLtdtFAnbTE7vBpveL3i%2BaXkriSVvxh6Gn%2BnjEVti%2BsC%2BjobEUAbbFFHbeLfAzDF1nCIW4zstX8gqG2u%2FgoigIS9ovP5FQFsQ3OEGqhplTTu%2FQtht2TLem4XQNsM9ykhV2g3QJcVBEVHjAZdUtFO9GYV3u4jo9JYq2xLiDUgI4Nm%2FO%2BuQ3LZpaoXB1tH75skOph1xKqKOyECIjfyq8bJaTm8wvFhLDKC%2BTE3FR7RpGV%2FTJgJosQ0rMM59sZJe8MDK0dI9dP3k5xpxEQeEnIMuyHRG0A1tC1Ma4oK307poeCRez7jd6gkalVuu0EHskqMZh1rPrDXMx1ySMvAIdBkBp%2Bl8U1xIJ820ZvrJ6FT%2BvV8EfoXR4H%2Fp7UYoGgdASh8X%2Ff%2FcTGd11wd%2FHMzCopSI6wDj08%2FCeE6HzQCVnfFBm%2FDl5QiaTUl%2B%2B7JKdiEqd8aA%2BHYJRS4WDzUMlXlyGt8IVKLwZbhU0Zl%2BULYxnSKLHJm%2FMmK%2BVXgeCPWAhqVYsDNoXd4ADcMbWaf3%2FLkdZVzkfhcWHDiGjyihrJxTQ8PqaS2RcUz3I2vKk54NAgI2JhcPT5Br4BFQjKzrr66dPZtD8z%2BFoNCYGguN%2BQ8mtHTDi6MDQBjqkAQz8UZKimhdvAg80GPlbHfEi6X6nfXEhT73tVqyurm6TmqnJm6tzAtQYd0W3wMkOQU09db%2FVVzMiTGD0m%2BMl63DXAiV9WnrzcAs%2BjvQDqNIjZJba6xUvCFNf3R%2F9Ujr0BI%2BTcFKuIqA9daMdB%2Bn6O0gYZuHzubblDZagwZReWb69BkPlLR3MGe1Bqcg%2FDW5i38koc2oKIzj0MdUkBxPMMuFpF7j%2B&X-Amz-Signature=b55963c4f582892288243e3f4c9442646b873955942aba1e31e1c8b22a54ed30&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

- Nesse caso, para realizar a configuração, você deverá repetir na impressora as 3 primeiras partes do IP local do computador, e nos 3 últimos dígitos inserir uma nova numeração que esteja disponível. Dessa forma abaixo:


### Endereço IPV4
Será responsável por definir qual a porta da impressora na rede local.

**Como configurar:
No momento de configurar na impressora, deve configurar exatamente igual as 3 primeiras partes do endereço. E a última parte será para a porta da impressora.

**Exemplo:
Você digitou **ipconfig **no cmd do cliente e viu que o **endereço ipv4** é **192.168.18.179. **Nesse mesmo campo na impressora deve repetir **192.168.18. **e na última parte após o ponto será inserido uma porta para impressora que esteja livre na rede local. Recomendamos colocar de **200 **para cima.

Nesse caso na impressora seria colocado **192.168.18.200.
👉 ****Como saber se a porta que escolhi para impressora está disponível na rede local?**
  Digamos que você escolheu que a porta da impressora será **192.168.18.200, **seguindo o passo a passo acima. Mas você quer confirmar que a porta 200 está disponível antes de configurar de fato na impressora.

Para fazer esse teste, você vai voltar no programa CMD, no computador do cliente, e vai digitar “Ping **192.168.18.200” **(no endereço de ip será inserido o que você irá configurar). Feito isso pressione Enter. Se a resposta para o IP for Host de destino inacessível, significa que o ip está disponível, pois a rede local não identifica nada conectado a essa porta.

  ![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/4476cc45-b377-4af6-b342-a170c4383f64/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466WI2C4F4K%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105100Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFEaCXVzLXdlc3QtMiJIMEYCIQCpb7BcRECxzGl%2Ftda701cLKa4Hmuu8WZWRf%2Bodcg8S%2BAIhAMgExxAqUGEPiw5PSXB9Fa8dUJYc4Np2RrLrfDc%2FiKEvKv8DCBoQABoMNjM3NDIzMTgzODA1IgwQy7nuKOTx4QkYFu4q3AMdlJKyvXHDCSi%2BQ656IH4vI4wMT3wDC02vBYXNIAE0RVGoleiyk9aM%2FKvUTpK2P6%2FyligPS63RcoS0c3M62SnBFgTVfFeo523Vm01m0RpeXAmplZfzCT12oGDAEBgHs%2F52WM7zh%2FJOEWzox33Tw5STjFe4%2Fn4ZRYCgi1ScrLgOMQVKOg9U%2BIsehLbn8zkS%2B2I7GpmKxkamWBVwd158E3i82215tvOzcDv25c8KWzlrxKlzeUIRExs1HkeOKBTtHYBejh1MG0iMgeDNhgHlk30M0%2FqRXFoFinw9UjhIzHXE8NdC6EzFHNfxbspWA6%2FLZzHDC2LAv6bTKWPBhCFaTYFVU9pchV3QxIAq8Iy5alNrRGzUsTbKTyeL4xv6zCVwovniPwFNEHbB7irFLD6WaErO81t1FFxw2i4leBsSd%2B9SjvXcMUn0qUtJDx6Zyi7XBVZW6DsJpOcwfV4txfXsXTrINv4BHiAOgGLxAE2hc3Zz0pbLcdRWCbPgS%2BoWZ%2F7DvPOnm6zsDLWohrVf3XXqFbgfbFT94nQZZmpLjpqw3N7VV1BClAEdqieDOhZfVGYbXYeWp4j6hVCsj1TWOg9fVLOPjX42M4tYHgO%2FRIJe4NhDi5EzWtm8dysC62TUajDtvcDQBjqkAaagrBiMBHUrF9gMZPn2zYxHL7fy9nbvPTKijTADahZ3gjiXm3iGc0OJLBT9%2Bed4CBnh7n%2BDh%2Fx7qoc28xNdRujL0x3xYOaGTopviDbWn7bUg2DFqahkMjPPvsc8Qs%2FpVpf4YkLHmYF6D9oKwQ0q9tBPp0dPGOorQCscV2tEaW2bjcRq68TRhjR7xq3cdlJGZaWeAvqRGlHmO%2FjPRwJgzQYfRg5c&X-Amz-Signature=74cbefe0207493f4c9fab2e3df359406f195c60e0ce35d163cb4e55af2286c15&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

  ![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/d439fbe4-39b7-4890-be4e-5a162b28702c/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466TP2SZF6Y%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105100Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFMaCXVzLXdlc3QtMiJHMEUCIQCkuN2PLUsZAKYK51Ng9EvYpuyrwgqsZojqjlkT0AkIxAIgWgJtAscUF%2FQ7k%2BKciVW33nuLejC0gXo8q%2F16mRFGZrcq%2FwMIHBAAGgw2Mzc0MjMxODM4MDUiDIK8P%2BIoVGv3oC7qmyrcAyLSJkR09J7BDQbRnc296Ndf3mPI1kOzG8U%2FphaFBbhHF6s1buk2AueGvrBo0bIe6uUVuo7HfJIgb6JvXKwBEdLr7ZIp27I5Cpn82n73lO%2BFzJHpDmOotpcwzzwKMAG0V3BHLv5YHNthmBqWGaqg2caixUNxL87DpMYJgNstfo9IPDYlVk7u3758UM5zbDMbi1t6Fr7Sv3u4cuD9c%2BrzIy%2FJMmoYzpUQivN16wt2T1dCl%2FXRhMU%2BSx%2B63Py2%2BH2fPmWoUaD11j10pBmRZ3BPRS28BF%2Ft0jc%2FjhbsYbfloqQvZ9ICpjG0Q2E1x9fzZ928hYywbWe5v%2F0MEAjtNr03KpOpYp1dvPHlgXl4kGqodsYQf0ojt31QI2aozf9BIGN9VuaSzAXZhtlZ7lf4ko48qNDk42vMVVDM2XVW3Pn3FsmIV1TMMrJoBVtwMAddntjDzH8N1%2F6BY3A82TIJxtNmTOm753R8gDHf3dWybXTkMLsOh%2FhAImKunGPzPWbYE8t1RgMmPtLbjyzCF5%2BqoZOlmb2iEfklIYxxNOHgFbFHgrVdebPO8LO89V1kgxjzU1yJ6PyjqbA1zj31t%2BfO7Q7d%2F%2FezTpg80Jh7vlLii4SpQ54VSnI3qgsnXpP3xW%2BPMNbowNAGOqUBPvbfzv27JcGwv34tynBkj15717Esvo91rYXst3U3qOWdG%2F42ImgjZOwNf06UO%2BqfQgAVPOCQsB5FfqGzD6O37nV7MAaBcNnUkWQHtlDLzmILh46HzyvkRcKhgoKAENIz3L5JFA3DbX0L%2BVGkYif16lFlXo4oE5RCp6aX2qSV%2FeZUq8GxR2lK82ROgvgTKP%2B5c1ft2VEhUW3RBrE8N5eHHcQUedz4&X-Amz-Signature=7649135ded8bef35edaa941bef609f2bfbde3bff079c9562430c73c73557b14e&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

### Máscara de Sub-rede e Gateway Padrão
Deve ser configurado na impressora exatamente como aparece no CMD do cliente.

## Hora da ação

Agora que você já sabe o que é IP e a forma correta de configurar, faça esse processo de configuração no driver da impressora que está configurando. Acesse abaixo a página para o passo a passo de cada impressora:
