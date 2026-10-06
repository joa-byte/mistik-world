import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: 'src/widget/mistik-product.ts',
      name: 'MistikProduct',
      formats: ['iife'],
      fileName: () => 'mistik-product.js',
    },
    outDir: 'dist-widget',
    minify: 'esbuild',
  },
});
