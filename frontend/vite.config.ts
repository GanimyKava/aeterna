import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendHost = process.env.VITE_BACKEND_HOST ?? process.env.BACKEND_HOST ?? "localhost";
const backendPort = process.env.VITE_BACKEND_PORT ?? process.env.BACKEND_PORT ?? "8000";
const backendProtocol = process.env.VITE_BACKEND_PROTOCOL ?? process.env.BACKEND_PROTOCOL ?? "http";
const backendTarget = `${backendProtocol}://${backendHost}:${backendPort}`;

function resolveHttpsConfig(): false | { key: Buffer; cert: Buffer } {
  try {
    const certDir = path.resolve(__dirname, "certs");
    const keyPath = path.join(certDir, "localhost-key.pem");
    const certPath = path.join(certDir, "localhost-cert.pem");

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }
  } catch (error) {
    console.warn("Unable to configure HTTPS for Vite dev server:", error);
  }

  return false;
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    https: resolveHttpsConfig(),
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/analytics-chat": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/time-weave": {
        target: backendTarget,
        changeOrigin: true,
        ws: true,
      },
      "/assets": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/images": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/styles": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/data": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build",
    assetsDir: "static",
    sourcemap: true,
  },
});

