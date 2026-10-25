import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Menyisipkan CSS utama langsung ke index.html agar tidak menjadi permintaan
// yang memblokir render (render-blocking). Meningkatkan FCP dan LCP.
function inlineCriticalCss() {
  return {
    name: "inline-critical-css",
    apply: "build",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle || {};
        return html.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g, (tag, file) => {
          const asset = bundle[file];
          if (!asset || asset.type !== "asset") return tag;
          return `<style>${String(asset.source)}</style>`;
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [vue(), inlineCriticalCss()],
  server: { port: 5173 },
  preview: { port: 5173 },
});