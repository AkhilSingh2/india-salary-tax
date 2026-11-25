const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  transpilePackages: ["@sutra-ui/react", "@sutra-ui/tokens"],
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
