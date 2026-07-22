import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/__tests__/**/*.test.ts", "src/__tests__/**/*.test.tsx"],
    setupFiles: [],
    // Charge .env.local (et .env) pour que STUDENT_JWT_SECRET et les
    // variables Supabase soient dispos lors des tests d'auth.
    env: loadEnv(),
  },
});

function loadEnv(): Record<string, string> {
  const fs = require("node:fs");
  const env: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    try {
      const text = fs.readFileSync(file, "utf8");
      for (const line of text.split("\n")) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && !(m[1] in env)) {
          env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      // fichier absent : on ignore
    }
  }
  return env;
}
