/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: '**',
            port: '',
            pathname: '**',
        },
    ],
},
  experimental: {
    appDir: true,
  },
}

export default nextConfig
