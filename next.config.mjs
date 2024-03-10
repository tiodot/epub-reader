/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{
      source: '/github/download/:path*',
      destination: 'https://raw.githubusercontent.com/:path*'
    }]
  }
};

export default nextConfig;
