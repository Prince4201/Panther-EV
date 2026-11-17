import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  line1: { type: String, trim: true, maxlength: 160, default: '' },
  city: { type: String, trim: true, maxlength: 80, default: '' },
  state: { type: String, trim: true, maxlength: 80, default: '' },
  pincode: { type: String, trim: true, maxlength: 12, default: '' },
  country: { type: String, trim: true, maxlength: 80, default: 'India' },
}, { _id: false });

const adminSchema = new mongoose.Schema({
  name: { type: String, default: 'Panther Admin', trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  // super_admin (was "owner") or admin (was "editor"). Legacy values are migrated on server start.
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin', index: true },
  permissions: [{ type: String }],
  active: { type: Boolean, default: true },
  phone: { type: String, trim: true, maxlength: 20, default: '' },
  avatar: { type: String, default: '' },
  address: { type: addressSchema, default: () => ({}) },
  mustChangePassword: { type: Boolean, default: false },
  passwordChangedAt: Date,
  tokenVersion: { type: Number, default: 0 }, // bumped on password change/reset: older sessions stop working
  lastLoginAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
}, { timestamps: true });

export const Admin = mongoose.model('Admin', adminSchema);
