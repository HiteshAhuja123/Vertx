'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/components/StoreContext';
import { mockDb, fetchSupabaseProducts } from '@/lib/supabase';
import { SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react';
import { ProductCard } from '@/components/commerce/ProductCard';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { preOrderMode, togglePreOrderMode } = useStore();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Load products from live Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const prods = await fetchSupabaseProducts();
      setDbProducts(prods);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // Update filters based on query params (navbar links)
  useEffect(() => {
    const gender = searchParams.get('gender');
    if (gender) {
      setSelectedGender(gender);
    } else {
      setSelectedGender('all');
    }

    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('all');
    }

    const filter = searchParams.get('filter');
    if (filter === 'preorder') {
      if (!preOrderMode) {
        togglePreOrderMode();
      }
    } else if (filter === 'instock') {
      if (preOrderMode) {
        togglePreOrderMode();
      }
    }
  }, [searchParams, preOrderMode, togglePreOrderMode]);

  // Apply filters
  useEffect(() => {
    let result = [...dbProducts];

    // Filter by Catalog Mode (Pre-Order vs In Stock)
    if (preOrderMode) {
      result = result.filter(p => p.pre_order_available);
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Gender
    if (selectedGender !== 'all') {
      result = result.filter(p => p.gender === selectedGender || p.gender === 'unisex');
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Sort Products
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredProducts(result);
  }, [dbProducts, preOrderMode, selectedCategory, selectedGender, searchQuery, sortBy]);

  return (
    <div className="py-16 lg:py-20 bg-vortx-black min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        {/* Page Header */}
        <div className="border-b border-vortx-white/10 pb-8 mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-wide text-vortx-white">
            {preOrderMode ? 'PRE-ORDERS CATALOG' : 'GEAR CATALOG'}
          </h1>
          <p className="text-xs text-vortx-gray mt-2 tracking-widest uppercase font-semibold">
            {preOrderMode ? 'RESERVE NEXT GENERATION WARRIOR TECH' : 'ENGINEERED STRENGTH FOR HYBRID ATHLETES'}
          </p>
        </div>

        {/* Filter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 xl:gap-14">

          {/* Left Side Sidebar Filters (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 border-r border-vortx-white/10 pr-10">
            <aside className="catalog-filters">

              {/* Category Filter */}
              <div className="catalog-filter-group">
                <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-white mb-4 uppercase">CATEGORY</h4>
                <div className="space-y-1">
                  {['all', 'tops', 'bottoms', 'outerwear'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-xs font-medium tracking-wide text-left transition py-2 pl-3 border-l-2 ${selectedCategory === cat
                          ? 'text-vortx-white font-bold border-vortx-white bg-vortx-white/5'
                          : 'text-vortx-gray hover:text-vortx-white border-transparent hover:bg-vortx-white/2'
                        }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div className="catalog-filter-group">
                <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-white mb-4 uppercase">GENDER</h4>
                <div className="space-y-1">
                  {['all', 'men', 'women', 'unisex'].map((gen) => (
                    <button
                      key={gen}
                      onClick={() => setSelectedGender(gen)}
                      className={`block w-full text-xs font-medium tracking-wide text-left transition py-2 pl-3 border-l-2 ${selectedGender === gen
                          ? 'text-vortx-white font-bold border-vortx-white bg-vortx-white/5'
                          : 'text-vortx-gray hover:text-vortx-white border-transparent hover:bg-vortx-white/2'
                        }`}
                    >
                      {gen.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="catalog-filter-group">
                <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-white mb-4 uppercase">SORT BY</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-vortx-dark border border-vortx-white/20 px-3.5 py-2.5 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-sans font-bold tracking-wide"
                >
                  <option value="featured">FEATURED</option>
                  <option value="price-asc">PRICE: LOW TO HIGH</option>
                  <option value="price-desc">PRICE: HIGH TO LOW</option>
                  <option value="newest">NEW RELEASES</option>
                </select>
              </div>

            </aside>
          </div>

          {/* Right Side Catalog Grid */}
          <div className="lg:col-span-3">

            {/* Catalog Action Header Bar (Search & Mobile Filter Trigger) */}
            <div className="flex gap-4 mb-6">
              {/* Universal Search Input */}
              <div className="relative flex-grow flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-vortx-gray/50" />
                <input
                  type="text"
                  placeholder="SEARCH GEAR"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-vortx-dark border border-vortx-white/20 px-3.5 py-2.5 pl-10 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50 uppercase"
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-vortx-white text-vortx-black hover:bg-vortx-white/90 font-sans text-xs font-bold tracking-widest uppercase transition flex-shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                FILTERS
              </button>
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-vortx-white/10 rounded">
                <p className="font-sans text-xs font-bold tracking-wider text-vortx-gray">NO GEAR MATCHES THE SELECTED FILTERS</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedGender('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-5 py-2 border border-vortx-white text-vortx-white text-xs font-sans font-bold tracking-widest hover:bg-vortx-white hover:text-vortx-black transition"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="relative w-80 max-w-full bg-vortx-dark border-l border-vortx-white/10 p-6 flex flex-col justify-between elevated h-full">
            <div className="space-y-8 overflow-y-auto pr-1">
              <div className="flex justify-between items-center border-b border-vortx-white/10 pb-4">
                <span className="font-display text-xs font-bold tracking-widest text-vortx-white uppercase">FILTERS & SORT</span>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 hover:bg-vortx-white/10 rounded transition text-vortx-gray hover:text-vortx-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="catalog-filter-group">
                <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-white mb-4 uppercase">CATEGORY</h4>
                <div className="space-y-1">
                  {['all', 'tops', 'bottoms', 'outerwear'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`block w-full text-xs font-medium tracking-wide text-left transition py-2.5 pl-3 border-l-2 ${selectedCategory === cat
                          ? 'text-vortx-white font-bold border-vortx-white bg-vortx-white/5'
                          : 'text-vortx-gray hover:text-vortx-white border-transparent hover:bg-vortx-white/2'
                        }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Filter */}
              <div className="catalog-filter-group">
                <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-white mb-4 uppercase">GENDER</h4>
                <div className="space-y-1">
                  {['all', 'men', 'women', 'unisex'].map((gen) => (
                    <button
                      key={gen}
                      onClick={() => {
                        setSelectedGender(gen);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`block w-full text-xs font-medium tracking-wide text-left transition py-2.5 pl-3 border-l-2 ${selectedGender === gen
                          ? 'text-vortx-white font-bold border-vortx-white bg-vortx-white/5'
                          : 'text-vortx-gray hover:text-vortx-white border-transparent hover:bg-vortx-white/2'
                        }`}
                    >
                      {gen.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="catalog-filter-group">
                <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-white mb-4 uppercase">SORT BY</h4>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setIsMobileFiltersOpen(false);
                  }}
                  className="w-full bg-vortx-black border border-vortx-white/20 px-3.5 py-2.5 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-sans font-bold tracking-wide"
                >
                  <option value="featured">FEATURED</option>
                  <option value="price-asc">PRICE: LOW TO HIGH</option>
                  <option value="price-desc">PRICE: HIGH TO LOW</option>
                  <option value="newest">NEW RELEASES</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedGender('all');
                setSearchQuery('');
                setIsMobileFiltersOpen(false);
              }}
              className="w-full py-3 mt-6 border border-vortx-white/20 text-vortx-gray hover:border-vortx-white hover:text-vortx-white text-xs font-sans font-bold tracking-widest transition uppercase"
            >
              RESET FILTERS
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-vortx-black text-vortx-white flex items-center justify-center font-display text-xs font-bold tracking-widest uppercase">
        LOADING CATALOG...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
