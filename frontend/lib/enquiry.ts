export const STATUSES = ['new', 'assigned', 'contacted', 'in_progress', 'waiting_for_user', 'converted', 'completed', 'cancelled'] as const;
export type EnquiryStatus = (typeof STATUSES)[number];
const labels: Record<string, string> = { new: 'New', assigned: 'Assigned', contacted: 'Contacted', in_progress: 'In progress', waiting_for_user: 'Waiting for customer', converted: 'Converted', completed: 'Completed', cancelled: 'Cancelled' };
export const statusLabel = (s: string) => labels[s] ?? s;
export const statusTone = (s: string) => ({ new: 'bg-blue-50 text-blue-800', assigned: 'bg-indigo-50 text-indigo-800', contacted: 'bg-cyan-50 text-cyan-800', in_progress: 'bg-amber-50 text-amber-800', waiting_for_user: 'bg-purple-50 text-purple-800', converted: 'bg-emerald-100 text-emerald-900', completed: 'bg-green-50 text-green-800', cancelled: 'bg-gray-100 text-gray-700' } as Record<string, string>)[s] ?? 'bg-fog';
/** Solid colour for the dashboard progress bar. */
export const statusBar = (s: string) => ({ new: 'bg-blue-500', assigned: 'bg-indigo-500', contacted: 'bg-cyan-500', in_progress: 'bg-amber-500', waiting_for_user: 'bg-purple-500', converted: 'bg-emerald-600', completed: 'bg-green-600', cancelled: 'bg-gray-400' } as Record<string, string>)[s] ?? 'bg-gray-400';
export const fmtDate = (d?: string | Date | null, time = false) => (d ? new Date(d).toLocaleString('en-IN', time ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', year: 'numeric' }) : '–');

export const SOURCES = ['quick-enquiry', 'contact', 'cart'] as const;
export const sourceLabel = (s: string) => ({ 'quick-enquiry': 'Quick enquiry', contact: 'Contact form', cart: 'Enquiry cart' } as Record<string, string>)[s] ?? s;
/** WhatsApp state of a quick enquiry. "pending_user" = the visitor was handed a WhatsApp link; whether they pressed Send is unknown. */
export const whatsappLabel = (s?: string) => ({ sent: 'Sent', pending_user: 'Link given to visitor', failed: 'Failed' } as Record<string, string>)[s ?? ''] ?? '–';
export const whatsappTone = (s?: string) => ({ sent: 'bg-green-50 text-green-800', pending_user: 'bg-amber-50 text-amber-800', failed: 'bg-red-50 text-panther-red' } as Record<string, string>)[s ?? ''] ?? '';
