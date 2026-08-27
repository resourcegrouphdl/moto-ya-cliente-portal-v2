import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Vitest corre sobre Vite, independiente del bundler que usa la app en sí (Turbopack) -- mismo criterio
// que cualquier app Next.js que agrega testing: no hace falta que compartan bundler, ver
// motoya-portal-cliente-pwa-y-testing.md §2.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // El pool por defecto ("forks") se cuelga esperando a que arranque el worker en este entorno
    // Windows/sandbox (timeout a los 60s, 0 tests corridos) -- "threads" corre los mismos tests en
    // hilos en vez de procesos hijo y no tiene ese problema. Si esto se corre alguna vez en CI Linux,
    // vale la pena confirmar si "forks" ya funciona ahí antes de asumir que hace falta este cambio.
    pool: "threads",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
