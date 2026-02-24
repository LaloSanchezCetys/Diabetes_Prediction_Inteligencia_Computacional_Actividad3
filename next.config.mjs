/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",

  basePath: "/Diabetes_Prediction_Inteligencia_Computacional_Actividad3",
  assetPrefix: "/Diabetes_Prediction_Inteligencia_Computacional_Actividad3/",

  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;