import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_key_secret';
    const isPlaceholderSecret = secret === 'rzp_test_key_secret';

    // Allow simulated orders in development only — never in production, where a
    // placeholder/missing secret must fail verification instead of auto-succeeding.
    if (process.env.NODE_ENV !== 'production' && (razorpay_order_id.startsWith('order_simulated_') || isPlaceholderSecret)) {
      return NextResponse.json({
        success: true,
        message: 'Simulated payment verified successfully',
        paymentId: razorpay_payment_id || `pay_simulated_${Date.now()}`,
        orderId: razorpay_order_id,
        isSimulated: true,
      });
    }

    if (process.env.NODE_ENV === 'production' && isPlaceholderSecret) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway is not configured' },
        { status: 500 }
      );
    }

    if (!razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment signature' },
        { status: 400 }
      );
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({
        success: true,
        message: 'Payment signature verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
