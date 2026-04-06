import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["phaser"]
  },
  resolve: {
    alias: {
      "@game-core": resolve(__dirname, "../../packages/game-core/src")
    }
  },
  server: {
    port: 5173
  }
});
