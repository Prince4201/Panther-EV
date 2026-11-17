import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const FOLDERS = { hero: 'panther-ev/hero', products: 'panther-ev/products', partners: 'panther-ev/partners', avatars: 'panther-ev/avatars', team: 'panther-ev/team' };

// The browser-supplied mimetype can be faked, so the file's first bytes are checked too.
function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 4, 12).startsWith('ftypavif')) return 'image/avif';
  return null;
}

export function uploadImage(req, res, next) {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({ message: 'Image upload is not set up yet. Add the Cloudinary keys to backend/.env, or paste an image link instead.' });
  }
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload.' });
  if (!sniff(req.file.buffer)) return res.status(400).json({ message: 'That file is not a valid JPG, PNG, WebP or AVIF image.' });
  const folder = FOLDERS[req.query.folder] || FOLDERS.hero;
  const stream = cloudinary.uploader.upload_stream(
    { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
    (err, result) => {
      if (err) {
        // Cloudinary's own wording ("File size too large. Got 16278955. Maximum is 10485760.") means nothing to an admin.
        if (/file size too large/i.test(err.message || '')) return res.status(413).json({ message: 'That image is too large for the image service (limit about 10 MB). Use a smaller or more compressed image.' });
        if (err.http_code && err.http_code < 500) return res.status(400).json({ message: `The image service did not accept this file: ${err.message}` });
        return next(err);
      }
      res.status(201).json({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
    },
  );
  stream.end(req.file.buffer);
}
