---
title: "Api de impressão simplesmente não abre e não exibe erro."
category: "Perguntas Frequentes"
source: "https://www.notion.so/Api-de-impress-o-simplesmente-n-o-abre-e-n-o-exibe-erro-24300ee50e908119adcff214550d5e57"
scraped_at: "2026-05-22T10:51:10.498Z"
---

# Api de impressão simplesmente não abre e não exibe erro.

**1º - Verificar se o aplicativo está “agarrado” em segundo plano no gerenciador de tarefas
Para isso pressionar **Ctrl + Shift + ESC **ou pressione com o botão direito do mouse sobre o ícone do Windows e selecione **gerenciador de tarefas.
Procurar por **javaw.exe** e finalizar a tarefa dele.

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/70afd1ec-97c6-4c66-a42d-c45e5a023f14/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643IRJ3K4%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105108Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFEaCXVzLXdlc3QtMiJHMEUCIBz5Dxk95Paqj6oOzYV28F0Ea6ItJfrNEjtF4556ghc2AiEA5mhVJ4MNCawQr0hqDmwUp%2Fq%2FkKk8j2PrpbGjS6Me%2Fxgq%2FwMIGhAAGgw2Mzc0MjMxODM4MDUiDIbNC6X%2Bi14maGEaQircA%2FPOtep3fzg%2Bm%2B1Zuju26p2BOowqi7wXkpyAY%2FfmaDMOdaz%2BTuMTYNuX6UCgqO3rPDHBtzKrNMbfrRJl0%2FZGii6oTKpjOdkak%2FAWEQ2JPtiqRi0gLoM9s6MDqp6zylANjx%2FemLfY%2BNfdFTJ%2BRLu7yGk%2FXeQy%2BeVNZrVnPRroffQYQlAkkIRTQup%2FhE%2BShiYQmoiM%2BD9sCPI4QXSHNlABEPBBrwcgMTfJ95eEfReYIQe7WkaZ9eaIKqB89BfG9HqZjKwAeEh%2BXS62d797AtqnsHot0PqxoJ0%2FC3nJlWH%2FfpVJ4fDXjXL9EH1BAQdeVgG3TfQE2W%2BCsulq9Y%2B7Rxq8GcT%2FQdGjOIN%2B4xV8luz15FNw2Xinz%2Fgl3kJohhdsU8rRLxWywJvjj1enazuu2XHEUe4Qjx6jlpV4ePVlavY0X%2F6reVGuvOz8xdVLDlrlfSR6u0%2F49qurVoL9MldlbkBrJtT2uKvfi%2FN4DXzzaC%2FaZ%2F835b2fO0rceorqiB8fWD8QVTFF2mt59d2z715uBX6iZO7H86erDHqAIvdaEdwGjvouTTVK9cx1IIVxXRkoTzl1u3tGxSPIq9jwXHDCvS81WtcLXO2D9RhHD91ZP%2BC7cZsqHIeaqHvAg24aLW1GMMK9wNAGOqUBzWDDps9fVDJ7KE1lnhNLasqRKhhv7GsBOvXa%2F1RDGJeDPM8ivH%2Bky90YB8rrdLbhA5Zvq8i%2FP9ThGWa0mPV%2Fxrv1fy7jj55m7p6V5aResPBbU0o2JB6zZeb5%2BzJzMyWhBvTHIIg5jWkrYvdsJisbCFV15HwAOSKhfWUhJFnqqVKyHePMk9pTYC1%2FNnodnJITocmcWM%2BPfzPSJIkJJuBmaVQK9q3r&X-Amz-Signature=82487ec2220d3a4a1105753425381bca5e4e694cd496d298e62345afbe1bd1b3&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

