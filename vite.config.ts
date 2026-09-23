import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/send-email": {
        target: "https://script.google.com",
        changeOrigin: true,
        rewrite: () => "/macros/s/AKfycbwI6wjX5MGYuG7Zs8z_8PiM2TmxyXrMUTNAtg_NEnGMYjKI7Xo7x_oYvk03q_vFgMM7/exec",
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
})
