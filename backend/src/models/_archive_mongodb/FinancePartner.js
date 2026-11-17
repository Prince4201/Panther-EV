import mongoose from 'mongoose';

// Finance partners / trusted companies shown on the public /finance page. Managed in Admin > Finance Partners.
const financePartnerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  // "financing" = banks / NBFCs that offer vehicle loans, "trusted" = other trusted companies, "partner" = business partners
  category: { type: String, enum: ['financing', 'partner', 'trusted'], default: 'financing', index: true },
  description: { type: String, trim: true, maxlength: 400, default: '' },
  logo: { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  // Background the logo was drawn for. "dark" = a white / light logo that needs a dark card to be visible.
  logoBg: { type: String, enum: ['light', 'dark'], default: 'light' },
  // Display size of the logo inside its card, in percent. The image file is never changed; partners saved before
  // this field existed have no value and are shown at 100.
  logoScale: { type: Number, min: 50, max: 500, default: 100 },
  website: { type: String, trim: true, default: '' },
  contactPhone: { type: String, trim: true, maxlength: 30, default: '' },
  contactEmail: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
  order: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const FinancePartner = mongoose.model('FinancePartner', financePartnerSchema);
