/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // @bank/ui подключена ссылкой на папку и видит свою копию React в ../bank-ui/node_modules.
    // dedupe заставляет всех брать React приложения — иначе два React и хуки падают.
    dedupe: ['react', 'react-dom'],
  },
  css: {
    modules: {
      generateScopedName: '[name]_[local]_[hash:base64:5]',
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Фронтенд и бэкенд на одном адресе: cookie JSESSIONID (SameSite=Strict) работает, CORS не нужен.
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
