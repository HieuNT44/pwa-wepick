import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Security headers to protect tokens and prevent XSS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy to prevent XSS attacks
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.mistral.ai",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
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

