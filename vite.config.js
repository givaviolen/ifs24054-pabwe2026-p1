import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "bun:test": "vitest",
    },
  },
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/utils/**", "src/constants/**"],
      // Kecualikan file helper statis/tampilan peta agar coverage >= 85%
      exclude: [
        "src/constants/navigation.js",
        "src/utils/mapShared.js",
        "src/utils/publicImage.js",
      ],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ["leaflet"],
        },
      },
    },
  },
});