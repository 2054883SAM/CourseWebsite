/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow builds to succeed even if ESLint finds issues (does not affect dev)
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_PUBLISHABLE_KEY_TEST: process.env.STRIPE_PUBLISHABLE_KEY_TEST,
    STRIPE_TEST_PRICE_ID: process.env.STRIPE_TEST_PRICE_ID,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_URL_LINK: process.env.URL_LINK || process.env.NEXT_PUBLIC_URL_LINK,
  },
  /* config options here */
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
  webpack: (config, { isServer }) => {
    // Suppress the punycode deprecation warning
    config.ignoreWarnings = [{ module: /node_modules\/punycode/ }];
    return config;
  },
};

module.exports = nextConfig;
