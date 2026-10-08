import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// The five design previews are standalone static pages: no React, no shared
// runtime. They exist only so a theme can be compared side by side and then
// promoted into src/. They are separate rollup inputs so their CSS never lands
// in the main app's bundle or budget.
const designPages = [1, 2, 3, 4, 5].map((n) =>
  path.resolve(here, `design-v${n}/index.html`)
);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(here, 'src'),
      },
    },
    build: {
      rollupOptions: {
        input: [path.resolve(here, 'index.html'), path.resolve(here, 'design/index.html'), ...designPages],
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify. File watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
