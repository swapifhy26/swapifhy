/** @type {import('next').NextConfig} */
const nextConfig = { typescript: { ignoreBuildErrors: true },
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  }
};

export default nextConfig;
