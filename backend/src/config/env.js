import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  isProd: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  revalidateSecret: process.env.REVALIDATE_SECRET || '',
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER || '',
    token: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || '',
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG || 'en',
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
  },
};

if (env.isProd && (env.jwtSecret.length < 32 || env.jwtSecret.includes('change_this'))) {
  console.error('JWT_SECRET is too weak for production. Use a long random value.');
  process.exit(1);
}
