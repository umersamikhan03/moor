import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "vite-plugin-sitemap";
import { getDynamicRoutes } from "./src/sitemap-generator.js";

const staticRoutes = [
  "/",
  "/shop",
  "/contact-us",
  "/about",
  "/termofservice",
  "/privacypolicy",
  "/refundpolicy",
  "/shippinpolicy",
  "/faqs",
  "/track-order",
  "/blog",
];

// https://vitejs/dev/config/
export default defineConfig(async () => {
  const dynamicRoutes = await getDynamicRoutes();

  return {
    plugins: [
      react(),
      tailwindcss(),
      sitemap({
        hostname: "https://ecommerce.digiweb.digital", // Replace with your actual domain
        staticRoutes,
        dynamicRoutes,
        exclude: ["/admin/*", "/user/*"],
        // You can add more options here if needed, like change frequency
        // See docs: https://github.com/jbaubree/vite-plugin-sitemap
      }),
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:5050", // your backend
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
