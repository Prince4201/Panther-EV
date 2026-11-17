import mongoose from 'mongoose';

// Mirrors frontend/types/product.ts (slug, name, category, tag, image, summary, specs) and adds what the CMS needs.
const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(-[a-z0-9]+)*$/ },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  // The `key` of a VehicleCategory (e.g. "passenger"). Categories are managed in Admin > Vehicles, not hardcoded.
  category: { type: String, required: true, trim: true, lowercase: true, maxlength: 80, index: true },
  tag: { type: String, trim: true, maxlength: 40, default: '' },
  summary: { type: String, trim: true, maxlength: 300, default: '' },
  description: { type: String, trim: true, maxlength: 4000, default: '' },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  gallery: [{ _id: false, url: String, publicId: { type: String, default: '' } }],
  specs: [{ _id: false, label: { type: String, trim: true, maxlength: 60 }, value: { type: String, trim: true, maxlength: 200, default: null } }],
  price: { type: Number, min: 0, default: null }, // null = "Contact Panther for the latest price"
  order: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
