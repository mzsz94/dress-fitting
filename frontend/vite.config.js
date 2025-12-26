import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fix-proxy-strip',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith('/proxy/5173/')) {
            req.url = '/proxy/5173' + req.url;
          }
          next();
        });
      }
    }
  ],
  base: '/proxy/5173/',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['sz-code.mzsz.site']
  }
})
