import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const assetsRedirect = (): Plugin => ({
  name: "assets-redirect",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && req.url.startsWith("/src/frontend/assets/")) {
        req.url = req.url.replace("/src/frontend/assets/", "/src/assets/");
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), assetsRedirect()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "/src/frontend/assets": path.resolve(__dirname, "src/assets"),
    },
  },
  build: {
    cssMinify: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide-react")) return "vendor-icons";
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react";
            }
            return "vendor-libs";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    },
  },
});
