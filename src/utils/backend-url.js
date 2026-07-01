/** URL do backend — usa VITE_BACKEND_URL ou o hostname atual (funciona em teste remoto/LAN). */
export function getBackendUrl() {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}
