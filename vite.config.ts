import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-mock',
        configureServer(server) {
          server.middlewares.use('/api/contact', (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  // Simula successo e ritorna mailto fallback
                  const subject = encodeURIComponent(
                    `New project: ${data.projectType || 'inquiry'}`,
                  );
                  const text = `Hi Antonio, my name is ${data.name}.\n\nI need a ${data.projectType || 'project'} for a ${data.clientType || 'client'}, focused on ${data.focus || 'design'}.\nBudget ${data.budget || 'TBD'}, in ${data.timeline || 'TBD'}.\n\nReach me at ${data.email || 'your@email.com'}.`;
                  const bodyEncoded = encodeURIComponent(text);
                  const mailtoHref = `mailto:antonio.salvatore.calo@gmail.com?subject=${subject}&body=${bodyEncoded}`;

                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      fallback: 'mailto',
                      mailtoHref,
                    }),
                  );
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid request body' }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
          });
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('/node_modules/')) return undefined;

            if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
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

            if (id.includes('/node_modules/gsap/ScrollTrigger')) {
              return 'vendor-gsap-scroll';
            }

            if (id.includes('/node_modules/gsap/')) {
              return 'vendor-gsap';
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
