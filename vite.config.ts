import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Semua request ke /api/* diteruskan ke backend Express
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // Tidak ada rewrite — path /api tetap dikirim ke backend
        // sehingga cocok dengan route backend: app.use("/api/auth", ...)
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});