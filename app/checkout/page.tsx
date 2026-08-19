'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, Address } from '@/components/StoreContext';
import { ShieldCheck, Plus, CreditCard, Landmark, Truck, Wallet, Check, AlertTriangle, X } from 'lucide-react';
import { formatPrice } from '@/products';
import { Modal } from '@/components/ui/Modal';

export default function CheckoutPage() {
  const router = useRouter();
  const { 
    user, 
    cart, 
    addresses, 
    addAddress, 
    placeOrder, 
    couponCode, 
    discountPercent 
  } = useStore();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking'>('card');
  
  // Modals and simulators
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState('');

  // Inline error state validation
  const [addressError, setAddressError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Form inputs for new address
  const [type, setType] = useState<'shipping' | 'billing'>('shipping');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // Clear errors when context changes
  useEffect(() => {
    if (!showAddressModal) {
      setAddressError('');
    }
  }, [showAddressModal]);

  useEffect(() => {
    if (selectedAddressId) {
      setCheckoutError('');
    }
  }, [selectedAddressId]);

  useEffect(() => {
    if (!user) {
      router.push('/auth?redirect=checkout');
      return;
    }
    if (cart.length === 0) {
      router.push('/shop');
      return;
    }
    // Set default address
    if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [user, cart, addresses, router]);

  if (!user || cart.length === 0) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const shipping = subtotal > 3000 ? 0 : 250;
  const total = subtotal - discount + shipping;

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine1 || !city || !state || !postalCode || !phone) {
      setAddressError('Please fill out all required fields.');
      return;
    }

    if (addressLine1.trim().length < 5) {
      setAddressError('Address Line 1 must be at least 5 characters.');
      return;
    }

    if (city.trim().length < 2) {
      setAddressError('City name must be at least 2 characters.');
      return;
    }

    if (state.trim().length < 2) {
      setAddressError('State name must be at least 2 characters.');
      return;
    }

    // Pincode digit validation
    const cleanPincode = postalCode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setAddressError('Please enter a valid 6-digit pincode.');
      return;
    }

    // Phone number digit validation check
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setAddressError('Please enter a valid 10-digit phone number.');
      return;
    }

    addAddress({
      type,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode: cleanPincode,
      country: 'India',
      phone: cleanPhone
    });

    // Reset fields
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setPhone('');
    setAddressError('');
    setShowAddressModal(false);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOrderSubmission = async () => {
    if (!selectedAddressId) {
      setCheckoutError('Please select or add a shipping address.');
      return;
    }

    if (paymentMethod === 'cod') {
      try {
        const orderNum = await placeOrder('cod', selectedAddressId);
        router.push(`/profile?success=true&order=${orderNum}`);
      } catch (err: any) {
        setCheckoutError(err.message || 'Error processing order.');
      }
      return;
    }

    setCheckoutError('');
    setRazorpayLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setCheckoutError('Failed to load Razorpay payment SDK. Please check your network connection.');
        setRazorpayLoading(false);
        return;
      }

      // 1. Create Razorpay order on backend
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });

      const orderData = await res.json();
      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to initialize payment gateway.');
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key_id';

      // Fallback to simulation modal if running with placeholder test key
      if (keyId === 'rzp_test_key_id' || orderData.isSimulated) {
        setShowRazorpayModal(true);
        setRazorpayLoading(false);
        return;
      }

      // 2. Launch Razorpay SDK Popup Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VORTX Activewear',
        description: 'Payment for order',
        order_id: orderData.id,
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: addresses.find(a => a.id === selectedAddressId)?.phone || user?.phone || '',
        },
        theme: {
          color: '#000000',
        },
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature on server
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const orderNum = await placeOrder(paymentMethod, selectedAddressId);
              router.push(`/profile?success=true&order=${orderNum}`);
            } else {
              setCheckoutError(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (err: any) {
            setCheckoutError(err.message || 'Payment verification error.');
          }
        },
        modal: {
          ondismiss: function () {
            setRazorpayLoading(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
      setRazorpayLoading(false);
    } catch (err: any) {
      setCheckoutError(err.message || 'Error processing payment request.');
      setRazorpayLoading(false);
    }
  };

  const handleSimulatedPaymentSuccess = async () => {
    try {
      const orderNum = await placeOrder(paymentMethod, selectedAddressId);
      setShowRazorpayModal(false);
      router.push(`/profile?success=true&order=${orderNum}`);
    } catch (err: any) {
      setRazorpayError(err.message || 'Payment simulation failed to save');
    }
  };

  return (
    <div className="py-12 bg-vortx-black min-h-screen text-vortx-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-sans text-4xl font-extrabold tracking-wide mb-10 text-vortx-white uppercase">CHECKOUT SECURED</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Columns - Delivery & Payment settings */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. SHIPPING ADDRESS */}
            <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-sans text-sm font-bold tracking-wider text-vortx-white uppercase">1. DELIVERY DETAILS</h3>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-1 text-xs font-sans font-bold tracking-wider text-vortx-white border border-vortx-white/20 hover:bg-vortx-white hover:text-vortx-black px-3.5 py-2 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> ADD NEW
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-vortx-white/10 rounded">
                  <p className="text-xs text-vortx-gray mb-3">No delivery address saved yet.</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-5 py-2.5 bg-vortx-white text-vortx-black font-sans text-xs font-bold tracking-wider hover:bg-vortx-white/90 transition"
                  >
                    ADD ADDRESS
                  </button>
                </div>
              ) : (
                <div role="radiogroup" aria-label="Saved delivery addresses" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <button
                      type="button"
                      key={addr.id}
                      role="radio"
                      aria-checked={selectedAddressId === addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full text-left p-4 border rounded transition ${
                        selectedAddressId === addr.id
                          ? 'border-vortx-white bg-vortx-white/5'
                          : 'border-vortx-white/10 bg-vortx-black/35 hover:border-vortx-white/35'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans text-2xs font-bold tracking-widest text-vortx-white bg-vortx-white/10 px-2 py-0.5 rounded uppercase">
                          {addr.type}
                        </span>
                        {selectedAddressId === addr.id && <Check className="w-4 h-4 text-vortx-white" />}
                      </div>
                      <p className="text-xs font-medium text-vortx-white">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-xs text-vortx-gray mt-0.5">{addr.addressLine2}</p>}
                      <p className="text-xs text-vortx-gray mt-1">{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="text-xs text-vortx-gray font-mono font-medium mt-2">PHONE: {addr.phone}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PAYMENT GATEWAYS */}
            <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-6">
              <h3 className="font-sans text-sm font-bold tracking-wider text-vortx-white uppercase">2. PAYMENT METHOD</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border rounded flex flex-col items-center justify-center gap-2 font-sans text-xs font-bold tracking-wider transition ${
                    paymentMethod === 'card' ? 'border-vortx-white bg-vortx-white/5' : 'border-vortx-white/10 hover:border-vortx-white/30'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-vortx-white" />
                  <span>CREDIT/DEBIT</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 border rounded flex flex-col items-center justify-center gap-2 font-sans text-xs font-bold tracking-wider transition ${
                    paymentMethod === 'upi' ? 'border-vortx-white bg-vortx-white/5' : 'border-vortx-white/10 hover:border-vortx-white/30'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-vortx-white" />
                  <span>UPI PAY</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-4 border rounded flex flex-col items-center justify-center gap-2 font-sans text-xs font-bold tracking-wider transition ${
                    paymentMethod === 'netbanking' ? 'border-vortx-white bg-vortx-white/5' : 'border-vortx-white/10 hover:border-vortx-white/30'
                  }`}
                >
                  <Landmark className="w-5 h-5 text-vortx-white" />
                  <span>NET BANKING</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border rounded flex flex-col items-center justify-center gap-2 font-sans text-xs font-bold tracking-wider transition ${
                    paymentMethod === 'cod' ? 'border-vortx-white bg-vortx-white/5' : 'border-vortx-white/10 hover:border-vortx-white/30'
                  }`}
                >
                  <Truck className="w-5 h-5 text-vortx-white" />
                  <span>CASH ON DEL.</span>
                </button>
              </div>

              {paymentMethod !== 'cod' && (
                <div className="flex items-center gap-2 text-xs text-vortx-gray font-medium p-3 bg-vortx-white/5 rounded border border-vortx-white/5">
                  <ShieldCheck className="w-4 h-4 text-vortx-white" />
                  <span>Payments are processed securely via Razorpay payment gateway interfaces.</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Columns - Order list summaries */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-4">
              <h3 className="font-sans text-base font-bold tracking-wider text-vortx-white uppercase border-b border-vortx-white/10 pb-4 mb-2">ORDER SUMMARY</h3>
              
              {/* Product brief lists */}
              <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex gap-3 justify-between items-start text-sm font-medium">
                    <div className="min-w-0">
                      <p className="text-vortx-white truncate uppercase font-sans text-sm font-bold tracking-wide">{item.name}</p>
                      <p className="text-sm text-vortx-gray mt-0.5 font-mono">SIZE: {item.size} x {item.quantity}</p>
                    </div>
                    <span className="font-mono text-sm text-vortx-white font-bold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* pricing calculations */}
              <div className="border-t border-vortx-white/10 pt-4 space-y-2.5 text-base text-vortx-gray font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-vortx-white">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-vortx-white">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-mono">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-vortx-white">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-vortx-white/10 pt-3 text-lg font-bold text-vortx-white">
                  <span>TOTAL DUE</span>
                  <span className="font-mono text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded text-center">
                  {checkoutError}
                </p>
              )}

              <button
                onClick={handleOrderSubmission}
                className="w-full py-4 bg-vortx-white text-vortx-black font-sans text-base font-bold tracking-widest hover:bg-vortx-white/90 transition shadow-lg"
              >
                {paymentMethod === 'cod' ? 'CONFIRM ORDER' : 'PAY & PLACE ORDER'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* NEW ADDRESS MODAL POPUP */}
      <Modal open={showAddressModal} onClose={() => setShowAddressModal(false)} backdropClassName="bg-black/70 backdrop-blur-sm">
          <form onSubmit={handleAddNewAddress} className="relative w-full max-w-lg bg-vortx-dark border border-vortx-white/20 p-6 glassmorphism rounded shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-vortx-white/10 pb-3">
              <span className="font-sans text-lg sm:text-xl font-bold tracking-wider text-vortx-white">ADD DELIVERY ADDRESS</span>
              <button type="button" onClick={() => setShowAddressModal(false)} className="text-vortx-gray hover:text-vortx-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="addr-type" className="block text-sm sm:text-base font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">ADDRESS TYPE</label>
                <select
                  id="addr-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-sans font-bold tracking-wider"
                >
                  <option value="shipping">SHIPPING</option>
                  <option value="billing">BILLING</option>
                </select>
              </div>
              <div>
                <label htmlFor="addr-phone" className="block text-sm sm:text-base font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5 font-mono">PHONE NUMBER</label>
                <input
                  id="addr-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="DELIVERY CONTACT"
                  className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="addr-line1" className="block text-sm sm:text-base font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">ADDRESS LINE 1</label>
              <input
                id="addr-line1"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="HOUSE NO, BUILDING, ROAD"
                className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                required
              />
            </div>

            <div>
              <label htmlFor="addr-line2" className="block text-sm sm:text-base font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">ADDRESS LINE 2 (OPTIONAL)</label>
              <input
                id="addr-line2"
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="LOCALITY, AREA, LANDMARK"
                className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="addr-city" className="block text-sm sm:text-base font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">CITY</label>
                <input
                  id="addr-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="CITY"
                  className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                  required
                />
              </div>
              <div>
                <label htmlFor="addr-state" className="block text-sm sm:text-base font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">STATE</label>
                <input
                  id="addr-state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="STATE"
                  className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                  required
                />
              </div>
              <div>
                <label htmlFor="addr-postal" className="block text-sm sm:text-base font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">PINCODE</label>
                <input
                  id="addr-postal"
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="PINCODE"
                  className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                  required
                />
              </div>
            </div>

            {addressError && (
              <p className="text-sm font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded text-center">
                {addressError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4.5 bg-vortx-white text-vortx-black font-sans text-base font-bold tracking-widest hover:bg-vortx-white/95 transition uppercase"
            >
              SAVE ADDRESS
            </button>
          </form>
      </Modal>

      {/* RAZORPAY PAYMENT GATEWAY DIALOG SIMULATOR — intentionally styled to mimic Razorpay's
          own checkout widget rather than VORTX's token palette, since it represents a foreign,
          embedded surface. Only rendered when running against placeholder/dev payment keys. */}
      <Modal open={showRazorpayModal} onClose={() => setShowRazorpayModal(false)} backdropClassName="bg-black/85" dismissible={false}>
          <div className="relative w-full max-w-md bg-[#1a1c24] border border-[#2f3242] p-6 text-white rounded-lg shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Razorpay branding header */}
            <div className="flex justify-between items-center border-b border-[#2f3242] pb-4 mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-bold font-mono">RAZORPAY CHECKOUT SECURED</span>
                <span className="text-lg font-extrabold font-sans text-white">VORTX ACTIVEWEAR</span>
              </div>
              <button 
                onClick={() => setShowRazorpayModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {razorpayLoading ? (
              <div className="h-60 flex flex-col items-center justify-center space-y-3 font-mono text-xs">
                <div className="w-10 h-10 border-2 border-t-blue-500 border-gray-700 rounded-full animate-spin" />
                <span className="text-gray-400 animate-pulse uppercase">Authenticating connection API keys...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {razorpayError && (
                  <div className="p-3.5 border border-red-500/20 bg-red-500/5 text-red-400 text-xs sm:text-sm font-medium rounded flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{razorpayError}</span>
                  </div>
                )}
                
                {/* Simulated Order Details */}
                <div className="p-4 bg-[#232635] rounded space-y-2.5 font-mono text-sm sm:text-base text-gray-300">
                  <div className="flex justify-between">
                    <span>Transaction Amount:</span>
                    <span className="text-white font-bold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Mode:</span>
                    <span className="text-white font-bold uppercase">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 border-t border-[#2f3242] pt-2">
                    <span>Checkout SDK:</span>
                    <span>v2.8.1-production</span>
                  </div>
                </div>

                <div className="space-y-3 text-center">
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                    Choose one of the simulation triggers below to complete testing the Razorpay webhook callbacks.
                  </p>
                  <button
                    onClick={handleSimulatedPaymentSuccess}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-sans text-sm sm:text-base font-bold text-white rounded transition shadow-lg shadow-blue-600/10 uppercase"
                  >
                    Simulate Payment Success
                  </button>
                  <button
                    onClick={() => setRazorpayError('Payment declined by issuer bank (Simulated Failure).')}
                    className="w-full py-3 border border-[#3e425a] hover:bg-gray-800 text-xs sm:text-sm font-sans font-bold text-gray-400 rounded transition"
                  >
                    Simulate Payment Failure
                  </button>
                </div>
              </div>
            )}
          </div>
      </Modal>

    </div>
  );
}
