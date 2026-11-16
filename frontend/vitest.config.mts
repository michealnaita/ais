import { defineConfig } from "vitest/config";

/* Unit and component tests (Vitest + React Testing Library).
   Vite 8 compiles TSX and resolves the tsconfig `@/*` alias on its own,
   so no React or tsconfig-paths plugin is needed. */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
