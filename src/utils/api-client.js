const BACKEND_URL = import.meta.env.PROD ? "" : "http://localhost:8000";
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
  
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`API returned status ${res.status} for ${method} ${endpoint}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT}ms: ${method} ${endpoint}`);
    }
    throw err;
  }
}
