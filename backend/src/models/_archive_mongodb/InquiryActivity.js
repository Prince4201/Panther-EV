import mongoose from 'mongoose';

// Progress history of one enquiry. Append-only: status is never just overwritten, every change leaves a row here.
const inquiryActivitySchema = new mongoose.Schema({
  inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, index: true },
  type: { type: String, enum: ['created', 'assigned', 'status_changed', 'progress', 'note', 'report'], required: true },
  actor: { id: { type: mongoose.Schema.Types.ObjectId, default: null }, name: String, role: String },
  message: { type: String, trim: true, maxlength: 2000, default: '' },
  fromStatus: String,
  toStatus: String,
  assignedTo: { id: { type: mongoose.Schema.Types.ObjectId, default: null }, name: String },
  // internal = staff only. customer = the customer sees it under My enquiries.
  visibility: { type: String, enum: ['internal', 'customer'], default: 'internal' },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const InquiryActivity = mongoose.model('InquiryActivity', inquiryActivitySchema);
