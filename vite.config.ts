import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { echovoxMockApiPlugin } from './vite/mock-api-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), echovoxMockApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
