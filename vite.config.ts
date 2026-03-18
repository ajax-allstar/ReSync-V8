import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["motion/react"],
          react: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["lucide-react"],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
