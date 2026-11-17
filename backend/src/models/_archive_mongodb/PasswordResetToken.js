import mongoose from 'mongoose';

// Only the SHA-256 of the token is stored; the raw token exists only in the e-mailed link. Single use, expires, auto-deleted by TTL.
const schema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  accountKind: { type: String, enum: ['admin', 'user'], required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  usedAt: { type: Date, default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const PasswordResetToken = mongoose.model('PasswordResetToken', schema);
