import mongoose from 'mongoose';

// Vehicle categories, managed in Admin > Vehicles. Unlimited: nothing about categories is hardcoded.
const vehicleCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  // What a Product stores in `category`. Set once when the category is created and never changed,
  // so renaming a category can never orphan its vehicles.
  key: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(-[a-z0-9]+)*$/, maxlength: 80 },
  // Public address: /vehicles/<slug>. Also fixed at creation so existing links keep working after a rename.
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(-[a-z0-9]+)*$/, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 400, default: '' },
  // Inactive = hidden from the "new vehicle" dropdown and from public category menus. Existing vehicles keep it.
  active: { type: Boolean, default: true, index: true },
  displayOrder: { type: Number, default: 0, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
}, { timestamps: true });

export const VehicleCategory = mongoose.model('VehicleCategory', vehicleCategorySchema);
