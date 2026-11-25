/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pantherev.com' }, // vehicle cut-outs from the live Panther site
      { protocol: 'https', hostname: 'res.cloudinary.com' }, // images uploaded from the admin panel
    ],
    // WebP only: AVIF is slightly smaller but several times slower to encode, which made first views slow.
    formats: ['image/webp'],
    // Keep each optimised image for 30 days. The default (60 seconds) meant the large hero and vehicle PNGs were
    // re-encoded again and again. A replaced image gets a new address (Cloudinary) so it is never stuck on an old copy.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/about', destination: '/company', permanent: true },
      { source: '/admin/inquiries', destination: '/admin/enquiries', permanent: false },
      { source: '/admin/inquiries/:id', destination: '/admin/enquiries/:id', permanent: false },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'https://panther-ev-backend.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/+$/, '')}/api/:path*`,
      },
    ];
  },
};
export default nextConfig;
