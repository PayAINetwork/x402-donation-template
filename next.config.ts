import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Stub optional pretty logger dependency used by transitive deps (pino)
      // to avoid noisy "Can't resolve 'pino-pretty'" warnings in the browser bundle
      "pino-pretty": require.resolve("./lib/empty.js"),
    };

    // Also suppress the specific warning if any loaders still surface it
    const prettyWarningFilter = (warning: any) => {
      const message = typeof warning === "string" ? warning : warning?.message || "";
      return message.includes("Can't resolve 'pino-pretty'");
    };

    // Preserve existing ignoreWarnings while adding our filter
    // Webpack supports functions in ignoreWarnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      prettyWarningFilter,
    ];

    return config;
  },
};

export default nextConfig;
