import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['ws', '@deriv/deriv-api']
  },
  build: {
    rollupOptions: {
      external: ['metaapi.cloud-sdk']
    }
  }
})

