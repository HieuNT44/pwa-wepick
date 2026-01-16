import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Improve HMR and file watching
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Improve HMR stability
  experimental: {
    // Enable faster refresh
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog"],
  },
  // Webpack configuration for better HMR
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve file watching - use polling for better reliability
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/.turbo/**",
        ],
      };
      
      // Use memory cache instead of disabling completely
      config.cache = {
        type: "memory",
        maxGenerations: 1,
      };
      
      // Improve HMR
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
      };
      
      // Better error handling
      config.infrastructureLogging = {
        level: "error",
      };
    }
    return config;
  },
};

export default nextConfig;

