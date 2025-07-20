# Paddle V2 API Integration

This module provides integration with Paddle V2 Billing API for payment processing and subscription management.

## Setup Requirements

1. Create a Paddle account at [paddle.com](https://www.paddle.com/)
2. Set up the following environment variables in your `.env` file:

```env
PADDLE_API_KEY=your-paddle-api-key
NEXT_PUBLIC_PADDLE_SELLER_ID=your-paddle-seller-id
NEXT_PUBLIC_PADDLE_PUBLIC_KEY=your-paddle-public-key
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret
NEXT_PUBLIC_PADDLE_SANDBOX_MODE=true  # Set to false in production
```

## Database Setup

The following tables need to be created in your Supabase database:

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  next_bill_date TIMESTAMP WITH TIME ZONE,
  price_amount TEXT,
  price_currency TEXT,
  FOREIGN KEY (customer_id) REFERENCES users(customer_id) ON DELETE CASCADE
);

CREATE INDEX subscriptions_customer_id_idx ON subscriptions(customer_id);
CREATE INDEX subscriptions_product_id_idx ON subscriptions(product_id);
```

### Enrollments Table

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  subscription_id TEXT,
  status TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  UNIQUE(user_id, course_id)
);

CREATE INDEX enrollments_user_id_idx ON enrollments(user_id);
CREATE INDEX enrollments_course_id_idx ON enrollments(course_id);
CREATE INDEX enrollments_subscription_id_idx ON enrollments(subscription_id);
```

### User Table Updates

Add a `customer_id` field to your users table to link Supabase users with Paddle customers:

```sql
ALTER TABLE users ADD COLUMN customer_id TEXT UNIQUE;
```

## Module Structure

- `client.ts` - Main Paddle API client
- `types.ts` - TypeScript types for Paddle API
- `webhooks.ts` - Webhook signature verification and event handling
- `database.ts` - Supabase database operations for Paddle integration

## Usage

### Frontend Integration

Add the Paddle.js script to your frontend:

```tsx
import { loadPaddleJs } from '@/lib/paddle';

// Load in your component's useEffect hook
useEffect(() => {
  loadPaddleJs();
}, []);
```

### Creating a Checkout

```tsx
import { paddle } from '@/lib/paddle';

function PurchaseButton({ productId }) {
  const handleClick = () => {
    // @ts-ignore - Paddle is loaded via script tag
    window.Paddle.Checkout.open({
      product: productId,
      successCallback: (data) => {
        console.log('Purchase successful', data);
      },
    });
  };

  return <button onClick={handleClick}>Purchase</button>;
}
```

### Testing the Integration

Use the API endpoint at `/api/paddle/test-connection` to verify your Paddle API connection.

## Webhook Setup

Set up a webhook in your Paddle dashboard pointing to:

```
https://your-domain.com/api/webhooks/paddle
```

This will process subscription events automatically.
