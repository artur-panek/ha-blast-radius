import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../custom_components/blast_radius/frontend",
    emptyOutDir: true,
    lib: {
      entry: "src/panel.ts",
      formats: ["es"],
      fileName: () => "blast-radius.js",
    },
    sourcemap: false,
    target: "es2022",
  },
});
