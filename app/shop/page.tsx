'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/StoreContext';
import { mockDb } from '@/lib/supabase';
import { ShoppingBag, Eye, SlidersHorizontal, Search, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/products';

export default function Shop() {
  const { addToCart, preOrderMode, togglePreOrderMode } = useStore();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Load products
  useEffect(() => {
    setDbProducts(mockDb.getProducts());
  }, []);

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
        <div className="border-b border-vortx-white/10 pb-10 mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-syne text-4xl font-extrabold tracking-wide text-vortx-white uppercase">
              {preOrderMode ? 'PRE-ORDERS CATALOG' : 'GEAR CATALOG'}
            </h1>
            <p className="text-xs text-vortx-gray mt-2 tracking-widest uppercase font-semibold">
              {preOrderMode ? 'RESERVE NEXT GENERATION WARRIOR TECH' : 'ENGINEERED STRENGTH FOR HYBRID ATHLETES'}
            </p>
          </div>
          
          {/* Quick mode explanation banner */}
          <div className="p-3 bg-vortx-white/5 border border-vortx-white/10 rounded flex items-center justify-between gap-4 max-w-sm">
            <div className="text-[10px] text-vortx-gray leading-normal pr-2">
              <span className="font-bold text-vortx-white">Catalog Toggle:</span> Switch between standard in-stock listings and pre-orders.
            </div>
            <button
              onClick={togglePreOrderMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-vortx-white text-vortx-black hover:bg-vortx-white/90 font-syne text-[9px] font-bold tracking-wider transition flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              MODE SWITCH
            </button>
          </div>
        </div>

        {/* Filter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 xl:gap-14">
          
          {/* Left Side Sidebar Filters */}
          <aside className="catalog-filters lg:col-span-1 border-b lg:border-b-0 lg:border-r border-vortx-white/10 pb-10 lg:pb-0 lg:pr-10">
            
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-vortx-gray/50" />
              <input 
                type="text"
                placeholder="SEARCH GEAR"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-vortx-dark border border-vortx-white/20 px-3.5 py-2.5 pl-10 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50 uppercase"
              />
            </div>

            {/* Category Filter */}
            <div className="catalog-filter-group">
              <h4 className="font-syne text-xs font-bold tracking-widest text-vortx-white mb-4 uppercase">CATEGORY</h4>
              <div className="space-y-1">
                {['all', 'tops', 'bottoms', 'outerwear'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-xs font-medium tracking-wide text-left transition py-2 pl-3 border-l-2 ${
                      selectedCategory === cat 
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
              <h4 className="font-syne text-xs font-bold tracking-widest text-vortx-white mb-4 uppercase">GENDER</h4>
              <div className="space-y-1">
                {['all', 'men', 'women', 'unisex'].map((gen) => (
                  <button
                    key={gen}
                    onClick={() => setSelectedGender(gen)}
                    className={`block w-full text-xs font-medium tracking-wide text-left transition py-2 pl-3 border-l-2 ${
                      selectedGender === gen 
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
              <h4 className="font-syne text-xs font-bold tracking-widest text-vortx-white mb-4 uppercase">SORT BY</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-vortx-dark border border-vortx-white/20 px-3.5 py-2.5 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-syne font-bold tracking-wide"
              >
                <option value="featured">FEATURED</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
                <option value="newest">NEW RELEASES</option>
              </select>
            </div>

          </aside>

          {/* Right Side Catalog Grid */}
          <div className="lg:col-span-3">
            
            {filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-vortx-white/10 rounded">
                <p className="font-syne text-xs font-bold tracking-widest text-vortx-gray">NO GEAR MATCHES THE SELECTED FILTERS</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedGender('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-5 py-2 border border-vortx-white text-vortx-white text-[10px] font-syne font-bold tracking-widest hover:bg-vortx-white hover:text-vortx-black transition"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const isPreOrder = prod.pre_order_available;
                  const firstVariant = prod.variants?.[0] || { id: prod.id, size: 'M', color: 'Black', stock: 0, sku: '' };
                  const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;

                  return (
                    <div key={prod.id} className="group flex flex-col border border-vortx-white/15 bg-vortx-dark/30 rounded overflow-hidden hover:border-vortx-white/30 transition-all duration-300">
                      {/* Image cover */}
                      <div className="aspect-[4/5] bg-vortx-gray-dark relative overflow-hidden">
                        <img 
                          src={prod.images?.[0]} 
                          alt={prod.name} 
                          className="w-full h-full object-cover grayscale group-hover:scale-102 group-hover:grayscale-0 transition duration-500"
                        />

                        {/* Interactive overlay shortcuts */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
                          <Link 
                            href={`/product/${prod.slug}`}
                            className="p-3 bg-vortx-white text-vortx-black rounded-full hover:scale-105 active:scale-95 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => addToCart({
                              id: prod.id,
                              variantId: firstVariant.id,
                              name: prod.name,
                              price: prod.price,
                              mrp: prod.mrp,
                              size: firstVariant.size,
                              color: firstVariant.color,
                              image: prod.images?.[0] || '',
                              sku: firstVariant.sku,
                              isPreOrder: isPreOrder,
                              preOrderDate: prod.pre_order_date
                            }, 1)}
                            className="p-3 bg-vortx-white text-vortx-black rounded-full hover:scale-105 active:scale-95 transition"
                            title={isPreOrder ? "Place Pre-Order" : "Add to Cart"}
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Drop badge */}
                        {prod.badge && (
                          <span className="absolute top-4 left-4 px-2 py-1 bg-vortx-white text-vortx-black font-syne text-[8px] font-extrabold tracking-wider">
                            {prod.badge}
                          </span>
                        )}

                        {/* Pre-order drop labels */}
                        {isPreOrder && (
                          <span className="absolute bottom-4 right-4 bg-vortx-black text-vortx-white border border-vortx-white/40 font-syne text-[7px] font-bold tracking-widest px-2 py-1 rounded">
                            PRE-ORDER
                          </span>
                        )}
                      </div>

                      {/* Info Panel */}
                      <div className="p-4 flex-grow flex flex-col justify-between border-t border-vortx-white/10 bg-vortx-black/70">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-mono text-vortx-gray uppercase tracking-widest">
                              {prod.gender} | {prod.category}
                            </span>
                            
                            {/* Stock Indicator */}
                            {!isPreOrder && (
                              <span className={`text-[8px] font-bold tracking-wider ${
                                totalStock === 0 
                                  ? 'text-red-500' 
                                  : totalStock < 10 
                                  ? 'text-yellow-400' 
                                  : 'text-vortx-gray'
                              }`}>
                                {totalStock === 0 ? 'OUT OF STOCK' : totalStock < 10 ? `ONLY ${totalStock} LEFT` : 'IN STOCK'}
                              </span>
                            )}
                          </div>
                          
                          <Link href={`/product/${prod.slug}`}>
                            <h3 className="font-syne text-xs font-bold tracking-wider text-vortx-white mt-1 hover:underline truncate">
                              {prod.name.toUpperCase()}
                            </h3>
                          </Link>
                        </div>

                        {/* Pricing details */}
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
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
