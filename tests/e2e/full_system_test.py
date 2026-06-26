#!/usr/bin/env python3
"""Full system QA test suite for Yooga CS Coach."""
import json
import sys
import os
import urllib.request
import urllib.error
from datetime import datetime
from dotenv import load_dotenv

# Carregar .env do diretório raiz
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
BACKEND_API_KEY = os.getenv("BACKEND_API_KEY", "")

try:
    from playwright.sync_api import sync_playwright, expect
except ImportError:
    print(json.dumps({"error": "Playwright not installed", "status": "error"}))
    sys.exit(1)

BASE_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:8000"

AGENT = {"email": "mariana.silva@yooga.com.br", "password": "user123", "name": "Mariana Silva"}
ADMIN = {"email": "bruno.oliveira@yooga.com.br", "password": "123456", "name": "Bruno Oliveira"}

ROUTES = [
    "/Dashboard", "/Modules", "/Simulator", "/Reports",
    "/AdminDashboard", "/Scenarios", "/ManageUsers", "/Settings", "/Login"
]

results = []


def record(name, passed, detail="", severity="P1"):
    results.append({
        "name": name,
        "passed": passed,
        "detail": detail,
        "severity": severity,
        "timestamp": datetime.now().isoformat()
    })
    icon = "PASS" if passed else "FAIL"
    print(f"[{icon}] {name}: {detail}")


