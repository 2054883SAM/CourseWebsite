### Vercel environment variables (Production)

Set these in Vercel Project Settings → Environment Variables:

Public (available to browser):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (if Stripe UI used)
- NEXT_PUBLIC_STRIPE_TEST_PRICE_ID (if using test page)
- NEXT_PUBLIC_USE_MOCK_DATA (optional: 'false')

Server-side only:

- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY (if Stripe used)
- STRIPE_WEBHOOK_SECRET (if using webhooks)
- OPENAI_API_KEY (for AI features)
- OPENAI_MODEL_ID (optional, default 'gpt-4o-mini')
- DEEPL_API_KEY (if translation features used)
- DEEPL_API_URL (optional)
- DEEPGRAM_API_KEY (if captions used)
- VDO_API_SECRET (for VdoCipher API)
- PADDLE_SELLER_ID (if Paddle checkout used)
- PADDLE_API_KEY (if Paddle server ops used)
- PADDLE_WEBHOOK_SECRET (if Paddle webhooks used)

Notes:

- Configure Stripe and Paddle webhooks in Vercel → Project → Settings → Domains/Webhooks.
- Image Optimization: `next.config.js` allows `*.supabase.co` public storage; add more domains if needed.
- Node version: pinned via package.json engines to ">=20.19.0".
