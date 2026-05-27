const BACKEND_URL = "http://localhost:8000";
const BACKEND_API_KEY = import.meta.env.VITE_BACKEND_API_KEY || "";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };
  if (BACKEND_API_KEY) {
    headers["X-API-Key"] = BACKEND_API_KEY;
  }
  
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(`${BACKEND_URL}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`API returned status ${res.status}`);
  }
  return await res.json();
}
