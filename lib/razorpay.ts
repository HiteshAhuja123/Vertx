import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_key_secret',
});