![Imagem](https://prod-files-secure.s3.us-west-2.amazonaws.com/4f800ee5-0e90-8129-aba9-000315287451/9d1dc700-c778-4e24-8b70-8d9b839d7a0e/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB46643IRJ3K4%2F20260522%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260522T105108Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFEaCXVzLXdlc3QtMiJHMEUCIBz5Dxk95Paqj6oOzYV28F0Ea6ItJfrNEjtF4556ghc2AiEA5mhVJ4MNCawQr0hqDmwUp%2Fq%2FkKk8j2PrpbGjS6Me%2Fxgq%2FwMIGhAAGgw2Mzc0MjMxODM4MDUiDIbNC6X%2Bi14maGEaQircA%2FPOtep3fzg%2Bm%2B1Zuju26p2BOowqi7wXkpyAY%2FfmaDMOdaz%2BTuMTYNuX6UCgqO3rPDHBtzKrNMbfrRJl0%2FZGii6oTKpjOdkak%2FAWEQ2JPtiqRi0gLoM9s6MDqp6zylANjx%2FemLfY%2BNfdFTJ%2BRLu7yGk%2FXeQy%2BeVNZrVnPRroffQYQlAkkIRTQup%2FhE%2BShiYQmoiM%2BD9sCPI4QXSHNlABEPBBrwcgMTfJ95eEfReYIQe7WkaZ9eaIKqB89BfG9HqZjKwAeEh%2BXS62d797AtqnsHot0PqxoJ0%2FC3nJlWH%2FfpVJ4fDXjXL9EH1BAQdeVgG3TfQE2W%2BCsulq9Y%2B7Rxq8GcT%2FQdGjOIN%2B4xV8luz15FNw2Xinz%2Fgl3kJohhdsU8rRLxWywJvjj1enazuu2XHEUe4Qjx6jlpV4ePVlavY0X%2F6reVGuvOz8xdVLDlrlfSR6u0%2F49qurVoL9MldlbkBrJtT2uKvfi%2FN4DXzzaC%2FaZ%2F835b2fO0rceorqiB8fWD8QVTFF2mt59d2z715uBX6iZO7H86erDHqAIvdaEdwGjvouTTVK9cx1IIVxXRkoTzl1u3tGxSPIq9jwXHDCvS81WtcLXO2D9RhHD91ZP%2BC7cZsqHIeaqHvAg24aLW1GMMK9wNAGOqUBzWDDps9fVDJ7KE1lnhNLasqRKhhv7GsBOvXa%2F1RDGJeDPM8ivH%2Bky90YB8rrdLbhA5Zvq8i%2FP9ThGWa0mPV%2Fxrv1fy7jj55m7p6V5aResPBbU0o2JB6zZeb5%2BzJzMyWhBvTHIIg5jWkrYvdsJisbCFV15HwAOSKhfWUhJFnqqVKyHePMk9pTYC1%2FNnodnJITocmcWM%2BPfzPSJIkJJuBmaVQK9q3r&X-Amz-Signature=247af2f5fb6a690e76d5ed1349f073cc5017bdfc6b49ed5d58ed12504bd1cd19&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

E tente abrir novamente a API, se não funcionar ir para o passo 2.

**2º - Abrir o Json, apagar as informações e colar:
- Para isso pressione **Windows + R, **escreva **C: **e clique em OK;
- Na nova tela abra o **arquivo de programas (x86)** e abra a pasta **Yoogaappservice;
- Agora abra o arquivo **config.json **apague tudo que estiver dentro dele e cole o texto abaixo:
```html
{
"balanca": "toledo",
"socket_url": "[https://socket-prod.yooga.com.br/](https://socket-prod.yooga.com.br)",
"generic_text": 0,
"socket_idi": 0,
"api_url": "[https://api4.yooga.com.br/instalacoes](https://api4.yooga.com.br/instalacoes)",
"socket_idi_emissor": 0,
"pedidos_delivery": true
}
```

> [!NOTE]
> Se não conseguir editar as informações dentro do arquivo, clique com o botão direito nele, selecione **propriedades** e desmarque o atributo **somente leitura. **Agora clique em aplicar e salvar e tente de novo.

Salvar e tentar abrir novamente, se não funcionar, pedir o cliente para reiniciar o PC e o roteador.

## 📝 Tag para finalizar o chat
