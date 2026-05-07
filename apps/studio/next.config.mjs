/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@framework/blocks", "@framework/patterns"],

  // The blocks and patterns packages use the standard TypeScript-with-ESM
  // convention of writing relative imports with a `.js` extension that
  // points at a `.ts` source file. `tsc` and `tsx` rewrite this
  // automatically; webpack does not. Teach webpack to do the same so
  // `import "./foo.js"` resolves to `./foo.ts` (or `.tsx`).
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
