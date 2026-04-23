/**
 * Keep-alive utility — pings the backend every 4 minutes so Render never
 * spins the server down, eliminating the cold-start delay on page load.
 */
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

let keepAliveInterval = null;

export function startKeepAlive() {
  if (keepAliveInterval) return; // already running

  const ping = () => {
    fetch(`${BASE_URL}/api/health`, { method: 'GET', cache: 'no-store' })
      .catch(() => {}); // silently ignore errors
  };

  // Ping immediately on call, then every 4 minutes
  ping();
  keepAliveInterval = setInterval(ping, 4 * 60 * 1000);
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}
