'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockDb } from '@/lib/supabase';
import { useStore } from '@/components/StoreContext';
import { Star, ShieldCheck, Truck, Layers, Check, Ruler, Info, X } from 'lucide-react';
import { formatPrice } from '@/products';
import { logAutomation } from '@/lib/email';

interface ProductClientProps {
  initialProduct: any;
}

export default function ProductClient({ initialProduct }: ProductClientProps) {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useStore();
  
  const [product, setProduct] = useState<any>(initialProduct);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [isPreOrder, setIsPreOrder] = useState(initialProduct?.pre_order_available || false);

  // Layout states
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  // Zoom Ref and hover positioning
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!initialProduct) return;
    
    // Set default variant selectors
    if (initialProduct.variants && initialProduct.variants.length > 0) {
      setSelectedSize(initialProduct.variants[0].size);
      setSelectedColor(initialProduct.variants[0].color);
    }

    // Load related items
    const prods = mockDb.getProducts();
    const related = prods.filter((p: any) => p.id !== initialProduct.id).slice(0, 3);
    setRelatedItems(related);
  }, [initialProduct]);

  if (!product) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-vortx-black">
        <div className="w-12 h-12 border-2 border-t-vortx-white border-vortx-white/20 rounded-full animate-spin" />
      </div>
    );
  }

  // Dynamically extract unique sizes and colors from variants
  const sizes = Array.from(new Set(product.variants?.map((v: any) => v.size) || [])) as string[];
  const colors = Array.from(new Set(product.variants?.map((v: any) => v.color) || [])) as string[];

  // Dynamic, context-aware details based on product type
  const getProductSpecs = () => {
    const nameLower = product.name.toLowerCase();
    const categoryLower = (product.category || '').toLowerCase();
    
    if (nameLower.includes('tee') || nameLower.includes('t-shirt')) {
      return {
        fabric: '100% Premium Ring-Spun Cotton',
        specs: {
          'Fit': 'Oversized Boxy Fit',
          'Fabric weight': '240 GSM Heavyweight Knit',
          'Breathability': 'Natural Cotton Airflow',
          'Stretch': 'Standard Comfort Stretch',
          'Treatment': 'Preshrunk Silicone Wash'
        }
      };
    }
    
    if (nameLower.includes('compression') || nameLower.includes('shell')) {
      return {
        fabric: '82% Nylon / 18% Spandex Technical Blend',
        specs: {
          'Fit': 'Athletic Contoured Compression Fit',
          'Fabric weight': '240 GSM Support Knit',
          'Breathability': 'Zonal Mesh Aeration',
          'Stretch': '4-Way Mechanical Elasticity',
          'Odour Control': 'Anti-Microbial Zinc Shield'
        }
      };
    }

    if (nameLower.includes('tank') || nameLower.includes('singlet')) {
      return {
        fabric: '90% Recycled Polyester / 10% Elastane',
        specs: {
          'Fit': 'Athletic Slim Fit',
          'Fabric weight': '160 GSM Ultra-Lightweight Mesh',
          'Breathability': 'Laser Cut Ventilation Zones',
          'Stretch': '4-Way Elastic Fluidity',
          'Odour Control': 'Polygiene Anti-Odor Technology'
        }
      };
    }
    
    if (categoryLower.includes('bottoms') || nameLower.includes('joggers') || nameLower.includes('leggings')) {
      return {
        fabric: '78% Polyester / 22% Spandex Brushed Microfiber',
        specs: {
          'Fit': 'Tapered Tonal Athletic Fit',
          'Fabric weight': '280 GSM Double-Brushed Fleece',
          'Breathability': 'Thermal Moisture-Wicking Channels',
          'Stretch': 'High-Elasticity Shape Retention',
          'Features': 'Secure Zip Pocketing & Ergonomic Seams'
        }
      };
    }

    // Default premium fallback
    return {
      fabric: 'Hybrid technical fiber blend',
      specs: {
        'Fit': 'Athletic Standard Fit',
        'Fabric weight': '220 GSM Performance Knit',
        'Breathability': 'Moisture-Wicking Micro-Weave',
        'Stretch': 'Comfort Stretch Flex',
        'Treatment': 'Quick-Dry Finish'
      }
    };
  };

  const specsDetails = getProductSpecs();
  const fabricInfo = product.fabric || specsDetails.fabric;
  const specsInfo = product.specs || specsDetails.specs;
  const shippingInfo = product.shipping || 'Standard delivery in India. Free on cart orders above ₹3,000. Express shipping available at checkout.';

  // Find matching variant
  const currentVariant = product.variants?.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  ) || product.variants?.[0];

  const stockAvailable = currentVariant ? currentVariant.stock : 0;

  // Zoom events handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !zoomImageRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    zoomImageRef.current.style.transformOrigin = `${x}% ${y}%`;
    zoomImageRef.current.style.transform = 'scale(2)';
  };

  const handleMouseLeave = () => {
    if (!zoomImageRef.current) return;
    zoomImageRef.current.style.transform = 'scale(1)';
  };

  // Add order trigger
  const handleAddToCart = () => {
    const activeSize = selectedSize || sizes[0] || 'M';
    if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }
    
    addToCart({
      id: product.id,
      variantId: currentVariant?.id || product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      size: activeSize,
      color: selectedColor || colors[0] || 'Black',
      image: product.images?.[0] || '',
      sku: currentVariant?.sku || '',
      isPreOrder: isPreOrder,
      preOrderDate: product.pre_order_date
    }, qty);
  };

  // Estimate delivery calculations
  const getDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div className="py-12 bg-vortx-black min-h-screen text-vortx-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="text-xs sm:text-sm text-vortx-gray uppercase tracking-wider font-sans mb-8">
          <Link href="/" className="hover:text-vortx-white">HOME</Link> /{' '}
          <Link href="/shop" className="hover:text-vortx-white">SHOP</Link> /{' '}
          <span className="text-vortx-white font-bold">{product.name}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* 1. PRODUCT GALLERY (Columns: 7/12) */}
          <div className="lg:col-span-7 flex flex-col gap-4 lg:sticky lg:top-24">
            
            {/* Main Visual box */}
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="aspect-[4/5] max-h-[500px] sm:max-h-[550px] lg:max-h-[calc(100vh-180px)] w-full bg-vortx-dark border border-vortx-white/10 relative overflow-hidden rounded group"
            >
              {/* Standard Zoom Image cover with smooth transform-origin transition */}
              <img 
                ref={zoomImageRef}
                src={product.images?.[activeImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover grayscale pointer-events-none"
                style={{
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.1s ease-out'
                }}
              />

              {/* Badge */}
              {product.badge && (
                <span className="absolute top-4 left-4 px-2 py-1 bg-vortx-white text-vortx-black font-sans text-[10px] font-bold tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Gallery Row */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square bg-vortx-dark border rounded overflow-hidden transition ${
                      activeImageIndex === idx ? 'border-vortx-white' : 'border-vortx-white/10 hover:border-vortx-white/30'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover grayscale hover:grayscale-0 transition" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* 2. SPECIFICATION PANEL (Columns: 5/12) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Title / Badges */}
            <div className="space-y-2">
              <span className="text-xs font-sans text-vortx-gray uppercase tracking-[0.2em] font-bold">
                {product.category} | {product.gender}
              </span>
              <h1 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide text-vortx-white uppercase leading-tight break-words">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 pt-1">
                {/* Rating average */}
                <div className="flex items-center gap-1 text-vortx-white">
                  <Star className="w-3.5 h-3.5 fill-current text-vortx-white" />
                  <span className="text-xs font-mono font-bold">5.0</span>
                  <span className="text-vortx-gray text-xs font-medium">(2 Reviews)</span>
                </div>

                {/* Preorder Switch */}
                {product.pre_order_available && (
                  <div className="flex items-center border border-vortx-white/20 rounded overflow-hidden text-xs font-bold font-sans tracking-wider">
                    <button
                      onClick={() => setIsPreOrder(false)}
                      disabled={!product.is_in_stock}
                      className={`px-3 py-1.5 transition ${
                        !isPreOrder && product.is_in_stock
                          ? 'bg-vortx-white text-vortx-black' 
                          : 'text-vortx-gray hover:text-vortx-white'
                      }`}
                    >
                      IN STOCK
                    </button>
                    <button
                      onClick={() => setIsPreOrder(true)}
                      className={`px-3 py-1.5 transition ${
                        isPreOrder 
                          ? 'bg-vortx-white text-vortx-black' 
                          : 'text-vortx-gray hover:text-vortx-white'
                      }`}
                    >
                      PRE-ORDER
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price Tally */}
            <div className="flex items-baseline gap-3 border-b border-vortx-white/10 pb-4 font-mono">
              <span className="text-2xl font-bold text-vortx-white">{formatPrice(product.price)}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-sm text-vortx-gray line-through">{formatPrice(product.mrp)}</span>
                  <span className="text-xs text-emerald-400 font-sans font-bold">-{product.discount_percent}%</span>
                </>
              )}
            </div>

            {/* Selector Options */}
            <div className="space-y-4">
              
              {/* Color Select */}
              {colors.length > 0 && (
                <div>
                  <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-gray uppercase mb-2">COLOR</h4>
                  <div className="flex gap-2.5">
                    {colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border font-mono text-xs font-bold tracking-wider rounded transition ${
                          selectedColor === color 
                            ? 'border-vortx-white bg-vortx-white text-vortx-black' 
                            : 'border-vortx-white/20 text-vortx-gray hover:border-vortx-white hover:text-vortx-white'
                        }`}
                      >
                        {color.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Select */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-sans text-xs font-bold tracking-wider text-vortx-gray uppercase">SIZE</h4>
                    <button 
                      onClick={() => setShowSizeGuide(true)}
                      className="flex items-center gap-1 text-xs text-vortx-gray hover:text-vortx-white font-medium font-sans"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 border font-mono text-xs font-bold rounded flex items-center justify-center transition ${
                          selectedSize === size 
                            ? 'border-vortx-white bg-vortx-white text-vortx-black' 
                            : 'border-vortx-white/20 text-vortx-gray hover:border-vortx-white hover:text-vortx-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock notification labels */}
              {!isPreOrder && (
                <div className="text-xs text-vortx-gray mt-2 flex items-center gap-1.5 font-sans">
                  <span className={`h-2.5 w-2.5 rounded-full inline-block ${
                    stockAvailable === 0 ? 'bg-red-500' : stockAvailable < 5 ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
                  }`} />
                  {stockAvailable === 0 
                    ? 'Current variant is out of stock. Toggle pre-order to book.' 
                    : stockAvailable < 5 
                    ? `Running low! Only ${stockAvailable} items remaining in this size.` 
                    : `${stockAvailable} units in stock & ready to ship.`}
                </div>
              )}
            </div>

            {/* Qty Selector and CTA Add Buttons */}
            <div className="space-y-4 pt-4 border-t border-vortx-white/10">
              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* Qty edit box */}
                <div className="flex items-center justify-between border border-vortx-white/20 rounded h-12 w-full sm:w-auto">
                  <button 
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    className="w-12 h-full flex items-center justify-center text-sm font-bold hover:bg-vortx-white/10 transition"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-xs">{qty}</span>
                  <button 
                    onClick={() => setQty(prev => prev + 1)}
                    className="w-12 h-full flex items-center justify-center text-sm font-bold hover:bg-vortx-white/10 transition"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={!isPreOrder && stockAvailable === 0}
                  className="w-full sm:flex-1 py-3.5 bg-vortx-white text-vortx-black font-sans text-xs sm:text-sm font-bold tracking-widest hover:bg-vortx-white/90 disabled:bg-vortx-white/25 disabled:text-vortx-gray active:scale-98 transition flex items-center justify-center min-h-[48px]"
                >
                  {isPreOrder ? 'PRE-ORDER NOW' : 'ADD TO CART'}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Full-Width Lower Content Section */}
        <div className="space-y-8 mt-12">
          
          {/* Shipping / Support assurances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs sm:text-sm font-sans font-medium text-vortx-gray bg-vortx-dark/60 border border-vortx-white/10 rounded-lg p-6">
            <div className="space-y-1 py-2 sm:py-0">
              <Truck className="w-5 h-5 mx-auto mb-1.5 text-vortx-white" />
              <span className="block text-vortx-white uppercase font-bold tracking-wide">EST. DELIVERY</span>
              <span className="text-[11px] sm:text-xs text-vortx-gray">{isPreOrder ? 'Starts Aug 15' : getDeliveryDate()}</span>
            </div>
            <div className="space-y-1 py-2 sm:py-0 border-y sm:border-y-0 sm:border-x border-vortx-white/10">
              <ShieldCheck className="w-5 h-5 mx-auto mb-1.5 text-vortx-white" />
              <span className="block text-vortx-white uppercase font-bold tracking-wide">SECURED GATEWAY</span>
              <span className="text-[11px] sm:text-xs text-vortx-gray">SSL Encrypted Checkout</span>
            </div>
            <div className="space-y-1 py-2 sm:py-0">
              <Layers className="w-5 h-5 mx-auto mb-1.5 text-vortx-white" />
              <span className="block text-vortx-white uppercase font-bold tracking-wide">WARRIOR FIT</span>
              <span className="text-[11px] sm:text-xs text-vortx-gray">Sweat-proof Tech Weave</span>
            </div>
          </div>

          {/* Details tabs section */}
          <div className="bg-vortx-dark/40 border border-vortx-white/10 rounded-lg p-6 sm:p-8 space-y-6">
            <div className="flex gap-2 border-b border-vortx-white/10 text-xs sm:text-sm font-sans font-bold tracking-widest">
              {['details', 'specs', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 px-6 transition ${
                    activeTab === tab ? 'border-b-2 border-vortx-white text-vortx-white' : 'text-vortx-gray hover:text-vortx-white'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="text-sm sm:text-base text-vortx-gray leading-relaxed font-medium">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p>{product.description}</p>
                  <p className="text-xs sm:text-sm text-vortx-white mt-4 font-semibold">FABRIC CONTENT:</p>
                  <p className="italic">{fabricInfo}</p>
                </div>
              )}
              {activeTab === 'specs' && (
                <ul className="space-y-2 font-mono text-xs sm:text-sm max-w-2xl">
                  {Object.entries(specsInfo).map(([key, val]: any) => (
                    <li key={key} className="flex justify-between border-b border-vortx-white/10 pb-1.5">
                      <span className="uppercase text-vortx-white/60">{key}</span>
                      <span className="text-vortx-white font-medium">{val}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'shipping' && (
                <p>{shippingInfo}</p>
              )}
            </div>
          </div>

          {/* Related Items Row */}
          {relatedItems && relatedItems.length > 0 && (
            <div className="pt-8 border-t border-vortx-white/10">
              <h3 className="text-xs font-sans font-bold tracking-[0.2em] text-vortx-gray uppercase mb-6">
                RECOMMENDED GEAR // COMPLETE THE LOOK
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedItems.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    href={`/product/${rel.slug}`}
                    className="group bg-vortx-dark border border-vortx-white/10 rounded overflow-hidden hover:border-vortx-white/30 transition p-3 flex flex-col"
                  >
                    <div className="aspect-[4/5] bg-vortx-black rounded overflow-hidden mb-3">
                      <img 
                        src={rel.images?.[0]} 
                        alt={rel.name} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-300" 
                      />
                    </div>
                    <span className="text-xs font-sans font-bold text-vortx-white group-hover:underline uppercase truncate">
                      {rel.name}
                    </span>
                    <span className="text-xs font-mono text-vortx-gray mt-1 font-bold">
                      {formatPrice(rel.price)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* SIZING GUIDE MODAL OVERLAY */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)} />
            <div className="relative w-full max-w-lg bg-vortx-dark border border-vortx-white/20 p-6 glassmorphism rounded shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-vortx-white/10 pb-4 mb-4">
                <span className="font-sans text-sm sm:text-base font-bold tracking-wider text-vortx-white">VORTX WARRIOR SIZE CHART</span>
                <button onClick={() => setShowSizeGuide(false)} className="text-vortx-gray hover:text-vortx-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <table className="w-full text-center text-xs font-mono leading-loose">
                <thead>
                  <tr className="border-b border-vortx-white/15 text-vortx-white/60 uppercase">
                    <th className="py-2 text-left">SIZE</th>
                    <th>CHEST (INCH)</th>
                    <th>WAIST (INCH)</th>
                    <th>HIPS (INCH)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vortx-white/5">
                  <tr>
                    <td className="py-2.5 font-bold text-left">XS</td>
                    <td>32 - 34</td>
                    <td>26 - 28</td>
                    <td>32 - 34</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-left">S</td>
                    <td>35 - 37</td>
                    <td>29 - 31</td>
                    <td>35 - 37</td>
                  </tr>
                  <tr className="bg-vortx-white/5">
                    <td className="py-2.5 font-bold text-left">M</td>
                    <td>38 - 40</td>
                    <td>32 - 34</td>
                    <td>38 - 40</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-left">L</td>
                    <td>41 - 43</td>
                    <td>35 - 37</td>
                    <td>41 - 43</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-left">XL</td>
                    <td>44 - 46</td>
                    <td>38 - 40</td>
                    <td>44 - 46</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 p-3 bg-vortx-white/5 rounded border border-vortx-white/10 flex items-start gap-2.5 text-xs text-vortx-gray leading-normal">
                <Info className="w-4 h-4 text-vortx-white flex-shrink-0 mt-0.5" />
                <p>
                  Measurements correspond to body dimensions. Compression shirts fit close to body; if you prefer a standard fit, we recommend sizing up.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
