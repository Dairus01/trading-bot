import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path, { resolve } from "path";
import svgr from "vite-plugin-svgr";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0", // Allow access from network devices
    port: 5173, // Set the development server port
  },
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        // Customize SVGR options
        icon: true, // Automatically convert SVG to icons
        expandProps: "end", // Ensure props override default attributes
      },
    }),
    visualizer({
      open: true, // Automatically opens the visualizer report in the browser after build
      filename: "visualizer-stats.html", // Specify the output file for the report
    }),
  ],

  build: {
    outDir: "dist", // Specify the output directory
    minify: "esbuild",
    sourcemap: false, // Disable source maps for production builds
    emptyOutDir: true,
    cssCodeSplit: true, // Enable CSS code splitting
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"), // Specify your main entry point
      },
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          reactRouter: ["react-router", "react-router-dom"],
          solanaWalletAdapters: [
            "@solana/wallet-adapter-base",
            "@solana/wallet-adapter-react",
            "@solana/wallet-adapter-react-ui",
            "@solana/web3.js",
          ],
          hookForm: ["react-hook-form", "@hookform/resolvers"],
          utility: ["clsx", "class-variance-authority", "tailwind-merge"],
          cryptoLib: ["crypto-js", "crypto-browserify", "bs58"],
        },
      },
    },
  },
  define: {
    global: "globalThis", // Use globalThis for Node.js global compatibility
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      crypto: "crypto-browserify",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
