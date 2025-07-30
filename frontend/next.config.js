/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
      },
      {
        source: '/api/health',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/health`,
      },
      {
        source: '/api/stats',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/stats`,
      },
    ]
  },
}

module.exports = nextConfig
