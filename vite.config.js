import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During local dev, run `vercel dev` (which serves /api on :3000) alongside
// `npm run dev` (Vite on :5173), and this proxy forwards /api calls to it.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
