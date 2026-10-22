import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on any GitHub Pages path.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Pre-transform the module graph so the Codespaces port proxy isn't hit with a cold burst of ~150 requests.
  server: { warmup: { clientFiles: ['./src/main.tsx'] }, ...(process.env.CODESPACES ? { hmr: { clientPort: 443 } } : {}) },
  test: { environment: 'node' },
});
