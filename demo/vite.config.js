import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from parent directory
      allow: [".."],
    },
  },
  build: {
    target: "es2020",
  },
  // Enable public directory serving for sprite assets
  publicDir: "public", // Re-enable public dir
  assetsInclude: ["**/*.png", "**/*.json"],
});
