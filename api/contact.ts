/**
 * Contact form API endpoint (Vercel serverless function).
 *
 * POST /api/contact
 *
 * Accepts: { name, projectType, clientType, focus, budget, timeline, email }
 * Sends email to CONTACT_EMAIL via SMTP (configured via env vars).
 * Falls back to mailto format in the response if email sending is not configured.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

interface ContactBody {
  name?: string;
  projectType?: string;
  clientType?: string;
  focus?: string;
  budget?: string;
  timeline?: string;
  email?: string;
}

interface EnvConfig {
  contactEmail: string;
  smtp: {
    host: string | undefined;
    port: number;
    user: string | undefined;
    pass: string | undefined;
  };
}

function getEnvConfig(): EnvConfig {
  return {
    contactEmail: process.env.CONTACT_EMAIL || 'antonio.salvatore.calo@gmail.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
}

function validateBody(body: unknown): body is ContactBody {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const candidate = body as Record<string, unknown>;
  const required = ['name', 'projectType', 'clientType', 'focus', 'budget', 'timeline', 'email'];
  for (const field of required) {
    const value = candidate[field];
    if (!value || typeof value !== 'string' || !value.trim()) {
      return false;
    }
  }

  // Basic email validation
  const email = candidate.email;
  if (typeof email !== 'string') {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildEmailHtml(data: ContactBody): string {
  const lines = [
    `<p><strong>Hi Antonio,</strong></p>`,
    `<p>My name is <strong>${escapeHtml(data.name!)}</strong>.</p>`,
    `<p>I need a <strong>${escapeHtml(data.projectType!)}</strong> for a <strong>${escapeHtml(data.clientType!)}</strong>, focused on <strong>${escapeHtml(data.focus!)}</strong>.</p>`,
    `<p>Budget: <strong>${escapeHtml(data.budget!)}</strong>, Timeline: <strong>${escapeHtml(data.timeline!)}</strong>.</p>`,
    `<p>Reach me at: <a href="mailto:${escapeHtml(data.email!)}">${escapeHtml(data.email!)}</a></p>`,
  ];
  return lines.join('\n');
}

function buildEmailText(data: ContactBody): string {
  return [
    `Hi Antonio, my name is ${data.name}.`,
    ``,
    `I need a ${data.projectType} for a ${data.clientType}, focused on ${data.focus}.`,
    `Budget ${data.budget}, in ${data.timeline}.`,
    ``,
    `Reach me at ${data.email}.`,
  ].join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendEmailViaSmtp(data: ContactBody, config: EnvConfig): Promise<boolean> {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  const subject = `New project inquiry: ${data.projectType} from ${data.name}`;

  await transporter.sendMail({
    from: config.smtp.user,
    to: config.contactEmail,
    replyTo: data.email,
    subject,
    text: buildEmailText(data),
    html: buildEmailHtml(data),
  });

  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const body = req.body;

  // Validate request body
  if (!validateBody(body)) {
    res.status(400).json({
      error: 'Missing or invalid required fields.',
      required: ['name', 'projectType', 'clientType', 'focus', 'budget', 'timeline', 'email'],
    });
    return;
  }

  const data = body as ContactBody;
  const config = getEnvConfig();

  try {
    const sent = await sendEmailViaSmtp(data, config);

    if (sent) {
      res.status(200).json({
        success: true,
        message: 'Message sent successfully.',
      });
    } else {
      // SMTP not configured — return mailto fallback info
      const subject = encodeURIComponent(`New project: ${data.projectType}`);
      const text = buildEmailText(data);
      const bodyEncoded = encodeURIComponent(text);
      const mailtoHref = `mailto:${config.contactEmail}?subject=${subject}&body=${bodyEncoded}`;

      res.status(200).json({
        success: true,
        fallback: 'mailto',
        mailtoHref,
        message: 'Email service not configured. Use the mailto link.',
      });
    }
  } catch (error) {
    console.error('Contact API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again or send an email directly.',
      fallback: 'mailto',
      mailtoHref: `mailto:${config.contactEmail}`,
    });
  }
}
