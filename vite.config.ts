import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Content-Security-Policy of the built interface (threat model: XSS). Only in the build,
 * because the dev server needs inline scripts. `style-src 'unsafe-inline'` is required by
 * CodeMirror, which adds its styles at runtime; scripts stay restricted to the own origin.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

function contentSecurityPolicy(): Plugin {
  return {
    name: "skriptorium-csp",
    apply: "build",
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: {
          "http-equiv": "Content-Security-Policy",
          content: CONTENT_SECURITY_POLICY,
        },
        injectTo: "head-prepend",
      },
    ],
  };
}

export default defineConfig({
  root: "ui",
  plugins: [react(), contentSecurityPolicy()],
  build: { outDir: "../dist/ui", emptyOutDir: true },
  // Development only: forward API calls to the Python server on port 8000.
  server: { proxy: { "/api": "http://127.0.0.1:8000" } },
  test: {
    root: ".",
    environment: "jsdom",
    setupFiles: ["ui/test-setup.ts"],
    include: ["ui/**/*.test.ts", "ui/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["ui/src/**"],
      // main.tsx only mounts the app into index.html; covered by the build, not by unit tests.
      exclude: [
        "ui/src/main.tsx",
        "ui/src/**/*.test.tsx",
        "ui/src/**/*.test.ts",
      ],
      thresholds: { lines: 80, branches: 70 },
      reporter: ["text"],
    },
  },
});
