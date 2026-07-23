'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockDb, fetchSupabaseProducts } from '@/lib/supabase';
import { useStore } from '@/components/StoreContext';
import { ArrowRight, Play, Star, ChevronLeft, ChevronRight, X, Clock, ShoppingBag, Eye } from 'lucide-react';
import { formatPrice } from '@/products';

// Mock notification list
const RANDOM_PURCHASES = [
  { location: "Mumbai", product: "Hybrid Compression Shell", time: "2 mins ago" },
  { location: "Delhi", product: "Phantom Joggers", time: "5 mins ago" },
  { location: "Bangalore", product: "Stealth Training Shorts", time: "1 min ago" },
  { location: "London", product: "VORTX Track Jacket", time: "8 mins ago" },
  { location: "Tokyo", product: "Shadow Leggings", time: "12 mins ago" },
];

export default function Home() {
  const router = useRouter();
  const { addToCart, preOrderMode } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Popups & Notifications
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupTriggered, setExitPopupTriggered] = useState(false);
  const [recentPurchase, setRecentPurchase] = useState<any | null>(null);

  useEffect(() => {
    const loadHomeProducts = async () => {
      const prods = await fetchSupabaseProducts();
      setProducts(prods);
    };
    loadHomeProducts();
    setReviews(mockDb.getReviews());

    // Countdown target: August 15, 2026
    const target = new Date("2026-08-15T00:00:00Z").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    // Recently purchased toast loop
    const purchaseTimeout = setTimeout(() => {
      showRandomPurchase();
    }, 8000);

    // Exit Intent Handler
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 50 && !exitPopupTriggered) {
        setShowExitPopup(true);
        setExitPopupTriggered(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(interval);
      clearTimeout(purchaseTimeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitPopupTriggered]);

  const showRandomPurchase = () => {
    const randomIdx = Math.floor(Math.random() * RANDOM_PURCHASES.length);
    setRecentPurchase(RANDOM_PURCHASES[randomIdx]);
    
    // Hide after 4 seconds
    setTimeout(() => {
      setRecentPurchase(null);
      // Schedule next trigger
      setTimeout(showRandomPurchase, Math.random() * 15000 + 15000);
    }, 4000);
  };

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Filter products based on layout configuration (pre-order vs standard)
  const filteredProducts = products.filter(p => {
    if (preOrderMode) return p.pre_order_available;
    return !p.pre_order_available || p.is_in_stock;
  });

  return (
    <div className="relative w-full overflow-hidden bg-vortx-black">
      
      {/* 1. HERO BANNER SCREEN */}
      <section className="relative h-[78svh] sm:h-[90vh] md:h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Visual (Atmospheric premium graphic) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105 transition-transform duration-[10000ms]"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&q=80')` }}
        />
        {/* Deep overlay vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-vortx-black via-vortx-black/40 to-vortx-black/80" />
        
        {/* Grid Background Line Overlay & Laser Scanner Sweep */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="scanner-sweep" />

        {/* Content */}
        <div className="relative z-10 text-center px-5 max-w-5xl mx-auto space-y-5 sm:space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 border border-vortx-white/20 px-3.5 py-1.5 bg-vortx-white/5 backdrop-blur-md rounded-full">
            <span className="h-1.5 w-1.5 bg-vortx-white rounded-full animate-ping" />
            <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.16em] text-vortx-white uppercase">HYBRID ATHLETE LINE INITIATED</span>
          </div>

          <h1 className="font-sans text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none text-vortx-white select-none uppercase">
            TRAIN HARD.<br />WEAR VORTX.
          </h1>

          <p className="font-sans text-xs sm:text-sm tracking-[0.25em] text-vortx-gray uppercase font-bold max-w-xl mx-auto">
            Premium Gym Wear Built For Lifters.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-5 sm:pt-6 w-full max-w-sm sm:max-w-none mx-auto">
            <Link 
              href="/shop"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-vortx-white text-vortx-black font-sans text-xs font-bold tracking-widest hover:bg-vortx-white/90 active:scale-95 transition-all duration-300 shadow-xl"
            >
              SHOP COLLECTION
            </Link>
            <Link 
              href="/shop?filter=preorder"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 border border-vortx-white/30 text-vortx-white font-sans text-xs font-bold tracking-widest hover:bg-vortx-white/10 hover:border-vortx-white transition-all duration-300"
            >
              PRE-ORDER COLLECTION
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 opacity-50">
          <span className="text-[8px] font-sans font-bold tracking-widest text-vortx-gray">SCROLL</span>
          <div className="w-1 h-12 border border-vortx-white/20 rounded-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-vortx-white rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. INFINITE TICKER MARQUEE */}
      <section className="bg-vortx-white text-vortx-black py-4 overflow-hidden border-y border-vortx-white select-none">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(10).fill("FOR WARRIORS, NOT WATCHERS. // VORTX ACTIVEWEAR // ").map((text, i) => (
            <span key={i} className="font-sans text-xs font-black tracking-widest mx-10">
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* 3. LIMITED DROP COUNTDOWN */}
      <section className="py-20 border-b border-vortx-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 border border-vortx-white/25 px-3 py-1 rounded">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono text-[9px] font-bold tracking-widest text-vortx-white">LIMITED DROP COUNTDOWN</span>
              </div>
              <h2 className="font-sans text-4xl sm:text-5xl font-extrabold tracking-wide text-vortx-white">
                NEW RELEASES
              </h2>
              <p className="text-sm text-vortx-gray leading-relaxed max-w-lg">
                The next iteration of warrior performance drops on August 15, 2026. Pre-orders are open exclusively to clan members. Stocks are capped at 50 units globally.
              </p>
              
              {/* Countdown Ticker boxes */}
              <div className="grid grid-cols-4 gap-4 max-w-sm pt-4 font-mono text-center">
                <div className="bg-vortx-white/5 border border-vortx-white/10 p-3 rounded countdown-pulse">
                  <span className="block text-2xl font-bold text-vortx-white">{timeLeft.days}</span>
                  <span className="text-[8px] text-vortx-gray uppercase">Days</span>
                </div>
                <div className="bg-vortx-white/5 border border-vortx-white/10 p-3 rounded countdown-pulse">
                  <span className="block text-2xl font-bold text-vortx-white">{timeLeft.hours}</span>
                  <span className="text-[8px] text-vortx-gray uppercase">Hours</span>
                </div>
                <div className="bg-vortx-white/5 border border-vortx-white/10 p-3 rounded countdown-pulse">
                  <span className="block text-2xl font-bold text-vortx-white">{timeLeft.minutes}</span>
                  <span className="text-[8px] text-vortx-gray uppercase">Mins</span>
                </div>
                <div className="bg-vortx-white/5 border border-vortx-white/10 p-3 rounded countdown-pulse">
                  <span className="block text-2xl font-bold text-vortx-white">{timeLeft.seconds}</span>
                  <span className="text-[8px] text-vortx-gray uppercase">Secs</span>
                </div>
              </div>
              
              <div className="pt-2">
                <Link 
                  href="/shop?filter=preorder"
                  className="inline-flex items-center gap-2 text-xs font-syne font-bold tracking-widest text-vortx-white hover:text-vortx-gray transition"
                >
                  PRE-ORDER NOW <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Countdown Image Banner */}
            <div className="relative aspect-video lg:aspect-square bg-vortx-gray-dark border border-vortx-white/15 overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&q=80" 
                alt="Limited Drop Apex"
                className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-vortx-black via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <span className="px-3 py-1 bg-vortx-white text-vortx-black font-syne text-[8px] font-bold tracking-wider">EXCLUSIVE DROP</span>
                <span className="text-[10px] font-mono font-bold text-vortx-white">EST: ₹6,999</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. NEW DROPS & BEST SELLERS CATALOG */}
      <section className="py-24 border-b border-vortx-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-sans text-4xl font-extrabold tracking-wide text-vortx-white">WARRIOR GEAR</h2>
              <p className="text-xs text-vortx-gray mt-2 uppercase tracking-widest font-semibold">
                {preOrderMode ? 'PRE-ORDERS COLLECTION ACTIVE' : 'BESTSELLERS & NEW ARRIVALS'}
              </p>
            </div>
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 border border-vortx-white px-5 py-3 hover:bg-vortx-white hover:text-vortx-black font-syne text-[10px] font-bold tracking-widest transition duration-300"
            >
              EXPLORE COLLECTION <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.slice(0, 3).map((prod) => {
              const isPreOrder = prod.pre_order_available;
              return (
                <div 
                  key={prod.id} 
                  onClick={() => router.push(`/product/${prod.slug}`)}
                  className="group flex flex-col border border-vortx-white/15 bg-vortx-dark/40 overflow-hidden relative transition hover:border-vortx-white/30 cursor-pointer"
                >
                  {/* Image wrapper */}
                  <div className="aspect-[4/5] bg-vortx-gray-dark relative overflow-hidden">
                    {/* Warrior Target Lock Brackets overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="card-target-bracket card-target-top-left" />
                      <div className="card-target-bracket card-target-top-right" />
                      <div className="card-target-bracket card-target-bottom-left" />
                      <div className="card-target-bracket card-target-bottom-right" />
                    </div>
                    
                    <img 
                      src={prod.images?.[0]} 
                      alt={prod.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-102 transition duration-500"
                    />
                    
                    {/* Hover controls overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
                      <Link 
                        href={`/product/${prod.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 bg-vortx-white text-vortx-black rounded-full hover:scale-105 active:scale-95 transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: prod.id,
                            variantId: prod.variants?.[0]?.id || prod.id,
                            name: prod.name,
                            price: prod.price,
                            mrp: prod.mrp,
                            size: prod.variants?.[0]?.size || 'M',
                            color: prod.variants?.[0]?.color || 'Black',
                            image: prod.images?.[0] || '',
                            sku: prod.variants?.[0]?.sku || '',
                            isPreOrder: isPreOrder,
                            preOrderDate: prod.pre_order_date
                          }, 1);
                        }}
                        className="p-3 bg-vortx-white text-vortx-black rounded-full hover:scale-105 active:scale-95 transition"
                        title={isPreOrder ? "Pre-Order Item" : "Add to Cart"}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Badge */}
                    {prod.badge && (
                      <span className="absolute top-4 left-4 px-2 py-1 bg-vortx-white text-vortx-black font-syne text-[8px] font-extrabold tracking-wider">
                        {prod.badge}
                      </span>
                    )}

                    {/* Pre Order flag */}
                    {isPreOrder && (
                      <span className="absolute bottom-4 right-4 border border-vortx-white bg-vortx-black text-vortx-white font-syne text-[7px] font-bold tracking-widest px-2 py-1 rounded">
                        PRE-ORDER
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between border-t border-vortx-white/10 bg-vortx-black/85">
                    <div>
                      <span className="text-[8px] text-vortx-gray font-mono uppercase tracking-widest">
                        {prod.category}
                      </span>
                      <Link href={`/product/${prod.slug}`} onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-syne text-xs font-bold tracking-wider text-vortx-white mt-1 hover:underline">
                          {prod.name.toUpperCase()}
                        </h3>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2.5 mt-3 font-mono">
                      <span className="text-xs font-bold text-vortx-white">{formatPrice(prod.price)}</span>
                      {prod.mrp && prod.mrp > prod.price && (
                        <>
                          <span className="text-[10px] text-vortx-gray line-through">{formatPrice(prod.mrp)}</span>
                          <span className="text-[9px] text-emerald-400 font-sans font-bold">-{prod.discount_percent}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. BRAND PHILOSOPHY SPLIT SECTION */}
      <section className="py-24 border-b border-vortx-white/10 bg-vortx-gray-dark/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="aspect-[4/5] md:aspect-video lg:aspect-square bg-vortx-gray-dark border border-vortx-white/15 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80" 
                alt="Warrior Stance"
                className="w-full h-full object-cover grayscale opacity-90"
              />
            </div>
            <div className="space-y-6">
              <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-vortx-gray uppercase">THE CLAN MANIFESTO</span>
              <h2 className="font-sans text-4xl sm:text-5xl font-extrabold tracking-wide text-vortx-white">
                DESIGNED FOR WARRIORS, NOT WATCHERS.
              </h2>
              <p className="text-sm text-vortx-gray leading-relaxed">
                VORTX was forged for the hybrid athlete. The ones who run miles at dawn and lift plates at dusk. We do not design for influencers or gym-goers who pose. We design armor for athletes who bleed. 
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 font-syne text-xs font-bold tracking-widest text-vortx-white">
                <div className="border-l border-vortx-white/20 pl-4 py-2">
                  <h4 className="text-[10px] text-vortx-gray mb-1">STRENGTH FIRST</h4>
                  <p>HYBRID SHELLS</p>
                </div>
                <div className="border-l border-vortx-white/20 pl-4 py-2">
                  <h4 className="text-[10px] text-vortx-gray mb-1">ZERO EXCUSES</h4>
                  <p>PERFORMANCE TECH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS SLIDER */}
      {reviews.length > 0 && (
        <section className="py-24 border-b border-vortx-white/10 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-vortx-gray uppercase">COMMUNITY RATING</span>
            <h2 className="font-sans text-4xl font-bold tracking-wide text-vortx-white mt-2 mb-10">ATHLETE INSIGHTS</h2>
            
            {/* Reviews container */}
            <div className="relative bg-vortx-dark/30 border border-vortx-white/10 p-8 sm:p-12 rounded glassmorphism min-h-[220px] flex flex-col justify-between">
              
              {/* Rating stars */}
              <div className="flex justify-center gap-1 mb-6 text-vortx-white">
                {Array(reviews[currentReviewIndex].rating).fill(null).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-current" />
                ))}
              </div>

              {/* Comment text */}
              <p className="font-sans text-sm sm:text-base text-vortx-gray italic leading-relaxed max-w-xl mx-auto">
                "{reviews[currentReviewIndex].comment}"
              </p>

              {/* Author name */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-vortx-white text-vortx-black font-syne text-xs font-bold flex items-center justify-center">
                  {reviews[currentReviewIndex].user_name?.[0]}
                </div>
                <span className="font-syne text-xs font-bold tracking-widest text-vortx-white">
                  {reviews[currentReviewIndex].user_name.toUpperCase()}
                </span>
              </div>

              {/* Slider Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                <button 
                  onClick={prevReview}
                  className="p-1.5 rounded-full border border-vortx-white/20 bg-vortx-black/80 hover:bg-vortx-white hover:text-vortx-black text-vortx-white transition pointer-events-auto active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextReview}
                  className="p-1.5 rounded-full border border-vortx-white/20 bg-vortx-black/80 hover:bg-vortx-white hover:text-vortx-black text-vortx-white transition pointer-events-auto active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 7. EXIT INTENT POPUP MODAL */}
      {showExitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowExitPopup(false)} />
          <div className="relative w-full max-w-md bg-vortx-dark border border-vortx-white/20 p-8 text-center glassmorphism rounded shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-vortx-gray hover:text-vortx-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-vortx-white/80 uppercase">WARRIORS EXCLUSIVE</span>
            <h3 className="font-syne text-2xl font-bold tracking-wider text-vortx-white mt-3 mb-2">DON'T LEAVE EMPTY HANDED</h3>
            <p className="text-sm text-vortx-gray leading-relaxed mb-6">
              Sign up for the clan drops today and get 10% off your first checkout.
            </p>
            <div className="border border-dashed border-vortx-white/20 p-4 rounded bg-vortx-white/5 font-mono text-base font-bold text-vortx-white tracking-widest uppercase select-all">
              COUPON: WELCOME10
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowExitPopup(false)}
                className="flex-1 py-3 bg-vortx-white text-vortx-black font-syne text-xs font-bold tracking-widest hover:bg-vortx-white/90 active:scale-95 transition"
              >
                APPLY CODE
              </button>
              <button 
                onClick={() => setShowExitPopup(false)}
                className="flex-1 py-3 border border-vortx-white/20 text-vortx-white font-syne text-xs font-bold tracking-widest hover:bg-vortx-white/10 transition"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. RECENTLY PURCHASED FLOATING TOAST */}
      {recentPurchase && (
        <div className="hidden sm:flex fixed bottom-6 left-6 z-50 w-72 bg-vortx-dark border border-vortx-white/20 p-3 gap-3 shadow-2xl glassmorphism rounded animate-in slide-in-from-left-5 fade-in duration-300">
          <div className="w-8 h-8 rounded-full border border-vortx-white/20 flex items-center justify-center text-vortx-white flex-shrink-0 mt-0.5">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div className="text-[10px]">
            <p className="text-vortx-gray font-medium">Recently Purchased</p>
            <p className="font-syne font-bold text-vortx-white mt-0.5">
              Athlete in {recentPurchase.location}
            </p>
            <p className="text-vortx-white/90 truncate max-w-[200px] mt-0.5">
              Purchased {recentPurchase.product}
            </p>
            <span className="text-[8px] text-vortx-gray font-mono mt-1 block">
              {recentPurchase.time}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
