import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('/node_modules/')) return undefined;

            if (
              id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/')
            ) {
              return 'vendor-react';
            }

            if (id.includes('/node_modules/react-router-dom/')) {
              return 'vendor-router';
            }

            if (
              id.includes('/node_modules/motion/') ||
              id.includes('/node_modules/framer-motion/')
            ) {
              return 'vendor-motion';
            }

            if (
              id.includes('/node_modules/gsap/') ||
              id.includes('/node_modules/split-type/')
            ) {
              return 'vendor-gsap';
            }

            if (id.includes('/node_modules/lenis/')) {
              return 'vendor-lenis';
            }

            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: true,
    },
  };
});
