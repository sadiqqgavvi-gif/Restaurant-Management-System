import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API = 'http://localhost:5000';
let warned = false;

export default defineConfig({
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
                `\n⚠️  API not reachable at ${API} (${err.code || err.message}).\n` +
                  '   Run "npm run dev" from the repo ROOT folder (not inside client/) so the API starts too,\n' +
                  '   and check the [api] lines in this terminal for its error.\n'
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
