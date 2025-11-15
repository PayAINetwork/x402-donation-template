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
    const prettyWarningFilter = (warning: unknown) => {
      if (typeof warning === "string") {
        return warning.includes("Can't resolve 'pino-pretty'");
      }

      if (
        warning &&
        typeof warning === "object" &&
        "message" in warning &&
        typeof (warning as { message?: unknown }).message === "string"
      ) {
        return (warning as { message: string }).message.includes(
          "Can't resolve 'pino-pretty'"
        );
      }

      return false;
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
