/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'urbantales.020495.xyz',
          pathname: '/index.php/s/**',
        },
      ],
    },
  }
  
  export default nextConfig
