// Single-file build: bundles the whole game (JS, CSS, board image, sprites)
// into one self-contained dist-single/index.html that opens from file://.
// Usage: npx vite build --config vite.singlefile.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./",
  define: {
    "import.meta.env.VITE_SINGLEFILE": JSON.stringify("1"),
  },
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-single",
    assetsInlineLimit: 100 * 1024 * 1024,
    chunkSizeWarningLimit: 100 * 1024,
  },
});
