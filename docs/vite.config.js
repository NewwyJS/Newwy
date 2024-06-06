import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: './src/index.html',
      },
    },
  },
  server: {
    open: './src/index.html',
    port: process.env.PORT || 5173
  },
});