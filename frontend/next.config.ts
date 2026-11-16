import type { NextConfig } from 'next';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

const nextConfig: NextConfig = {
  /* FastAPI is strict about trailing slashes ("/users/" vs "/auth/login"), so keep
     them exactly as the client writes them instead of Next's default 308 redirect. */
  skipTrailingSlashRedirect: true,
  /* Same-origin proxy to the backend, so its auth cookies work without CORS. */
  async rewrites() {
    return [
      { source: '/api/:path*/', destination: `${API_URL}/:path*/` },
      { source: '/api/:path*', destination: `${API_URL}/:path*` },
    ];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
