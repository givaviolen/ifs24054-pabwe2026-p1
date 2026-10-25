import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Menyisipkan CSS awal langsung ke HTML agar tidak ada permintaan yang memblokir render,
// dan memberi prioritas rendah pada skrip modul agar tidak membentuk rantai permintaan kritis.
function optimizeEntryAssets() {
  return {
    name: "optimize-entry-assets",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle ?? {};
        return html
          .replace(/<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g, (tag, file) => {
            const asset = bundle[file];
            return asset ? `<style>${asset.source}</style>` : tag;
          })
          .replace('<script type="module"', '<script type="module" fetchpriority="low"');
      },
    },
  };
}

export default defineConfig({
  plugins: [vue(), optimizeEntryAssets()],
  resolve: {
    alias: {
      "bun:test": "vitest",
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
    },
  },
});