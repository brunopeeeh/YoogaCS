import { getBackendUrl } from "./backend-url.js";

const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || "";
const REQUEST_TIMEOUT = 30000;

export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  if (BACKEND_API_KEY) {
    headers["X-API-Key"] = BACKEND_API_KEY;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  const options = { method, headers, signal: controller.signal };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(`${getBackendUrl()}${endpoint}`, options);
  clearTimeout(timeoutId);
  if (!res.ok) {
    throw new Error(`API returned status ${res.status}`);
  }
  return res.json();
}
