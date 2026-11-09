import { defineConfig, createLogger } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API = 'http://localhost:5000';
let warned = false;

// Vite prints a full stack trace for every failed proxy request. While the API is still
// starting (e.g. the first-run MongoDB download) that floods the terminal, so drop those
// connection errors; the one-line hint below explains the situation instead.
const logger = createLogger();
const logError = logger.error;
logger.error = (msg, options) => {
  const code = options?.error?.code;
  if (String(msg).includes('http proxy error') && (code === 'ECONNREFUSED' || code === 'ETIMEDOUT')) return;
  logError(msg, options);
};

export default defineConfig({
  customLogger: logger,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API,
        configure(proxy) {
          // When the Express API isn't running, explain it instead of a bare 502.
          proxy.on('error', (err, req, res) => {
            if (!warned) {
              warned = true;
              console.warn(
                `\n⚠️  API not reachable at ${API} (${err.code || err.message}). Waiting for it to start…\n` +
                  '   If this persists, run "npm run dev" from the repo ROOT folder (not inside client/)\n' +
                  '   and check the [api] lines in this terminal.\n'
              );
            }
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: `API server is not running on ${API}. Check the [api] logs in your terminal.` }));
            }
          });
          proxy.on('proxyRes', () => {
            warned = false;
          });
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
