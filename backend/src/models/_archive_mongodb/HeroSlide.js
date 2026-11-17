import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  subtitle: { type: String, trim: true, maxlength: 200, default: '' },
  description: { type: String, trim: true, maxlength: 400, default: '' },
  image: { type: String, required: true },
  imagePublicId: { type: String, default: '' },
  mobileImage: { type: String, default: '' },
  mobileImagePublicId: { type: String, default: '' },
  imageAlt: { type: String, trim: true, maxlength: 200, default: '' },
  // "cover" fills the banner (lifestyle photo). "contain" shows a vehicle cut-out on a plain background.
  fit: { type: String, enum: ['cover', 'contain'], default: 'cover' },
  bgColor: { type: String, default: '#EEF0F2' },
  textColor: { type: String, enum: ['dark', 'light'], default: 'dark' },
  textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
  overlay: { type: Number, min: 0, max: 100, default: 0 },
  button1Text: { type: String, trim: true, maxlength: 40, default: '' },
  button1Url: { type: String, trim: true, default: '' },
  button2Text: { type: String, trim: true, maxlength: 40, default: '' },
  button2Url: { type: String, trim: true, default: '' },
  order: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true, index: true },
  // null = use the default time from Settings
  duration: { type: Number, min: 2000, max: 20000, default: null },
}, { timestamps: true });

export const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
