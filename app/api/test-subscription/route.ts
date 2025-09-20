import { NextRequest, NextResponse } from 'next/server';

// API de test pour vérifier la logique de détection d'abonnement
export async function GET(req: NextRequest) {
  try {
    const defaultPriceId = process.env.STRIPE_TEST_PRICE_ID;

    return NextResponse.json({
      message: 'Test API for subscription detection',
      defaultPriceId,
      timestamp: new Date().toISOString(),
      environment: {
        hasStripePriceId: !!defaultPriceId,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Test failed',
      },
      { status: 500 }
    );
  }
}
