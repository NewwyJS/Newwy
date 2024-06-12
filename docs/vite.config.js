import { defineConfig } from 'vite'
import newwy from '../index.js';

export default defineConfig({
  plugins: [newwy()],
  server: {
    port: process.env.PORT || 5173
  },
});