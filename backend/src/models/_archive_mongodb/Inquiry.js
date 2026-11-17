import mongoose from 'mongoose';

// Enquiry cart + contact form. Vehicles are stored by slug/name so the record stays readable even if a model is renamed later.
const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  city: { type: String, trim: true, maxlength: 80, default: '' },
  subject: { type: String, trim: true, maxlength: 120, default: '' },
  message: { type: String, trim: true, maxlength: 1500, default: '' },
  vehicles: [{ _id: false, slug: String, name: String }],
  country: { type: String, trim: true, maxlength: 2, default: 'IN' },
  // No longer collected (the Quick Enquiry popup asks for name, phone and message only). Kept so older enquiries still show it.
  vehicleInterest: { type: String, trim: true, maxlength: 80, default: '' },
  source: { type: String, enum: ['cart', 'contact', 'quick-enquiry'], default: 'contact', index: true },
  // not_applicable: not a quick enquiry. sent: delivered by the WhatsApp API. pending_user: the visitor was given a
  // WhatsApp link to send it themselves (we cannot know whether they did). failed: the API refused it.
  whatsappStatus: { type: String, enum: ['not_applicable', 'sent', 'pending_user', 'failed'], default: 'not_applicable' },
  status: { type: String, enum: ['new', 'assigned', 'contacted', 'in_progress', 'waiting_for_user', 'converted', 'completed', 'cancelled'], default: 'new', index: true },
  // Responsible admin. Set only by a super admin.
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null, index: true },
  assignedAt: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
