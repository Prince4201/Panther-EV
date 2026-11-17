/**
 * Gets a picture ready for upload, in the browser, before it is sent.
 * Cloudinary refuses images over about 10 MB and the API accepts up to 8 MB, while photos straight from a camera or a
 * design tool are often 15 MB or more. Large pictures are scaled down (never up, proportions kept, transparency kept)
 * and saved as WebP, which is typically 10-30x smaller with no visible difference on a website.
 * Small pictures are sent exactly as they are. If the browser cannot do the conversion, the original file is returned.
 */
const KEEP_AS_IS_BYTES = 1.5 * 1024 * 1024; // already small: do not touch
const TARGET_BYTES = 7 * 1024 * 1024;       // stay under the 8 MB API limit
const MAX_SIDE = 2400;                      // plenty for a full-width banner on a large screen

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

export async function prepareImage(file: File, maxSide = MAX_SIDE): Promise<File> {
  if (typeof document === 'undefined' || !file.type.startsWith('image/')) return file;
  try {
    // "from-image" applies the phone camera's rotation, so portrait photos stay upright.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const longest = Math.max(bitmap.width, bitmap.height);
    if (file.size <= KEEP_AS_IS_BYTES && longest <= maxSide) { bitmap.close(); return file; }

    let side = Math.min(longest, maxSide);
    let best: Blob | null = null;
    // Try the target size first; only if the result is still too heavy, step the size and quality down.
    for (const quality of [0.9, 0.85, 0.8, 0.75]) {
      const ratio = side / longest;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const ctx = canvas.getContext('2d');
      if (!ctx) break;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      // WebP keeps transparency. A browser that cannot write WebP hands back a PNG instead, which is still fine.
      const blob = await toBlob(canvas, 'image/webp', quality);
      if (blob && (!best || blob.size < best.size)) best = blob;
      if (best && best.size <= TARGET_BYTES) break;
      side = Math.round(side * 0.8);
    }
    bitmap.close();
    if (!best || best.size >= file.size) return file; // no gain: keep the original
    const ext = best.type === 'image/webp' ? 'webp' : best.type === 'image/jpeg' ? 'jpg' : 'png';
    return new File([best], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.${ext}`, { type: best.type });
  } catch {
    return file; // e.g. a format this browser cannot decode: let the server decide
  }
}
