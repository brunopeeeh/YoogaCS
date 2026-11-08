"""
Testes unitários do módulo de autenticação (backend/auth.py).

Executar com:  backend/.venv/Scripts/python -m pytest backend/tests -q
"""

import hashlib
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth import (  # noqa: E402
    AuthError,
    AuthenticatedUser,
    decode_token,
    extract_bearer_token,
    hash_password,
    is_legacy_sha256_hash,
    issue_token,
    user_from_payload,
    verify_password,
)


def test_hash_password_gera_bcrypt_sem_revelar_a_senha():
    hashed = hash_password("senha-super-secreta")
    assert hashed.startswith("$2")
    assert "senha-super-secreta" not in hashed
    assert verify_password("senha-super-secreta", hashed)[0] is True
    assert verify_password("outra-senha", hashed)[0] is False


def test_senha_igual_ao_hash_armazenado_falha():
    hashed = hash_password("abc12345")
    assert verify_password(hashed, hashed)[0] is False


def test_hash_legado_sha256_e_verificado_e_marcado_para_upgrade():
    legacy = hashlib.sha256(b"senha123").hexdigest()
    assert is_legacy_sha256_hash(legacy) is True

    ok, needs_rehash = verify_password("senha123", legacy)
    assert ok is True
    assert needs_rehash is True


def test_texto_puro_nunca_e_aceito():
    ok, needs_rehash = verify_password("admin123", "admin123")
    assert ok is False
    assert needs_rehash is False


def test_hash_desconhecido_e_rejeitado():
    ok, needs_rehash = verify_password("admin123", "hash-em-formato-desconhecido")
    assert ok is False
    assert needs_rehash is False


def test_token_roundtrip():
    os.environ["AUTH_JWT_SECRET"] = "segredo-de-teste"
    user = AuthenticatedUser(id="u1", email="a@b.com", full_name="A", role="admin")

    token, expires_at = issue_token(user)
    payload = decode_token(token)

    assert payload["sub"] == "u1"
    assert payload["role"] == "admin"
    assert expires_at > 0
    assert user_from_payload(payload).is_admin is True


def test_token_assinado_com_outro_segredo_e_rejeitado():
    os.environ["AUTH_JWT_SECRET"] = "segredo-1"
    token, _ = issue_token(AuthenticatedUser(id="u1", email="a@b.com", full_name="A", role="agent"))

    os.environ["AUTH_JWT_SECRET"] = "segredo-2"
    with pytest.raises(AuthError):
        decode_token(token)


def test_token_expirado_e_rejeitado():
    os.environ["AUTH_JWT_SECRET"] = "segredo-de-teste"
    token, _ = issue_token(
        AuthenticatedUser(id="u1", email="a@b.com", full_name="A", role="agent"),
        ttl_seconds=-10,
    )
    with pytest.raises(AuthError):
        decode_token(token)


def test_extract_bearer_token():
    assert extract_bearer_token("Bearer abc.def.ghi") == "abc.def.ghi"
    assert extract_bearer_token("bearer abc") == "abc"
    assert extract_bearer_token("Basic abc") is None
    assert extract_bearer_token("abc") is None
    assert extract_bearer_token(None) is None
