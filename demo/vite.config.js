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
  // Serve sprite assets from parent dist folder
  publicDir: false, // Disable default public dir
  assetsInclude: ["**/*.png", "**/*.json"],
});
