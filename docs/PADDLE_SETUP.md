# Paddle Payment Integration Setup

This document explains how to set up the Paddle V2 API integration for processing payments in this application.

## Required Environment Variables

Add these to your `.env` file:

```
PADDLE_SELLER_ID=your-paddle-vendor-id               # Required for checkout
NEXT_PUBLIC_PADDLE_SANDBOX_MODE=true                 # Set to false for production
PADDLE_API_KEY=your-paddle-api-key                   # For server operations
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret     # For webhook verification
```

## Important Notes

1. **PADDLE_SELLER_ID** must be set for the checkout to work. This is your Paddle Vendor ID (sometimes called Seller ID).
2. The `vendor` parameter in `Paddle.Setup()` expects a number, so your ID should be numeric.
3. If you get the error: "You must specify your Paddle Vendor ID within the Paddle.Setup() method", check that:
   - `PADDLE_SELLER_ID` is set in your `.env` file
   - The environment variable has a valid numeric value
   - Your Next.js server has been restarted after adding the environment variables

## Testing Your Integration

1. Visit http://localhost:3000/payment-test
2. The page includes a configuration check to verify your environment variables
3. Use test card 4242 4242 4242 4242 with any future expiry date and CVC

## Webhook Setup

Configure your Paddle webhook endpoint in the Paddle dashboard:

```
https://your-domain.com/api/webhooks/paddle
```

## Troubleshooting

### "You must specify your Paddle Vendor ID" Error

1. Make sure `PADDLE_SELLER_ID` is set in your `.env` file
2. Restart your Next.js server to pick up the new environment variables
3. Check that `loadPaddleJs()` correctly passes the vendor ID to `Paddle.Setup()`

### Checkout Not Opening

1. Check browser console for errors
2. Verify Paddle.js is loading correctly (look for network requests to cdn.paddle.com)
3. Try manually reloading the page before attempting checkout

### API Connection Issues

Test your API connection by visiting:

```
http://localhost:3000/api/paddle/test-connection
```

Note: This endpoint requires authentication. Check the implementation in `app/api/paddle/test-connection/route.ts` for details. 