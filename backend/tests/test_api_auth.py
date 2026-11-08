"""
Testes de integração da autenticação e do proxy /api/db/*.

O acesso ao Supabase é stubado em memória, então os testes não tocam a rede.

Executar com:  backend/.venv/Scripts/python -m pytest backend/tests -q
"""

import os
import re
import sys

import pytest

os.environ.setdefault("AUTH_JWT_SECRET", "segredo-de-teste-com-32-ou-mais-caracteres")
os.environ.setdefault("SUPABASE_URL", "https://exemplo.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "service-role-key-fake")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402
from auth import hash_password  # noqa: E402

ADMIN = {
    "id": "u_admin",
    "full_name": "Administrador",
    "email": "admin@yooga.com.br",
    "role": "admin",
    "password": hash_password("admin123"),
}
AGENT = {
    "id": "u_agent",
    "full_name": "Agente",
    "email": "agente@yooga.com.br",
    "role": "agent",
    "password": hash_password("agent123"),
}
OTHER_AGENT = {
    "id": "u_outro",
    "full_name": "Outro Agente",
    "email": "outro@yooga.com.br",
    "role": "agent",
    "password": hash_password("outro123"),
}


def _fresh_tables():
    return {
        "users": [dict(ADMIN), dict(AGENT), dict(OTHER_AGENT)],
        "scenarios": [
            {
                "id": "c1",
                "title": "Cenário 1",
                "created_by": "admin@yooga.com.br",
                "status": "ativo",
            }
        ],
        "simulations": [
            {
                "id": "sim_admin",
                "created_by": "admin@yooga.com.br",
                "agent_id": "u_admin",
                "scenario_id": "c1",
                "scenario_title": "Cenário 1",
                "agent_name": "Administrador",
                "status": "ativo",
                "history": [],
                "audit_results": {},
            },
            {
                "id": "sim_agent",
                "created_by": "agente@yooga.com.br",
                "agent_id": "u_agent",
                "scenario_id": "c1",
                "scenario_title": "Cenário 1",
                "agent_name": "Agente",
                "status": "ativo",
                "history": [],
                "audit_results": {},
            },
        ],
        "company_profiles": [],
        "agent_performances": [
            {
                "id": "perf_agent",
                "created_by": "agente@yooga.com.br",
                "agent_id": "u_agent",
                "overall_score_avg": 80,
                "simulations_count": 1,
                "badges": {},
            }
        ],
    }


TABLES = _fresh_tables()


def fake_supabase_request(table, method="GET", body=None, params=None):
    """Emulação mínima do PostgREST para os testes."""
    rows = TABLES.setdefault(table, [])
    params = params or {}

    if method == "GET":
        result = list(rows)
        for key, value in params.items():
            if key in ("order", "limit"):
                continue
            if key == "or":
                clauses = re.findall(r"(\w+)\.eq\.([^,)]+)", value)
                result = [
                    r for r in result if any(str(r.get(field, "")) == val for field, val in clauses)
                ]
                continue
            if value.startswith("eq."):
                wanted = value[3:]
                result = [r for r in result if str(r.get(key, "")) == wanted]
            elif value.startswith("ilike."):
                wanted = value[6:].lower()
                result = [r for r in result if wanted in str(r.get(key, "")).lower()]

        if "order" in params:
            field, _, direction = params["order"].partition(".")
            result.sort(key=lambda r: str(r.get(field, "")), reverse=direction == "desc")
        if "limit" in params:
            result = result[: int(params["limit"])]
        return result

    if method == "POST":
        rows.append(body)
        return [body]

    if method == "PATCH":
        wanted = params.get("id", "")[3:]
        for index, row in enumerate(rows):
            if row.get("id") == wanted:
                rows[index] = {**row, **body}
                return [rows[index]]
        return []

    if method == "DELETE":
        wanted = params.get("id", "")[3:]
        TABLES[table] = [r for r in rows if r.get("id") != wanted]
        return []

    return []


@pytest.fixture
def client(monkeypatch):
    TABLES.clear()
    TABLES.update(_fresh_tables())
    monkeypatch.setattr(main, "supabase_request", fake_supabase_request)
    with TestClient(main.app) as test_client:
        yield test_client


def _login(client, email, password):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ─── Login ───────────────────────────────────────────────────────────────────


def test_login_devolve_token_e_perfil(client):
    payload = _login(client, "admin@yooga.com.br", "admin123")
    assert payload["role"] == "admin"
    assert payload["token"]
    assert payload["expires_at"] > 0


def test_login_com_senha_errada_retorna_401(client):
    response = client.post("/api/auth/login", json={"email": "admin@yooga.com.br", "password": "x"})
    assert response.status_code == 401


def test_login_normaliza_o_email(client):
    payload = _login(client, "ADMIN@YOOGA.COM.BR", "admin123")
    assert payload["email"] == "admin@yooga.com.br"


def test_me_devolve_o_perfil_do_token(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    response = client.get("/api/auth/me", headers=_auth(token))
    assert response.status_code == 200
    assert response.json()["email"] == "agente@yooga.com.br"


def test_me_sem_token_retorna_401(client):
    assert client.get("/api/auth/me").status_code == 401


# ─── Proxy /api/db/* ─────────────────────────────────────────────────────────


def test_listagem_sem_token_retorna_401(client):
    assert client.get("/api/db/db_scenarios").status_code == 401


def test_agente_nao_pode_listar_usuarios(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    assert client.get("/api/db/db_users", headers=_auth(token)).status_code == 403


def test_admin_pode_listar_usuarios_sem_expor_a_senha(client):
    token = _login(client, "admin@yooga.com.br", "admin123")["token"]
    response = client.get("/api/db/db_users", headers=_auth(token))
    assert response.status_code == 200
    assert all("password" not in row for row in response.json())


def test_agente_enxerga_apenas_as_proprias_simulacoes(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    response = client.get("/api/db/db_simulations", headers=_auth(token))
    assert response.status_code == 200
    ids = [row["id"] for row in response.json()]
    assert ids == ["sim_agent"]


def test_admin_enxerga_todas_as_simulacoes(client):
    token = _login(client, "admin@yooga.com.br", "admin123")["token"]
    response = client.get("/api/db/db_simulations", headers=_auth(token))
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_agente_nao_pode_criar_cenario(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    response = client.post(
        "/api/db/db_scenarios",
        json={"title": "Cenário proibido", "initial_problem": "x"},
        headers=_auth(token),
    )
    assert response.status_code == 403


def test_agente_nao_pode_alterar_simulacao_de_outro(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    response = client.put(
        "/api/db/db_simulations/sim_admin",
        json={"status": "concluida"},
        headers=_auth(token),
    )
    assert response.status_code == 404


def test_posse_da_simulacao_e_forcada_pelo_token(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    response = client.post(
        "/api/db/db_simulations",
        json={
            "id": "sim_nova",
            "scenario_id": "c1",
            "agent_name": "Agente",
            # tentativa de se atribuir a posse de outro usuário:
            "created_by": "admin@yooga.com.br",
            "agent_id": "u_admin",
        },
        headers=_auth(token),
    )
    assert response.status_code == 200
    created = response.json()
    assert created["created_by"] == "agente@yooga.com.br"
    assert created["agent_id"] == "u_agent"


def test_agente_cria_performance_apenas_para_si(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    response = client.post(
        "/api/db/db_agent_performances",
        json={"id": "perf_nova", "agent_id": "u_admin", "agent_email": "admin@yooga.com.br"},
        headers=_auth(token),
    )
    assert response.status_code == 200
    created = response.json()
    assert created["agent_id"] == "u_agent"
    assert created["created_by"] == "agente@yooga.com.br"


def test_agente_nao_pode_deletar_simulacao(client):
    token = _login(client, "agente@yooga.com.br", "agent123")["token"]
    response = client.delete("/api/db/db_simulations/sim_agent", headers=_auth(token))
    assert response.status_code == 403


def test_admin_cria_usuario_com_senha_em_bcrypt(client):
    token = _login(client, "admin@yooga.com.br", "admin123")["token"]
    response = client.post(
        "/api/db/db_users",
        json={
            "id": "u_novo",
            "full_name": "Novo Agente",
            "email": "novo@yooga.com.br",
            "role": "agent",
            "password": "senha-secreta-123",
        },
        headers=_auth(token),
    )
    assert response.status_code == 200

    stored = next(row for row in TABLES["users"] if row["id"] == "u_novo")
    assert stored["password"].startswith("$2")
    assert stored["password"] != "senha-secreta-123"


def test_criacao_de_usuario_rejeita_papel_invalido(client):
    token = _login(client, "admin@yooga.com.br", "admin123")["token"]
    response = client.post(
        "/api/db/db_users",
        json={
            "id": "u_bad",
            "full_name": "Ruim",
            "email": "ruim@yooga.com.br",
            "role": "superadmin",
            "password": "senha-secreta-123",
        },
        headers=_auth(token),
    )
    assert response.status_code == 400


def test_entidade_desconhecida_retorna_400(client):
    token = _login(client, "admin@yooga.com.br", "admin123")["token"]
    assert client.get("/api/db/db_hacker", headers=_auth(token)).status_code == 400
