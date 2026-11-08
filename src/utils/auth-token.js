/**
 * Sessão autenticada do Yooga CS Coach.
 *
 * O login é feito no backend (`POST /api/auth/login`), que devolve um JWT.
 * O token é guardado em `sessionStorage` — mesmo ciclo de vida da sessão
 * (`current_user`) — e enviado em `Authorization: Bearer <token>` em todas as
 * chamadas ao proxy `/api/db/*`.
 *
 * Nada de credencial fica no bundle: a API key do backend continua sendo apenas
 * um identificador de cliente, e a autorização real é feita pelo papel do token.
 */

const TOKEN_KEY = "yooga_auth_token";
const USER_KEY = "current_user";

export function getAuthToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(user, token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage indisponível (modo privado) — a sessão não persiste */
  }
}

export function clearAuthSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}
