import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import nodemailer from 'nodemailer';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const contactEmail = env.CONTACT_EMAIL || 'antonio.salvatore.calo@gmail.com';
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
                  const text = `Hi Antonio, my name is ${data.name}.\n\nI need a ${data.projectType || 'project'} for a ${data.clientType || 'client'}, focused on ${data.focus || 'design'}.\nBudget ${data.budget || 'TBD'}, in ${data.timeline || 'TBD'}.\n\nReach me at ${data.email || 'your@email.com'}.`;
                  res.setHeader('Content-Type', 'application/json');

                  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
                    const subject = encodeURIComponent(`New project: ${data.projectType || 'inquiry'}`);
                    const bodyEncoded = encodeURIComponent(text);
                    res.end(JSON.stringify({
                      success: true,
                      fallback: 'mailto',
                      mailtoHref: `mailto:${contactEmail}?subject=${subject}&body=${bodyEncoded}`,
                    }));
                    return;
                  }

                  const transporter = nodemailer.createTransport({
                    host: env.SMTP_HOST,
                    port: Number(env.SMTP_PORT) || 587,
                    secure: Number(env.SMTP_PORT) === 465,
                    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
                  });

                  void transporter.sendMail({
                    from: env.SMTP_USER,
                    to: contactEmail,
                    replyTo: data.email,
                    subject: `New project inquiry: ${data.projectType || 'inquiry'} from ${data.name || 'unknown'}`,
                    text,
                  }).then(() => {
                    res.end(JSON.stringify({ success: true, message: 'Message sent successfully.' }));
                  }).catch((error) => {
                    console.error('Contact API error:', error);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ success: false, error: 'Failed to send message.' }));
                  });
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
