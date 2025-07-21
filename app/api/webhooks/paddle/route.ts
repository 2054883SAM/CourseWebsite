import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, processSubscriptionWebhook } from '@/lib/paddle';
import { paddleDb } from '@/lib/paddle/database';

export async function POST(req: NextRequest) {
  try {
    // Get the raw request body as text for signature verification
    const rawBody = await req.text();

    // Get the signature from the header
    const signature = req.headers.get('paddle-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the body
    const webhookData = JSON.parse(rawBody);
    console.log('Received webhook:', webhookData.event_type);

    // Process the webhook based on event type
    await processSubscriptionWebhook(webhookData, {
      enrollUser: paddleDb.enrollUser,
      updateSubscriptionStatus: paddleDb.updateSubscriptionStatus,
      removeUserEnrollment: paddleDb.removeUserEnrollment,
    });

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Paddle webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}

// Add OPTIONS handler to support preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
