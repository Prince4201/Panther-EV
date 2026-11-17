import mongoose from 'mongoose';

// Audit trail for important actions (assignments, status changes, product + admin changes, ...).
const activityLogSchema = new mongoose.Schema({
  actor: { id: { type: mongoose.Schema.Types.ObjectId, default: null }, name: String, role: String },
  action: { type: String, required: true, index: true },   // e.g. enquiry.assigned
  summary: { type: String, required: true, maxlength: 400 },
  entityType: { type: String, default: '', index: true },  // enquiry | product | admin | user | finance
  entityId: { type: String, default: '', index: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
