/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dotenv from "dotenv";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "url";

dotenv.config({ path: "../../.env" });

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "dist/",
    emptyOutDir: true,
  },
  define: {
    "import.meta.env.VITE_CANISTER_ID_BACKEND": JSON.stringify(
      "bd3sg-teaaa-aaaaa-qaaba-cai",
    ),
    "import.meta.env.VITE_CANISTER_ID_AUDIT_REGISTRY": JSON.stringify(
      "bkyz2-fmaaa-aaaaa-qaaaq-cai",
    ),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
    allowedHosts: [],
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
    ],
    dedupe: ["@dfinity/agent"],
  },
  test: {
    environment: "jsdom",
    setupFiles: "frontend-test-setup.ts",
    globals: true,
  },
});
