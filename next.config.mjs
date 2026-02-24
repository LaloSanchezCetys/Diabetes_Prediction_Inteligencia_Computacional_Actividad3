/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",

  // Required for GitHub Pages (repo name goes here)
  basePath: "/Diabetes_Prediction_Inteligencia_Computacional_Actividad3",
  assetPrefix: "/Diabetes_Prediction_Inteligencia_Computacional_Actividad3/",

  // Your existing config
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;