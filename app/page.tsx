'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSupabaseProducts, fetchReviews } from '@/lib/supabase';
import { useStore } from '@/components/StoreContext';
import { ArrowRight, Star, ChevronLeft, ChevronRight, Truck, RotateCcw, ShieldCheck, FlaskConical } from 'lucide-react';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';
import { ProductCard } from '@/components/commerce/ProductCard';

const CATEGORIES = [
  { label: 'Tops', value: 'tops', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80' },
  { label: 'Bottoms', value: 'bottoms', image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80' },
  { label: 'Outerwear', value: 'outerwear', image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&q=80' },
];

export default function Home() {
  const { preOrderMode } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const loadHomeData = async () => {
      setIsLoadingProducts(true);
      const [prods, revs] = await Promise.all([
        fetchSupabaseProducts(),
        fetchReviews()
      ]);
      setProducts(prods);
      setReviews(revs);
      setIsLoadingProducts(false);
    };
    loadHomeData();
  }, []);

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

      {/* 1. HERO */}
      <section className="relative h-[78svh] sm:h-[90vh] md:h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vortx-black via-vortx-black/40 to-vortx-black/80" />

        <div className="relative z-10 text-center px-5 max-w-3xl mx-auto space-y-6 sm:space-y-7">
          <span className="inline-block font-mono text-2xs sm:text-xs font-semibold tracking-[0.18em] text-vortx-gray uppercase">
            Hybrid Athlete Line
          </span>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] text-vortx-white">
            Train hard.<br />Wear VORTX.
          </h1>

          <p className="font-sans text-sm sm:text-base text-vortx-gray max-w-md mx-auto">
            Ultra-premium activewear engineered for the hybrid athlete.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-vortx-white text-vortx-black font-sans text-xs font-bold tracking-widest hover:bg-vortx-white/90 transition"
            >
              SHOP COLLECTION
            </Link>
            <Link
              href="/shop?filter=preorder"
              className="text-xs font-sans font-semibold tracking-widest text-vortx-gray hover:text-vortx-white transition uppercase"
            >
              Pre-order next drop →
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TRUST ROW — operational facts, not invented stats */}
      <section className="bg-vortx-dark/60 border-b border-vortx-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-vortx-white/10 text-center">
            <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
              <Truck className="w-4 h-4 text-vortx-white" />
              <span className="text-3xs font-mono font-semibold tracking-widest text-vortx-gray uppercase">Free shipping over ₹3,000</span>
            </div>
            <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
              <RotateCcw className="w-4 h-4 text-vortx-white" />
              <span className="text-3xs font-mono font-semibold tracking-widest text-vortx-gray uppercase">7-day returns</span>
            </div>
            <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
              <FlaskConical className="w-4 h-4 text-vortx-white" />
              <span className="text-3xs font-mono font-semibold tracking-widest text-vortx-gray uppercase">Lab-tested tech weave</span>
            </div>
            <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
              <ShieldCheck className="w-4 h-4 text-vortx-white" />
              <span className="text-3xs font-mono font-semibold tracking-widest text-vortx-gray uppercase">Secure checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW DROP / BESTSELLERS */}
      <section className="py-16 sm:py-24 border-b border-vortx-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-wide text-vortx-white">
                {preOrderMode ? 'PRE-ORDER COLLECTION' : 'NEW DROP'}
              </h2>
              <p className="text-xs text-vortx-gray mt-2 uppercase tracking-widest font-medium">
                {preOrderMode ? 'Reserve next-generation gear' : 'Latest arrivals & bestsellers'}
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-vortx-white px-5 py-3 hover:bg-vortx-white hover:text-vortx-black font-sans text-2xs font-bold tracking-widest transition"
            >
              EXPLORE COLLECTION <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <ProductGridSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {filteredProducts.slice(0, 3).map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 4. SHOP BY CATEGORY */}
      <section className="py-16 sm:py-24 border-b border-vortx-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide text-vortx-white mb-10">
            SHOP BY CATEGORY
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/shop?category=${cat.value}`}
                className="group relative aspect-[4/5] overflow-hidden border border-vortx-white/15 bg-vortx-gray-dark block"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 img-hover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-vortx-black via-vortx-black/10 to-transparent" />
                <span className="absolute bottom-5 left-5 font-display text-lg font-bold tracking-wide text-vortx-white">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BRAND PHILOSOPHY SPLIT SECTION */}
      <section className="py-16 sm:py-24 border-b border-vortx-white/10 bg-vortx-gray-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="aspect-[4/5] md:aspect-video lg:aspect-square bg-vortx-gray-dark border border-vortx-white/15 overflow-hidden order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
                alt="VORTX athlete"
                className="w-full h-full object-cover grayscale opacity-90"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <span className="font-mono text-2xs font-semibold tracking-[0.2em] text-vortx-gray uppercase">For Warriors, Not Watchers</span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-wide text-vortx-white">
                Built for the hybrid athlete.
              </h2>
              <p className="text-sm text-vortx-gray leading-relaxed max-w-lg">
                VORTX exists for the ones who run at dawn and lift at dusk. No concessions for the watch list — every piece is built to move the way you train, not the way you pose.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 font-display text-xs font-bold tracking-widest text-vortx-white">
                <div className="border-l border-vortx-white/20 pl-4 py-2">
                  <h4 className="text-2xs text-vortx-gray mb-1 font-mono font-normal tracking-wider">Strength first</h4>
                  <p>HYBRID SHELLS</p>
                </div>
                <div className="border-l border-vortx-white/20 pl-4 py-2">
                  <h4 className="text-2xs text-vortx-gray mb-1 font-mono font-normal tracking-wider">Zero excuses</h4>
                  <p>PERFORMANCE TECH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS SLIDER */}
      {reviews.length > 0 && (
        <section className="py-16 sm:py-24 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide text-vortx-white mb-10">
              ATHLETE INSIGHTS
            </h2>

            <div className="relative border border-vortx-white/10 bg-vortx-dark/40 p-8 sm:p-12 min-h-[220px] flex flex-col justify-between">

              <div className="flex justify-center gap-1 mb-6 text-vortx-white">
                {Array(reviews[currentReviewIndex].rating).fill(null).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="font-sans text-sm sm:text-base text-vortx-gray italic leading-relaxed max-w-xl mx-auto">
                "{reviews[currentReviewIndex].comment}"
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full bg-vortx-white text-vortx-black font-display text-xs font-bold flex items-center justify-center">
                  {reviews[currentReviewIndex].user_name?.[0]}
                </div>
                <span className="font-display text-xs font-bold tracking-widest text-vortx-white">
                  {reviews[currentReviewIndex].user_name.toUpperCase()}
                </span>
              </div>

              {reviews.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                  <button
                    onClick={prevReview}
                    aria-label="Previous review"
                    className="p-1.5 border border-vortx-white/20 bg-vortx-black/80 hover:border-vortx-white text-vortx-white transition pointer-events-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextReview}
                    aria-label="Next review"
                    className="p-1.5 border border-vortx-white/20 bg-vortx-black/80 hover:border-vortx-white text-vortx-white transition pointer-events-auto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

          </div>
        </section>
      )}

    </div>
  );
}
