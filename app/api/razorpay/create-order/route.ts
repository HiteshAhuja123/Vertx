import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Simulated fallback for local testing when placeholder keys are configured
    if (!keyId || !keySecret || keyId === 'rzp_test_key_id' || keySecret === 'rzp_test_key_secret') {
      console.warn('[Razorpay] Using simulated order response. Add your actual Razorpay keys to .env.local for live API calls.');
      return NextResponse.json({
        id: `order_simulated_${Date.now()}`,
        currency,
        amount: Math.round(amount * 100),
        receipt: receipt || `receipt_${Date.now()}`,
        isSimulated: true,
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    const detailError = error?.error?.description || error?.message || 'Failed to create Razorpay order';
    return NextResponse.json(
      { error: detailError },
      { status: 500 }
    );
  }
}
