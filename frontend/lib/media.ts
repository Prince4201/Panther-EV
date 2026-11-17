/** Shown when a vehicle has no image yet, so the page layout never breaks. */
export const NO_IMAGE = '/brand/panther-p.png';
/**
 * True for any image that lives on another website (pantherev.com vehicle photos, Cloudinary uploads, pasted links).
 * Those are loaded by the visitor's browser straight from that address (`unoptimized`). Otherwise the Next.js server
 * has to download each one first to resize it, and when that download is slow or blocked the picture never appears.
 * Files inside /public are still optimised by Next.js.
 */
export const isExternalImage = (src: string) => /^https?:\/\//i.test(src);
export const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;
