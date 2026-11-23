import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Referenca (prototip) ima svoje testove (node --test), nije deo ovog projekta.
    exclude: ["**/node_modules/**", "referenca/**"],
  },
});
