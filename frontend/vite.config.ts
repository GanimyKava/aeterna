import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/analytics-chat": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/time-weave": {
        target: "http://localhost:8000",
        changeOrigin: true,
        ws: true,
      },
      "/assets": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/images": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/styles": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/data": {
        target: "http://localhost:8000",
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

