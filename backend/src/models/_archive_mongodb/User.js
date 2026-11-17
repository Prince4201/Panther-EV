import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  line1: { type: String, trim: true, maxlength: 160, default: '' },
  city: { type: String, trim: true, maxlength: 80, default: '' },
  state: { type: String, trim: true, maxlength: 80, default: '' },
  pincode: { type: String, trim: true, maxlength: 12, default: '' },
  country: { type: String, trim: true, maxlength: 80, default: 'India' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, maxlength: 20, default: '' },
  passwordHash: { type: String, required: true, select: false },
  avatar: { type: String, default: '' },
  address: { type: addressSchema, default: () => ({}) },
  active: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0 },
  lastActiveAt: Date,
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
