import { env } from '../config/env.js';

const digits = (v) => String(v || '').replace(/\D/g, '');
/** Receiving number in international format without "+": a bare 10-digit number is treated as Indian (91). */
export const whatsappRecipient = () => { const d = digits(env.whatsapp.number); return d.length === 10 ? `91${d}` : d; };
export const isWhatsAppApiConfigured = () => !!(env.whatsapp.token && env.whatsapp.phoneNumberId && whatsappRecipient());

/** The message Panther receives for one quick enquiry. */
export function enquiryText(q) {
  return [
    'NEW QUICK ENQUIRY – PANTHER EV', '',
    `Name: ${q.name}`, `Phone: ${q.phone}`,
    q.email ? `Email: ${q.email}` : null, q.city ? `City: ${q.city}` : null,
    q.vehicleInterest ? `Vehicle Interest: ${q.vehicleInterest}` : null,
    q.message ? `\nMessage:\n${q.message}` : null,
  ].filter((l) => l !== null).join('\n');
}

/** Fallback: a link that opens WhatsApp with the message already typed, addressed to Panther. The visitor presses Send. */
export const whatsappLink = (text) => (whatsappRecipient() ? `https://wa.me/${whatsappRecipient()}?text=${encodeURIComponent(text)}` : '');

/**
 * Sends through the WhatsApp Business Cloud API. Returns { ok, error? }. Never throws.
 * `ok` is true only when WhatsApp accepted the message, so the website never claims a delivery that did not happen.
 */
export async function sendWhatsApp(text) {
  if (!isWhatsAppApiConfigured()) return { ok: false, error: 'not_configured' };
  const { token, phoneNumberId, templateName, templateLang } = env.whatsapp;
  const body = templateName
    // Template variables may not contain line breaks, so the enquiry is flattened to one line.
    ? { messaging_product: 'whatsapp', to: whatsappRecipient(), type: 'template', template: { name: templateName, language: { code: templateLang }, components: [{ type: 'body', parameters: [{ type: 'text', text: text.replace(/\s*\n+\s*/g, ' | ').replace(/\s{2,}/g, ' ').slice(0, 1000) }] }] } }
    : { messaging_product: 'whatsapp', to: whatsappRecipient(), type: 'text', text: { preview_url: false, body: text.slice(0, 4000) } };
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.messages?.[0]?.id) return { ok: false, error: data?.error?.message || `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}
