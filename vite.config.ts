import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: "ui",
  plugins: [react()],
  build: { outDir: "../dist/ui", emptyOutDir: true },
  test: {
    root: ".",
    include: ["ui/**/*.test.ts", "ui/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["ui/src/**"],
      // main.tsx only mounts the app into index.html; covered by the build, not by unit tests.
      exclude: ["ui/src/main.tsx", "ui/src/**/*.test.tsx"],
      thresholds: { lines: 80, branches: 70 },
      reporter: ["text"],
    },
  },
});
