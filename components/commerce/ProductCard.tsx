'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/products';
import { useStore } from '@/components/StoreContext';

export interface ProductCardVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface ProductCardProduct {
  id: string;
  slug: string;
  name: string;
  images?: string[];
  price: number;
  mrp?: number;
  discount_percent?: number;
  badge?: string;
  category?: string;
  gender?: string;
  pre_order_available?: boolean;
  pre_order_date?: string;
  variants?: ProductCardVariant[];
}

interface ProductCardProps {
  product: ProductCardProduct;
  /** 'default' shows the full hover overlay, badges and stock indicator; 'compact' is a lightweight tile for recommendation rows. */
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useStore();
  const isPreOrder = !!product.pre_order_available;
  const firstVariant = product.variants?.[0];
  const href = `/product/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(
      {
        id: product.id,
        variantId: firstVariant?.id || product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        size: firstVariant?.size || 'M',
        color: firstVariant?.color || 'Black',
        image: product.images?.[0] || '',
        sku: firstVariant?.sku || '',
        isPreOrder,
        preOrderDate: product.pre_order_date,
      },
      1
    );
  };

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group bg-vortx-dark border border-vortx-white/10 overflow-hidden hover:border-vortx-white/30 transition p-3 flex flex-col"
      >
        <div className="aspect-[4/5] bg-vortx-black overflow-hidden mb-3">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 img-hover"
          />
        </div>
        <span className="text-xs font-sans font-semibold text-vortx-white group-hover:underline uppercase truncate">
          {product.name}
        </span>
        <span className="text-xs font-mono text-vortx-gray mt-1 font-semibold">{formatPrice(product.price)}</span>
      </Link>
    );
  }

  const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0;

  // One status label, maximum — badge takes priority over stock state, pre-order takes
  // priority over both. "In stock" is never shown; it's the default, not information.
  const statusLabel = product.badge
    ? { text: product.badge, tone: 'fill' as const }
    : isPreOrder
    ? { text: 'PRE-ORDER', tone: 'outline' as const }
    : totalStock === 0
    ? { text: 'OUT OF STOCK', tone: 'signal' as const }
    : totalStock < 10
    ? { text: `ONLY ${totalStock} LEFT`, tone: 'outline' as const }
    : null;

  return (
    <div className="group relative flex flex-col border border-vortx-white/15 bg-vortx-dark/40 overflow-hidden">
      {/* Image — the Link covers only the image area, so the quick-add button below
          can sit alongside it (not nested inside it) as an independently clickable control. */}
      <div className="aspect-[4/5] bg-vortx-gray-dark relative overflow-hidden">
        <Link href={href} className="absolute inset-0 block">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 img-hover"
          />
        </Link>

        {statusLabel && (
          <span
            className={`absolute top-2 left-2 sm:top-4 sm:left-4 px-2 py-0.5 sm:px-2.5 sm:py-1 font-display text-3xs font-bold tracking-wider pointer-events-none ${
              statusLabel.tone === 'fill'
                ? 'bg-vortx-white text-vortx-black'
                : statusLabel.tone === 'signal'
                ? 'bg-vortx-black text-vortx-red border border-vortx-red/40'
                : 'border border-vortx-white/40 bg-vortx-black text-vortx-white'
            }`}
          >
            {statusLabel.text}
          </span>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={isPreOrder ? `Pre-order ${product.name}` : `Add ${product.name} to cart`}
          title={isPreOrder ? 'Pre-order item' : 'Add to cart'}
          className="absolute bottom-0 left-0 right-0 py-2 sm:py-3 bg-vortx-white text-vortx-black text-3xs sm:text-2xs font-sans font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 sm:gap-2 translate-y-0 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300"
        >
          <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {isPreOrder ? 'Pre-order' : 'Add to cart'}
        </button>
      </div>

      <Link href={href} className="p-3 sm:p-5 flex-1 flex flex-col justify-between border-t border-vortx-white/10 bg-vortx-black/85">
        <div>
          <span className="text-3xs text-vortx-gray font-mono uppercase tracking-widest">
            {[product.gender, product.category].filter(Boolean).join(' · ')}
          </span>
          <h3 className="font-display text-2xs sm:text-xs font-bold tracking-wide text-vortx-white mt-1 group-hover:underline">
            {product.name.toUpperCase()}
          </h3>
        </div>
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5 mt-2 sm:mt-3 font-mono">
          <span className="text-2xs sm:text-xs font-semibold text-vortx-white">{formatPrice(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <>
              <span className="text-3xs sm:text-2xs text-vortx-gray line-through">{formatPrice(product.mrp)}</span>
              <span className="text-3xs sm:text-2xs text-vortx-red font-sans font-semibold">-{product.discount_percent}%</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
