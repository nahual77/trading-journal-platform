import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false, // Permite usar otro puerto si 5173 está ocupado
    hmr: {
      overlay: false // Desactiva overlay de errores para evitar crashes
    }
  },
  build: {
    sourcemap: false // Reduce el uso de memoria
  }
})

