/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{
      source: '/github/download/:path*',
      destination: 'https://raw.githubusercontent.com/:path*'
    }, {
      source: '/github/api/:path*',
      destination: 'https://api.github.com/:path*'
    }]
  }
};

export default nextConfig;
