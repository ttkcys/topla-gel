/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Static export için bu satırı ekleyin
  basePath: "/topla-gel", // GitHub repo adınızla eşleşmeli
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Static export için image optimizasyonunu kapatın
  },
  // Diğer yapılandırmalar...
};

module.exports = nextConfig;
