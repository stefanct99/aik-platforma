import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // Referenca (prototip) ima svoje testove (node --test), nije deo ovog projekta.
    // e2e/ su Playwright testovi (npm run test:e2e), ne vitest - isti glob (*.spec.ts) bi ih inače pokupio.
    exclude: ["**/node_modules/**", "referenca/**", "e2e/**"],
  },
});
