const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  eslint: { ignoreDuringBuilds: true }
};
export default nextConfig;
