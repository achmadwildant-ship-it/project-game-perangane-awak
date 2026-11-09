import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE ?? "/",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
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

