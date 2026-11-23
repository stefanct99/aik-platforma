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
    exclude: ["**/node_modules/**", "referenca/**"],
  },
});
