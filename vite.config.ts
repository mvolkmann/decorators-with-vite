import { defineConfig } from "vite";

// This is required to get Vite to transpile decorators.ts!
export default defineConfig({
  esbuild: {
    target: "es2022", // stage 3 decorators require ES2022+
    include: /\.[jt]s$/,
    loader: "ts",
  },
});
