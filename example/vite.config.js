import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "./index.html",
    },
    manifest: true,
    outDir: "./dist",
  },
});
