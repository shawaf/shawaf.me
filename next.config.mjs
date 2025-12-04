import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.resolve.alias['@'] = resolve(__dirname);
        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "miro.medium.com",
            },
            {
                protocol: "https",
                hostname: "cdn-images-1.medium.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    }
};

export default nextConfig
