import nodemailer from 'nodemailer';
import { env } from './env.js';

const configured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
let transporter;

/** Sends through SMTP when SMTP_* are set. In development without SMTP the message is printed to the backend console instead. */
export async function sendMail({ to, subject, text, html }) {
  if (!configured()) {
    if (!env.isProd) { console.log(`\n[mail:dev] To: ${to}\nSubject: ${subject}\n${text}\n`); return { dev: true }; }
    console.error('SMTP is not configured: e-mail not sent.');
    return { skipped: true };
  }
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
  return transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, text, html });
}
