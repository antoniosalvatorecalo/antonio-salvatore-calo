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
  locale?: 'EN' | 'IT';
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

function isItalian(data: ContactBody): boolean {
  return data.locale === 'IT';
}

function buildEmailHtml(data: ContactBody): string {
  const italian = isItalian(data);
  const lines = [
    `<p><strong>${italian ? 'Ciao Antonio,' : 'Hi Antonio,'}</strong></p>`,
    `<p>${italian ? 'Mi chiamo' : 'My name is'} <strong>${escapeHtml(data.name!)}</strong>.</p>`,
    italian
      ? `<p>Mi serve <strong>${escapeHtml(data.projectType!)}</strong> per <strong>${escapeHtml(data.clientType!)}</strong>, con focus su <strong>${escapeHtml(data.focus!)}</strong>.</p>`
      : `<p>I need a <strong>${escapeHtml(data.projectType!)}</strong> for a <strong>${escapeHtml(data.clientType!)}</strong>, focused on <strong>${escapeHtml(data.focus!)}</strong>.</p>`,
    `<p>${italian ? 'Budget' : 'Budget'}: <strong>${escapeHtml(data.budget!)}</strong>, ${italian ? 'Tempistiche' : 'Timeline'}: <strong>${escapeHtml(data.timeline!)}</strong>.</p>`,
    `<p>${italian ? 'Puoi contattarmi a' : 'Reach me at'}: <a href="mailto:${escapeHtml(data.email!)}">${escapeHtml(data.email!)}</a></p>`,
  ];
  return lines.join('\n');
}

function buildEmailText(data: ContactBody): string {
  const italian = isItalian(data);
  return [
    italian ? `Ciao Antonio, mi chiamo ${data.name}.` : `Hi Antonio, my name is ${data.name}.`,
    ``,
    italian
      ? `Mi serve ${data.projectType} per ${data.clientType}, con focus su ${data.focus}.`
      : `I need a ${data.projectType} for a ${data.clientType}, focused on ${data.focus}.`,
    italian
      ? `Budget ${data.budget}, tempistiche ${data.timeline}.`
      : `Budget ${data.budget}, in ${data.timeline}.`,
    ``,
    italian ? `Puoi contattarmi a ${data.email}.` : `Reach me at ${data.email}.`,
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

  const subject = isItalian(data)
    ? `Nuova richiesta di progetto: ${data.projectType} da ${data.name}`
    : `New project inquiry: ${data.projectType} from ${data.name}`;

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
  const italian = (req.body as ContactBody | undefined)?.locale === 'IT';
  // Only accept POST
  if (req.method !== 'POST') {
    res
      .status(405)
      .json({
        error: italian ? 'Metodo non consentito. Usa POST.' : 'Method not allowed. Use POST.',
      });
    return;
  }

  const body = req.body;

  // Validate request body
  if (!validateBody(body)) {
    res.status(400).json({
      error: italian
        ? 'Campi obbligatori mancanti o non validi.'
        : 'Missing or invalid required fields.',
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
        message: italian ? 'Messaggio inviato correttamente.' : 'Message sent successfully.',
      });
    } else {
      // SMTP not configured — return mailto fallback info
      const subject = encodeURIComponent(
        italian ? `Nuovo progetto: ${data.projectType}` : `New project: ${data.projectType}`,
      );
      const text = buildEmailText(data);
      const bodyEncoded = encodeURIComponent(text);
      const mailtoHref = `mailto:${config.contactEmail}?subject=${subject}&body=${bodyEncoded}`;

      res.status(200).json({
        success: true,
        fallback: 'mailto',
        mailtoHref,
        message: italian
          ? 'Servizio email non configurato. Usa il collegamento mailto.'
          : 'Email service not configured. Use the mailto link.',
      });
    }
  } catch (error) {
    console.error('Contact API error:', error);
    res.status(500).json({
      success: false,
      error: italian
        ? 'Invio del messaggio non riuscito. Riprova o invia un’email direttamente.'
        : 'Failed to send message. Please try again or send an email directly.',
      fallback: 'mailto',
      mailtoHref: `mailto:${config.contactEmail}`,
    });
  }
}
