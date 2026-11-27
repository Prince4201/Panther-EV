import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const FOLDERS = { hero: 'panther-ev/hero', products: 'panther-ev/products', partners: 'panther-ev/partners', avatars: 'panther-ev/avatars', team: 'panther-ev/team' };
const LOCAL_SUBDIRS = { hero: 'hero', products: 'products', partners: 'partners', avatars: 'avatars', team: 'team' };

// The browser-supplied mimetype can be faked, so the file's first bytes are checked too.
function sniff(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 4, 12).startsWith('ftypavif')) return 'image/avif';
  return null;
}

const EXT_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export async function uploadImage(req, res, next) {
  if (!req.file) return res.status(400).json({ message: 'Choose an image to upload.' });
  const mime = sniff(req.file.buffer);
  if (!mime) return res.status(400).json({ message: 'That file is not a valid JPG, PNG, WebP or AVIF image.' });

  const folderKey = req.query.folder && LOCAL_SUBDIRS[req.query.folder] ? req.query.folder : 'avatars';

  // If Cloudinary is configured with valid credentials, use Cloudinary
  if (isCloudinaryConfigured()) {
    const folder = FOLDERS[folderKey] || FOLDERS.avatars;
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => {
        if (err) {
          if (/file size too large/i.test(err.message || '')) return res.status(413).json({ message: 'That image is too large for the image service (limit about 10 MB). Use a smaller or more compressed image.' });
          if (err.http_code && err.http_code < 500) return res.status(400).json({ message: `The image service did not accept this file: ${err.message}` });
          return next(err);
        }
        return res.status(201).json({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
      },
    );
    return stream.end(req.file.buffer);
  }

  // Fallback: Local file storage served by Express
  try {
    const ext = EXT_MAP[mime] || 'jpg';
    const subDir = LOCAL_SUBDIRS[folderKey] || 'avatars';
    const filename = `${subDir}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const targetDir = path.resolve(process.cwd(), 'uploads', subDir);

    await fs.promises.mkdir(targetDir, { recursive: true });
    await fs.promises.writeFile(path.join(targetDir, filename), req.file.buffer);

    const proto = req.headers?.['x-forwarded-proto'] || req.protocol || 'http';
    const host = (typeof req.get === 'function' ? req.get('host') : req.headers?.host) || 'localhost:5000';
    const url = `${proto}://${host}/uploads/${subDir}/${filename}`;

    return res.status(201).json({
      url,
      publicId: filename,
      local: true,
      message: 'Image uploaded successfully.'
    });
  } catch (err) {
    console.error('Local image upload error:', err);
    return res.status(500).json({ message: 'Failed to save uploaded image.' });
  }
}
