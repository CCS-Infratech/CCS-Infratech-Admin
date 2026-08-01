import type { NextConfig } from 'next';

const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '618531912872-ccs-infratech.s3.us-east-1.amazonaws.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist']
};

let configWithPlugins = baseConfig;

const nextConfig = configWithPlugins;
export default nextConfig;
