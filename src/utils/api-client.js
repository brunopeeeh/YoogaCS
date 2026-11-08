import { getBackendUrl } from "./backend-url.js";
import { getAuthToken } from "./auth-token.js";

const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || "";
const REQUEST_TIMEOUT = 30000;

/**
 * Erro de API com o status HTTP preservado.
 *
 * O status permite distinguir "sem permissão" (401/403) de "backend fora do
 * ar" (5xx): no primeiro caso a aplicação NÃO pode degradar silenciosamente
 * para o localStorage, no segundo o fallback offline continua válido.
 */
export class ApiError extends Error {
  constructor(message, status = 0, detail = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  /** Falha que não deve cair no fallback local (permissão ou misconfiguração). */
  get isFatal() {
    return this.isAuthError || this.status === 503;
  }
}

export function isAuthError(err) {
  return err?.status === 401 || err?.status === 403;
}

export function isFatalError(err) {
  return isAuthError(err) || err?.status === 503;
}

export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  if (BACKEND_API_KEY) {
    headers["X-API-Key"] = BACKEND_API_KEY;
  }

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const options = { method, headers, signal: controller.signal };
  if (body) {
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${getBackendUrl()}${endpoint}`, options);
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await res.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const detail = payload?.detail || null;
    throw new ApiError(detail || `API returned status ${res.status}`, res.status, detail);
  }

  return payload;
}
