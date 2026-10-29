import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',

  preview: {
    allowedHosts: ['terminal.local'],
  },

  plugins: [
    viteSingleFile(),
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
