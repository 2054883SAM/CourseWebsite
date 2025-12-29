/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16: eslint config moved to separate eslint.config.js file
  // Use `next lint --ignore-during-builds` in package.json build script if needed
  
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_PUBLISHABLE_KEY_TEST: process.env.STRIPE_PUBLISHABLE_KEY_TEST,
    STRIPE_TEST_PRICE_ID: process.env.STRIPE_TEST_PRICE_ID,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_URL_LINK: process.env.URL_LINK || process.env.NEXT_PUBLIC_URL_LINK,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Next.js 16: Turbopack is default, configure properly
  turbopack: {
    // Set explicit root to avoid lockfile confusion
    root: __dirname,
  },
  
  // Keep webpack config for backward compatibility (only used with --webpack flag)
  webpack: (config, { isServer }) => {
    // Suppress the punycode deprecation warning
    config.ignoreWarnings = [{ module: /node_modules\/punycode/ }];
    return config;
  },
};

module.exports = nextConfig;
