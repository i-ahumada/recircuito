import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Solo afecta a `next dev`: sin esto Next 16 bloquea el websocket de HMR cuando se entra por
  // ngrok, el cliente reintenta y a los ~40 s recarga la página (y corta la cámara en el celular).
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app"],
  images: {
    formats: ["image/webp"],
  },
};

export default nextConfig;
