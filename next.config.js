/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Static export için bu satırı ekleyin
  basePath: "/topla-gel", // GitHub repo adı ile eşleşmeli (eğer repo adı "topla-gel" ise)
  assetPrefix: "/topla-gel/",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Static export için image optimizasyonunu kapatın
  },
  // Diğer yapılandırmalar...
};

module.exports = nextConfig;
