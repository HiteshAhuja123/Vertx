'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore, Order } from '@/components/StoreContext';
import { mockDb } from '@/lib/supabase';
import { ShoppingBag, MapPin, ClipboardList, CheckCircle, Package, Send, X, Star } from 'lucide-react';
import { formatPrice } from '@/products';
import { logAutomation } from '@/lib/email';

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successOrderNum = searchParams?.get('order') || '';
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { 
    user, 
    orders, 
    addresses, 
    deleteAddress, 
    logout 
  } = useStore();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Review form states
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  useEffect(() => {
    if (successOrderNum) {
      setShowSuccessModal(true);
      // Clean query parameters from URL
      window.history.replaceState({}, '', '/profile');
    }
  }, [successOrderNum]);

  if (!user) return null;

  const handleReviewSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const list = mockDb.getReviews();
    list.push({
      id: 'rev_' + Math.random(),
      user_id: user.id,
      user_name: user.fullName,
      product_id: reviewProductId,
      rating: reviewRating,
      comment: reviewComment,
      created_at: new Date().toISOString()
    });
    mockDb.saveReviews(list);
    
    // Log automation update
    logAutomation('EMAIL', `✉️ Review Received: User ${user.email} submitted review on product: ${reviewProductName}`);
    logAutomation('SYSTEM', `⚙️ Community Rating update logs compiled.`);

    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewProductId('');
      setReviewComment('');
      setReviewSubmitted(false);
    }, 2000);
  };

  const getStatusStepClass = (orderStatus: Order['status'], step: string) => {
    const steps = ['pending', 'paid', 'shipped', 'delivered'];
    const currentIdx = steps.indexOf(orderStatus);
    const stepIdx = steps.indexOf(step);

    if (orderStatus === 'cancelled') return 'bg-red-500/20 text-red-500 border-red-500/20';

    if (stepIdx <= currentIdx) {
      return 'bg-vortx-white text-vortx-black border-vortx-white';
    }
    return 'border-vortx-white/20 text-vortx-gray';
  };

  return (
    <div className="py-12 bg-vortx-black min-h-screen text-vortx-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="border-b border-vortx-white/10 pb-8 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-sans text-4xl font-extrabold tracking-wide uppercase">WARRIOR ACCOUNT</h1>
            <p className="text-xs text-vortx-gray uppercase font-semibold font-mono tracking-wider mt-1">ID: {user.id}</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-3 border border-vortx-white text-vortx-white font-sans text-sm font-bold tracking-widest hover:bg-vortx-white hover:text-vortx-black transition uppercase"
          >
            LOG OUT
          </button>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Panel: Profile info & Saved addresses (4/12) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* PROFILE INFO CARD */}
            <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-4">
              <h3 className="font-sans text-base font-bold tracking-wider text-vortx-white uppercase border-b border-vortx-white/10 pb-3">PROFILE DETAILS</h3>
              
              <div className="space-y-4 text-base">
                <div>
                  <span className="text-sm text-vortx-gray block uppercase font-bold">Full Name</span>
                  <span className="font-medium text-vortx-white">{user.fullName}</span>
                </div>
                <div>
                  <span className="text-sm text-vortx-gray block uppercase font-bold">Email Address</span>
                  <span className="font-medium text-vortx-white font-mono">{user.email}</span>
                </div>
                <div>
                  <span className="text-sm text-vortx-gray block uppercase font-bold">Mobile Phone</span>
                  <span className="font-medium text-vortx-white font-mono">{user.phone || 'Not added'}</span>
                </div>
                <div>
                  <span className="text-sm text-vortx-gray block uppercase font-bold">Role Permissions</span>
                  <span className="inline-block bg-vortx-white/10 px-2.5 py-1 rounded text-xs font-bold text-vortx-white uppercase">{user.role}</span>
                </div>
              </div>
            </div>

            {/* SAVED ADDRESSES */}
            <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-4">
              <h3 className="font-sans text-base font-bold tracking-wider text-vortx-white uppercase border-b border-vortx-white/10 pb-3">SAVED ADDRESSES ({addresses.length})</h3>
              
              {addresses.length === 0 ? (
                <p className="text-sm text-vortx-gray italic">No saved delivery addresses found.</p>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-3 bg-vortx-black/40 border border-vortx-white/10 rounded flex justify-between items-start">
                      <div className="text-base">
                        <span className="font-sans text-xs font-bold tracking-widest text-vortx-white bg-vortx-white/10 px-2 py-0.5 rounded uppercase mb-1.5 inline-block">{addr.type}</span>
                        <p className="font-medium text-vortx-white">{addr.addressLine1}</p>
                        {addr.addressLine2 && <p className="text-vortx-gray text-sm mt-0.5">{addr.addressLine2}</p>}
                        <p className="text-vortx-gray text-sm mt-0.5">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="text-sm text-vortx-gray font-mono font-medium mt-1">PHONE: {addr.phone}</p>
                      </div>
                      <button 
                        onClick={() => deleteAddress(addr.id)}
                        className="text-sm font-bold font-sans tracking-wider text-vortx-gray hover:text-vortx-white transition underline ml-2"
                      >
                        DELETE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Orders history & tracking lists (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ORDERS TABLE */}
            <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-6">
              <h3 className="font-sans text-base font-bold tracking-wider text-vortx-white uppercase border-b border-vortx-white/10 pb-3">ORDER HISTORY ({orders.length})</h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-vortx-white/10 rounded space-y-4">
                  <ClipboardList className="w-10 h-10 text-vortx-gray/40 stroke-[1] mx-auto" />
                  <p className="text-sm text-vortx-gray">You have not placed any orders yet.</p>
                  <Link 
                    href="/shop"
                    className="inline-block px-5 py-2.5 bg-vortx-white text-vortx-black font-sans text-xs font-bold tracking-widest hover:bg-vortx-white/95 transition"
                  >
                    GO TO SHOP
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id} 
                      className={`p-4 border rounded transition-all duration-300 ${
                        selectedOrder?.id === ord.id 
                          ? 'border-vortx-white bg-vortx-white/5' 
                          : 'border-vortx-white/10 bg-vortx-black/35 hover:border-vortx-white/25'
                      }`}
                    >
                      {/* Brief headers */}
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-vortx-white/5 pb-3.5 mb-3 text-base">
                        <div className="space-y-1">
                          <span className="text-sm text-vortx-gray block uppercase font-bold">ORDER NO</span>
                          <span className="font-mono font-bold text-vortx-white">{ord.orderNumber}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-vortx-gray block uppercase font-bold">DATE PLACED</span>
                          <span className="font-mono text-vortx-white">{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-vortx-gray block uppercase font-bold">TOTAL AMOUNT</span>
                          <span className="font-mono font-bold text-vortx-white">{formatPrice(ord.totalAmount)}</span>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-sm text-vortx-gray block uppercase font-bold">DELIVERY STATUS</span>
                          <span className={`inline-block font-sans text-xs font-bold tracking-widest px-3 py-1 rounded uppercase ${
                            ord.status === 'delivered' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : ord.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-3 mb-4">
                        {ord.items.map((item) => (
                          <div key={item.id} className="flex gap-3 justify-between items-center text-base">
                            <div className="flex items-center gap-3">
                              <img src={item.imageUrl} alt={item.productName} className="w-10 h-12 object-cover border border-vortx-white/10 animate-in fade-in" />
                              <div>
                                <p className="font-sans font-bold text-vortx-white text-sm tracking-wide uppercase">{item.productName}</p>
                                <p className="text-sm text-vortx-gray mt-0.5 font-mono">SIZE: {item.size} | QTY: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-mono text-base text-vortx-white">{formatPrice(item.unitPrice * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Details dropdown trigger */}
                      <div className="flex justify-between items-center border-t border-vortx-white/5 pt-3">
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === ord.id ? null : ord)}
                          className="text-sm font-sans font-bold tracking-widest text-vortx-white hover:underline uppercase"
                        >
                          {selectedOrder?.id === ord.id ? 'HIDE TRACKING RECEIPT' : 'TRACK SHIPPING TIMELINE'}
                        </button>
                        
                        {/* Write review shortcut if delivered */}
                        {ord.status === 'delivered' && (
                          <button
                            onClick={() => {
                              setReviewProductId(ord.items[0].productId);
                              setReviewProductName(ord.items[0].productName);
                            }}
                            className="text-sm border border-vortx-white/30 text-vortx-white hover:bg-vortx-white hover:text-vortx-black px-4 py-2 transition font-sans font-bold tracking-widest uppercase"
                          >
                            LEAVE FEEDBACK
                          </button>
                        )}
                      </div>

                      {/* SHIPROCKET TRACKER INTEGRATION DETAILS */}
                      {selectedOrder?.id === ord.id && (
                        <div className="mt-6 p-5 bg-vortx-black/80 rounded border border-vortx-white/15 space-y-6 animate-in slide-in-from-top-3 duration-300">
                          
                          {/* Shipping address receipt */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base font-mono pb-4 border-b border-vortx-white/5">
                            <div>
                              <span className="text-sm text-vortx-gray block uppercase font-sans font-bold">SHIPPING TO:</span>
                              <p className="text-vortx-white mt-1 uppercase font-sans">{ord.shippingAddress.addressLine1}</p>
                              <p className="text-vortx-gray mt-0.5 uppercase font-sans">{ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.postalCode}</p>
                            </div>
                            <div>
                              <span className="text-sm text-vortx-gray block uppercase font-sans font-bold">COURIER INFORMATION:</span>
                              <p className="text-vortx-white mt-1 uppercase font-sans">PARTNER: {ord.courierName || 'Shiprocket Sandbox'}</p>
                              <p className="text-vortx-gray mt-0.5 font-sans">TRACKING ID: {ord.trackingNumber || 'PENDING ASSIGNMENT'}</p>
                            </div>
                          </div>

                          {/* Horizontal Shipment milestones */}
                          <div className="space-y-4">
                            <span className="text-sm font-sans font-bold tracking-widest text-vortx-gray block uppercase">SHIPROCKET DELIVERY STATUS:</span>
                            
                            <div className="grid grid-cols-4 gap-2 relative">
                              {/* progress connection line */}
                              <div className="absolute top-[15px] left-[12%] right-[12%] h-[1px] bg-vortx-white/10 z-0" />
                              
                              {/* Step 1: Placed */}
                              <div className="flex flex-col items-center text-center z-10 space-y-2">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-mono font-bold transition z-10 ${getStatusStepClass(ord.status, 'pending')}`}>
                                  {ord.status !== 'pending' && ord.status !== 'cancelled' ? '✓' : '1'}
                                </div>
                                <span className="text-xs font-sans font-bold tracking-wider text-vortx-white uppercase">ORDERED</span>
                              </div>

                              {/* Step 2: Paid */}
                              <div className="flex flex-col items-center text-center z-10 space-y-2">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-mono font-bold transition z-10 ${getStatusStepClass(ord.status, 'paid')}`}>
                                  {ord.status === 'shipped' || ord.status === 'delivered' ? '✓' : '2'}
                                </div>
                                <span className="text-xs font-sans font-bold tracking-wider text-vortx-white uppercase">PACKED</span>
                              </div>

                              {/* Step 3: Shipped */}
                              <div className="flex flex-col items-center text-center z-10 space-y-2">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-mono font-bold transition z-10 ${getStatusStepClass(ord.status, 'shipped')}`}>
                                  {ord.status === 'delivered' ? '✓' : '3'}
                                </div>
                                <span className="text-xs font-sans font-bold tracking-wider text-vortx-white uppercase">SHIPPED</span>
                              </div>

                              {/* Step 4: Delivered */}
                              <div className="flex flex-col items-center text-center z-10 space-y-2">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-mono font-bold transition z-10 ${getStatusStepClass(ord.status, 'delivered')}`}>
                                  4
                                </div>
                                <span className="text-xs font-sans font-bold tracking-wider text-vortx-white uppercase">DELIVERED</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* DOCK ALERTS ORDER SUCCESS */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
          <div className="relative w-full max-w-md bg-vortx-dark border border-vortx-white/20 p-8 text-center glassmorphism rounded shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-vortx-gray hover:text-vortx-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full border border-vortx-white flex items-center justify-center text-vortx-white mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="font-sans text-xs font-bold tracking-[0.25em] text-vortx-gray uppercase">ORDER INITIATED</span>
            <h3 className="font-sans text-3xl font-extrabold tracking-wider text-vortx-white mt-3 mb-2">WELCOME TO THE CLAN</h3>
            <p className="text-sm text-vortx-gray leading-relaxed mb-6">
              Your transaction has been verified successfully. Your VORTX tracking receipt code is generated below. Transaction notifications dispatched via WhatsApp & Email.
            </p>
            <div className="border border-dashed border-vortx-white/20 p-5 rounded bg-vortx-white/5 font-mono text-base font-bold text-vortx-white tracking-widest uppercase select-all">
              ORDER REF: {successOrderNum}
            </div>
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-6 py-4 bg-vortx-white text-vortx-black font-sans text-xs sm:text-sm font-bold tracking-widest hover:bg-vortx-white/90 active:scale-95 transition"
            >
              GO TO ORDER TRACKING
            </button>
          </div>
        </div>
      )}

      {/* FEEDBACK SUBMIT MODAL */}
      {reviewProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setReviewProductId('')} />
          <form onSubmit={handleReviewSubmission} className="relative w-full max-w-md bg-vortx-dark border border-vortx-white/20 p-6 glassmorphism rounded shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-vortx-white/10 pb-3">
              <div className="flex flex-col">
                <span className="font-sans text-[10px] font-bold tracking-widest text-vortx-gray uppercase">WARRIORS REVIEW</span>
                <span className="font-sans text-sm font-bold tracking-wider text-vortx-white uppercase truncate max-w-[280px]">
                  {reviewProductName}
                </span>
              </div>
              <button type="button" onClick={() => setReviewProductId('')} className="text-vortx-gray hover:text-vortx-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="h-40 flex flex-col items-center justify-center text-center space-y-2 text-xs">
                <Package className="w-8 h-8 text-vortx-white animate-bounce" />
                <p className="font-sans font-bold tracking-widest uppercase text-vortx-white">REVIEW COMPILED</p>
                <p className="text-vortx-gray text-sm">Thank you for adding your feedback lead.</p>
              </div>
            ) : (
              <>
                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">RATING</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-vortx-gray hover:text-vortx-white transition"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current text-vortx-white' : 'text-vortx-gray/40'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div>
                  <label className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">COMMENT</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="HOW DOES THE GEAR PERFORM? DESCRIBE FIT, FABRIC QUALITY, OR COMFORT."
                    className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3 text-sm text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30 uppercase"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-vortx-white text-vortx-black font-sans text-xs sm:text-sm font-bold tracking-widest hover:bg-vortx-white/95 transition uppercase flex items-center justify-center gap-1.5"
                >
                  <span>SUBMIT FEEDBACK</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </form>
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="py-12 bg-vortx-black min-h-screen text-vortx-white flex items-center justify-center">
        <div className="text-center text-xs text-vortx-gray font-syne tracking-widest uppercase">
          LOADING PROFILE...
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
