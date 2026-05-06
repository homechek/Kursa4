import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // For GitHub Pages the app is served from "/<repo>/"
  // GitHub Actions workflow sets VITE_BASE accordingly.
  base: process.env.VITE_BASE || "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
});

