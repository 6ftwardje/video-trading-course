/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trogwrgxxhsvixzglzpn.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Required for Netlify skew protection: pin chunk requests to the right deploy (avoids 404 on static assets after deploy)
  experimental: {
    useDeploymentId: true,
    useDeploymentIdServerActions: true,
  },
};

export default nextConfig;
