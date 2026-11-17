import mongoose from 'mongoose';

// People shown on the public "Our Teams" page. Managed in Admin > Our Teams.
// (Not staff accounts: those are the Admin model, under Admin > Team.)
// Every field is optional; the controller only insists that a record is not completely empty.
const teamMemberSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 120, default: '' },
  // Free text: Director, Founder, Sales Manager, ... There is no fixed list of roles.
  designation: { type: String, trim: true, maxlength: 120, default: '' },
  email: { type: String, trim: true, lowercase: true, maxlength: 120, default: '' },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  // Display size of the photo inside its card, in percent. The uploaded file itself is never changed.
  imageScale: { type: Number, min: 50, max: 500, default: 100 },
  // Where the photo sits inside its frame: how far it is moved from the centre, in percent of the frame
  // (x: minus = left, plus = right; y: minus = up, plus = down). 0 / 0 = centred. Display only.
  imagePosX: { type: Number, min: -100, max: 100, default: 0 },
  imagePosY: { type: Number, min: -100, max: 100, default: 0 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  experience: { type: String, trim: true, maxlength: 120, default: '' },
  additionalInfo: { type: String, trim: true, maxlength: 1000, default: '' },
  displayOrder: { type: Number, default: 0, index: true },
  isVisible: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