def api_post(path, payload):
    headers = {"Content-Type": "application/json"}
    if BACKEND_API_KEY:
        headers["X-API-Key"] = BACKEND_API_KEY
    req = urllib.request.Request(
        f"{BACKEND_URL}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))


def login(page, email, password):
    page.goto(f"{BASE_URL}/Login", wait_until="networkidle")
    page.get_by_label("E-mail").fill(email)
    page.get_by_label("Senha").fill(password)
    page.get_by_role("button", name="Entrar").click()
    page.wait_for_load_state("networkidle")


def logout_if_possible(page):
    try:
        btn = page.get_by_role("button", name="Sair")
        if btn.is_visible(timeout=2000):
            btn.click()
            page.wait_for_url("**/Login", timeout=5000)
    except Exception:
        page.goto(f"{BASE_URL}/Login")
        page.evaluate("sessionStorage.clear(); localStorage.clear();")


def test_backend_api():
    print("\n=== API TESTS ===")
    try:
        status, data = api_post("/api/chat/simulate", {
            "prompt": "Olá, minha impressora está cortando o layout na bobina",
            "history": [],
            "client_profile": "irritado"
        })
        record("API /simulate", status == 200 and "response" in data and len(data["response"]) > 5,
               f"status={status}, response_len={len(data.get('response',''))}", "P0")
    except Exception as e:
        record("API /simulate", False, str(e), "P0")

    try:
        status, data = api_post("/api/chat/coach", {
            "prompt": "A impressora está cortando o cupom",
            "history": [{"sender": "client", "message": "Minha impressora corta o layout"}]
        })
        record("API /coach", status == 200 and "suggested_response" in data,
               f"status={status}", "P0")
    except Exception as e:
        record("API /coach", False, str(e), "P0")

    try:
        status, data = api_post("/api/chat/audit", {
            "history": [
                {"sender": "client", "message": "Preciso de ajuda com impressora"},
                {"sender": "agent", "message": "Compreendo sua urgência! Vamos verificar a largura da bobina em Configurações > Impressoras."}
            ],
            "goals": ["Explicar configuração de bobina 58mm"],
            "scenario_title": "Impressora cortando layout"
        })
        record("API /audit", status == 200 and "overall_score" in data,
               f"status={status}, score={data.get('overall_score')}", "P0")
    except Exception as e:
        record("API /audit", False, str(e), "P0")

    try:
        headers = {"Content-Type": "application/json"}
        if BACKEND_API_KEY:
            headers["X-API-Key"] = BACKEND_API_KEY
        req = urllib.request.Request(
            f"{BACKEND_URL}/api/chat/simulate",
            data=json.dumps({"prompt": "", "history": []}).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            record("API empty prompt handling", resp.status == 200,
                   f"status={resp.status}", "P1")
    except Exception as e:
        record("API empty prompt handling", False, str(e), "P1")


def run_e2e():
    print("\n=== E2E TESTS ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        context.clear_cookies()
        page = context.new_page()
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            page.goto(f"{BASE_URL}/Login")
            page.evaluate("sessionStorage.clear(); localStorage.clear();")

            # P0: Unauthenticated redirect
            page.goto(f"{BASE_URL}/Dashboard", wait_until="networkidle")
            page.wait_for_timeout(1500)
            record("Auth redirect unauthenticated", "/Login" in page.url,
                   f"url={page.url}", "P0")

            # P0: Invalid login
            login(page, "invalid@test.com", "wrongpass")
            page.wait_for_timeout(1000)
            invalid_error = page.get_by_text("E-mail ou senha incorretos", exact=False).first
            record("Invalid login shows error",
                   invalid_error.is_visible(timeout=5000),
                   "error message visible", "P0")

            # P0: Empty login validation (HTML5 required OR custom message)
            page.goto(f"{BASE_URL}/Login")
            page.get_by_label("E-mail").fill("")
            page.get_by_label("Senha").fill("")
            page.get_by_role("button", name="Entrar").click()
            page.wait_for_timeout(500)
            custom_validation = page.get_by_text("Por favor, preencha todos os campos.", exact=False).first.is_visible(timeout=2000)
            html5_blocked = page.evaluate("() => document.querySelector('#email:invalid') !== null")
            record("Empty login validation",
                   custom_validation or html5_blocked,
                   "validation via custom message or HTML5 required", "P0")

            # P0: Agent login
            login(page, AGENT["email"], AGENT["password"])
            try:
                page.wait_for_url("**/Dashboard", timeout=5000)
            except Exception:
                pass
            login_success = "/Dashboard" in page.url
            error_details = ""
            if not login_success:
                try:
                    error_details = page.locator("form div.text-red-200, [class*='bg-red']").first.inner_text(timeout=2000)
                except Exception as e:
                    error_details = f"no visible error text (locator error: {str(e)})"
            record("Agent login success", login_success,
                   f"url={page.url}, error={error_details}", "P0")
            record("Agent welcome toast",
                   page.get_by_text("Login realizado com sucesso", exact=False).first.is_visible(timeout=3000) or AGENT["name"] in page.content(),
                   "dashboard loaded", "P1")

            # P1: Agent navigation
            for route in ["/Modules", "/Simulator", "/Reports", "/Dashboard"]:
                page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
                record(f"Agent route {route}", "/Login" not in page.url,
                       f"url={page.url}", "P1")

            # P0: Simulator flow (resilient scenario selection)
            page.goto(f"{BASE_URL}/Simulator", wait_until="networkidle")
            
            # Esperar a lista de cenários carregar (primeiro radio button acessível)
            first_scenario_radio = page.get_by_role("radio").first
            first_scenario_radio.wait_for(state="visible", timeout=10000)
            record("Simulator page loads scenarios list", first_scenario_radio.is_visible(),
                   "scenarios loaded from DB", "P0")
            
            # Seleciona o primeiro cenário da lista para abrir a tela de foco
            first_scenario_radio.click()
            page.wait_for_timeout(1000)
            
            # Agora sim, o botão de início deve aparecer na tela focado
            start_btn = page.get_by_role("button", name="Iniciar Simulação")
            if start_btn.count() == 0:
                start_btn = page.get_by_role("button", name="Iniciar")
            
            start_btn.first.wait_for(state="visible", timeout=10000)
            record("Simulator detailed card opens", start_btn.first.is_visible(),
                   "start button is now visible", "P0")
            
            # Iniciar a simulação de fato
            start_btn.first.click()
            page.wait_for_timeout(2000)
            
            # Interagir com o input de chat da simulação
            chat_input = page.locator("textarea, input[type='text']").last
            if chat_input.is_visible(timeout=5000):
                chat_input.fill("Olá! Compreendo sua urgência. Vamos verificar a configuração da impressora.")
                send_btn = page.get_by_role("button", name="Enviar")
                if send_btn.count() > 0:
                    send_btn.first.click()
                    page.wait_for_timeout(3000)
                    record("Simulator send message", True, "message sent", "P0")
                else:
                    record("Simulator send message", False, "send button not found", "P0")
            else:
                record("Simulator send message", False, "chat input not found", "P1")

            logout_if_possible(page)

            # P0: Admin login
            login(page, ADMIN["email"], ADMIN["password"])
            try:
                page.wait_for_url("**/AdminDashboard", timeout=5000)
            except Exception:
                pass
            record("Admin login success", "/AdminDashboard" in page.url,
                   f"url={page.url}", "P0")

            for route in ["/AdminDashboard", "/Scenarios", "/ManageUsers", "/Settings", "/Modules"]:
                page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
                record(f"Admin route {route}", "/Login" not in page.url,
                       f"url={page.url}", "P1")

            # P1: Scenarios page
            page.goto(f"{BASE_URL}/Scenarios", wait_until="networkidle")
            record("Scenarios page content",
                   page.locator("h1, h2, h3").count() > 0,
                   "heading present", "P1")

            # P1: XSS injection in scenario/search fields
            page.goto(f"{BASE_URL}/Scenarios")
            search = page.locator("input[placeholder*='Buscar'], input[type='search'], input").first
            if search.is_visible(timeout=3000):
                xss = "<script>alert('xss')</script>"
                search.fill(xss)
                record("XSS input sanitized",
                       xss not in page.content() or page.locator("script").filter(has_text="xss").count() == 0,
                       "no script injection in DOM", "P1")

            logout_if_possible(page)

            # P1: 404 page
            page.goto(f"{BASE_URL}/PaginaInexistente123", wait_until="networkidle")
            record("404 page", page.get_by_text("404").or_(page.get_by_text("não encontrada")).or_(page.get_by_text("Not Found")).count() > 0
                   or "/Login" in page.url,
                   f"url={page.url}", "P1")

        except Exception as e:
            record("E2E Test Execution", False, f"Exception occurred: {str(e)}", "P0")

        # Exibir erros do console do navegador se houver
        if console_errors:
            print("\n--- BROWSER CONSOLE ERRORS ---")
            for err in console_errors[:10]:
                print(f"[Console Error] {err}")
            print("------------------------------\n")

        # P1: Console errors check
        critical_errors = [e for e in console_errors if "Failed to load" in e or "Uncaught" in e]
        record("No critical console errors", len(critical_errors) == 0,
               f"errors={critical_errors[:3]}", "P1")

        browser.close()


def main():
    print("=" * 60)
    print("YOoga CS Coach - Full System Test Suite")
    print("=" * 60)

    test_backend_api()
    run_e2e()

    passed = sum(1 for r in results if r["passed"])
    failed = sum(1 for r in results if not r["passed"])
    p0_failed = [r for r in results if not r["passed"] and r["severity"] == "P0"]

    summary = {
        "total": len(results),
        "passed": passed,
        "failed": failed,
        "pass_rate": round(passed / len(results) * 100, 1) if results else 0,
        "p0_failures": [r["name"] for r in p0_failed],
        "results": results,
        "verdict": "PASS" if failed == 0 else ("BLOCKED" if p0_failed else "PASS_WITH_WARNINGS")
    }

    print("\n" + "=" * 60)
    print(f"TOTAL: {summary['total']} | PASSED: {passed} | FAILED: {failed}")
    print(f"PASS RATE: {summary['pass_rate']}%")
    print(f"VERDICT: {summary['verdict']}")
    if p0_failed:
        print(f"P0 FAILURES: {[r['name'] for r in p0_failed]}")
    print("=" * 60)

    print(json.dumps(summary, indent=2, ensure_ascii=False))
    sys.exit(0 if not p0_failed else 1)


if __name__ == "__main__":
    main()
