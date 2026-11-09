import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE ?? "/",
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    rollupOptions: {
      // Exclude dev-only pages from production build
      ...(mode === "production"
        ? {
            external: (id: string) =>
              id.includes("/dev/") && !id.includes("node_modules"),
          }
        : {}),
    },
  },
}));

