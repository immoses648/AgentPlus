import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri expects a fixed dev port and no screen clearing.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    // Rust build artifacts can be locked while Cargo compiles on Windows.
    watch: { ignored: ["**/src-tauri/target/**"] },
  },
  build: { target: "es2021", outDir: "dist" },
});
