import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on any GitHub Pages path.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
});
