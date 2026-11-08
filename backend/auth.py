"""
Autenticação do Yooga CS Coach.

Este módulo concentra a parte sensível de credenciais do backend:

* **Senhas** — gravadas com bcrypt (custo configurável). Para facilitar a migração
  dos hashes legados, o SHA-256 (64 caracteres hex) ainda pode ser *verificado*,
  o que dispara um upgrade automático para bcrypt no primeiro login bem-sucedido.
  Senhas em texto puro **não** são aceitas.
* **Sessão** — JWT HS256 assinado com ``AUTH_JWT_SECRET`` e enviado pelo frontend
  no header ``Authorization: Bearer <token>``.

O módulo não depende de FastAPI para que possa ser testado de forma isolada.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional, Tuple

import bcrypt
import jwt

JWT_ALGORITHM = "HS256"
DEFAULT_TTL_SECONDS = 8 * 60 * 60  # 8 horas
DEFAULT_BCRYPT_ROUNDS = 12
MIN_BCRYPT_ROUNDS = 4
MAX_BCRYPT_ROUNDS = 16

_SHA256_HEX_RE = re.compile(r"^[0-9a-f]{64}$")
_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2x$", "$2y$")

_ephemeral_secret: Optional[str] = None


class AuthError(Exception):
    """Falha de autenticação. A mensagem é segura para ser devolvida ao cliente."""


@dataclass(frozen=True)
class AuthenticatedUser:
    """Usuário autenticado extraído do token (nunca do corpo da requisição)."""

    id: str
    email: str
    full_name: str
    role: str

    @property
    def is_admin(self) -> bool:
        return (self.role or "").strip().lower() == "admin"

    def to_public_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
        }


# ─── Senhas ──────────────────────────────────────────────────────────────────


def _bcrypt_rounds() -> int:
    try:
        rounds = int(os.getenv("AUTH_BCRYPT_ROUNDS", DEFAULT_BCRYPT_ROUNDS))
    except (TypeError, ValueError):
        rounds = DEFAULT_BCRYPT_ROUNDS
    return max(MIN_BCRYPT_ROUNDS, min(rounds, MAX_BCRYPT_ROUNDS))


def hash_password(password: str) -> str:
    """Gera um hash bcrypt ($2b$) para a senha informada."""
    if not isinstance(password, str) or not password:
        raise ValueError("Senha não pode ser vazia")
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=_bcrypt_rounds()))
    return hashed.decode("utf-8")


def is_bcrypt_hash(stored: str) -> bool:
    return bool(stored) and stored.startswith(_BCRYPT_PREFIXES)


def is_legacy_sha256_hash(stored: str) -> bool:
    """True para hashes SHA-256 legados (64 caracteres hexadecimais)."""
    return bool(stored) and bool(_SHA256_HEX_RE.match(stored.strip().lower()))


def bcrypt_cost(stored: str) -> int:
    """Custo (rounds) de um hash bcrypt já existente."""
    try:
        parts = stored.split("$")
        return int(parts[2])
    except (IndexError, ValueError):
        return 0


def verify_password(password: str, stored_hash: str) -> Tuple[bool, bool]:
    """
    Verifica a senha contra o hash armazenado.

    Retorna ``(senha_valida, precisa_rehash)``. O segundo valor indica que o hash
    deve ser regravado (legado SHA-256 ou bcrypt com custo abaixo do configurado).
    Senhas em texto puro nunca são aceitas.
    """
    if not password or not stored_hash:
        return False, False

    if is_bcrypt_hash(stored_hash):
        try:
            valid = bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))
        except (ValueError, TypeError):
            return False, False
        return valid, valid and bcrypt_cost(stored_hash) < _bcrypt_rounds()

    if is_legacy_sha256_hash(stored_hash):
        digest = hashlib.sha256(password.encode("utf-8")).hexdigest()
        valid = hmac.compare_digest(digest, stored_hash.strip().lower())
        return valid, valid

    # Formato desconhecido (ex.: senha em texto puro gravada por engano): rejeitado.
    return False, False


def burn_password_check(password: str) -> None:
    """
    Executa um check bcrypt descartável.

    Usado quando o e-mail não existe, para que o tempo de resposta do login não
    revele quais contas existem (enumeração de usuários).
    """
    try:
        bcrypt.checkpw(
            (password or "").encode("utf-8"),
            b"$2b$12$HsgHl57K/DYTD4AwQTmBn.pAAwfEhgN6jVaRc0HVeE/O5mTEqs6CK",
        )
    except (ValueError, TypeError):
        pass


# ─── Segredo e tokens ────────────────────────────────────────────────────────


def get_secret() -> str:
    """
    Segredo usado para assinar/verificar os tokens.

    Usa ``AUTH_JWT_SECRET`` quando configurado. Sem ele, gera um segredo efêmero
    por processo (recomendado apenas para desenvolvimento: os tokens deixam de
    valer quando o backend reinicia).
    """
    global _ephemeral_secret

    secret = os.getenv("AUTH_JWT_SECRET", "").strip()
    if secret:
        if len(secret.encode("utf-8")) < 32:
            print(
                "[Yooga Auth] AVISO - AUTH_JWT_SECRET tem menos de 32 caracteres. "
                "Use um segredo longo e aleatorio."
            )
        return secret

    if _ephemeral_secret is None:
        _ephemeral_secret = secrets.token_urlsafe(48)
        print(
            "[Yooga Auth] AVISO - AUTH_JWT_SECRET não configurado. Usando segredo "
            "efêmero: os tokens serão invalidados a cada reinício do backend."
        )
    return _ephemeral_secret


def has_persistent_secret() -> bool:
    return bool(os.getenv("AUTH_JWT_SECRET", "").strip())


def issue_token(user: AuthenticatedUser, ttl_seconds: Optional[int] = None) -> Tuple[str, int]:
    """Emite um JWT para o usuário. Retorna ``(token, expires_at_epoch)``."""
    if ttl_seconds is None:
        try:
            ttl_seconds = int(os.getenv("AUTH_JWT_TTL_SECONDS", DEFAULT_TTL_SECONDS))
        except (TypeError, ValueError):
            ttl_seconds = DEFAULT_TTL_SECONDS

    issued_at = int(time.time())
    expires_at = issued_at + int(ttl_seconds)
    payload = {
        "sub": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "iat": issued_at,
        "exp": expires_at,
    }

    token = jwt.encode(payload, get_secret(), algorithm=JWT_ALGORITHM)
    if isinstance(token, bytes):  # PyJWT < 2
        token = token.decode("utf-8")
    return token, expires_at


def decode_token(token: str) -> Dict[str, Any]:
    """Valida a assinatura/expiração do token e devolve o payload."""
    if not token:
        raise AuthError("Token ausente")

    try:
        payload = jwt.decode(token, get_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise AuthError("Sessão expirada. Faça login novamente.") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthError("Token inválido. Faça login novamente.") from exc

    if not payload.get("sub"):
        raise AuthError("Token inválido. Faça login novamente.")
    return payload


def user_from_payload(payload: Dict[str, Any]) -> AuthenticatedUser:
    return AuthenticatedUser(
        id=str(payload.get("sub", "")),
        email=str(payload.get("email", "")),
        full_name=str(payload.get("full_name", "")),
        role=str(payload.get("role", "agent")),
    )


def extract_bearer_token(header_value: Optional[str]) -> Optional[str]:
    """Extrai o token do header ``Authorization: Bearer <token>``."""
    if not header_value:
        return None
    parts = header_value.split(None, 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None
