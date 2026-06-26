import { test, expect } from "@playwright/test";

test.describe("Yooga CS Coach - Happy Path Chat Flow", () => {
  test("Completa fluxo completo de simulação de atendimento como agente", async ({ page }) => {
    // 1. Acessa página de Login e limpa armazenamento
    await page.goto("/Login");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload({ waitUntil: "networkidle" });

    // 2. Preenche credenciais e entra
    await page.getByLabel("E-mail").fill("mariana.silva@yooga.com.br");
    await page.getByLabel("Senha").fill("user123");
    await page.getByRole("button", { name: "Entrar" }).click();

    // 3. Aguarda redirecionar para o Dashboard e valida insígnias
    await expect(page).toHaveURL(/\/Dashboard/);
    await expect(page.getByText("Mural de Conquistas Yooga CS")).toBeVisible();

    // 4. Navega para o Simulador de Atendimento
    await page.goto("/Simulator");
    
    // 5. Seleciona o primeiro cenário disponível
    const firstScenarioCard = page.locator(".grid > div, [data-scenario]").first();
    await firstScenarioCard.click();

    // 6. Inicia a simulação
    const startButton = page.getByRole("button", { name: "Iniciar Simulação" });
    await startButton.click();

    // 7. Envia a primeira mensagem no chat
    const chatInput = page.locator("textarea").first();
    await chatInput.fill("Olá! Compreendo perfeitamente sua urgência. Vamos verificar a largura da bobina configurada nas opções da impressora.");
    await page.getByRole("button", { name: "Enviar" }).click();

    // 8. Aguarda a resposta do cliente simulado
    await page.waitForTimeout(3500); // Aguarda resposta do LLM

    // 9. Envia a segunda mensagem para consolidar o atendimento
    await chatInput.fill("Exatamente! Mude para 58mm nas configurações e as margens horizontais serão corrigidas automaticamente.");
    await page.getByRole("button", { name: "Enviar" }).click();
    await page.waitForTimeout(3500);

    // 10. Clica em finalizar
    const finalizeButton = page.getByRole("button", { name: "Finalizar" }).first();
    await finalizeButton.click();

    // 11. Verifica que a avaliação e notas aparecem nos resultados
    await expect(page.getByText("Simulação Concluída!")).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("Pontuação Geral")).toBeVisible();
    await expect(page.getByRole("button", { name: "Voltar ao Dashboard" })).toBeVisible();
  });
});
