'use client';

import Link from 'next/link';
import { Eye, ShoppingBag } from 'lucide-react';
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
        className="group bg-vortx-dark border border-vortx-white/10 rounded overflow-hidden hover:border-vortx-white/30 transition p-3 flex flex-col"
      >
        <div className="aspect-[4/5] bg-vortx-black rounded overflow-hidden mb-3">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-300"
          />
        </div>
        <span className="text-xs font-sans font-bold text-vortx-white group-hover:underline uppercase truncate">
          {product.name}
        </span>
        <span className="text-xs font-mono text-vortx-gray mt-1 font-bold">{formatPrice(product.price)}</span>
      </Link>
    );
  }

  const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) ?? 0;

  return (
    <div className="group relative flex flex-col border border-vortx-white/15 bg-vortx-dark/40 overflow-hidden card-tilt-hover">
      <Link href={href} className="contents">
        <div className="aspect-[4/5] bg-vortx-gray-dark relative overflow-hidden">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-700"
          />

          {product.badge && (
            <span className="absolute top-4 left-4 px-2.5 py-1 bg-vortx-white text-vortx-black font-syne text-3xs font-extrabold tracking-wider">
              {product.badge}
            </span>
          )}

          {isPreOrder && (
            <span className="absolute bottom-4 right-4 border border-vortx-white/40 bg-vortx-black text-vortx-white font-syne text-3xs font-bold tracking-widest px-2 py-1">
              PRE-ORDER
            </span>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between border-t border-vortx-white/10 bg-vortx-black/85">
          <div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-3xs text-vortx-gray font-mono uppercase tracking-widest">
                {[product.gender, product.category].filter(Boolean).join(' | ')}
              </span>
              {!isPreOrder && (
                <span
                  className={`text-3xs font-bold tracking-wider shrink-0 ${
                    totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-vortx-white/80 font-mono' : 'text-vortx-gray'
                  }`}
                >
                  {totalStock === 0 ? 'OUT OF STOCK' : totalStock < 10 ? `ONLY ${totalStock} LEFT` : 'IN STOCK'}
                </span>
              )}
            </div>
            <h3 className="font-syne text-xs font-bold tracking-wider text-vortx-white mt-1 group-hover:underline">
              {product.name.toUpperCase()}
            </h3>
          </div>
          <div className="flex items-center gap-2.5 mt-3 font-mono">
            <span className="text-xs font-bold text-vortx-white">{formatPrice(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-2xs text-vortx-gray line-through">{formatPrice(product.mrp)}</span>
                <span className="text-2xs text-red-500 font-sans font-bold">-{product.discount_percent}%</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Quick actions overlay — a sibling of the Link (not nested inside it) so the
          buttons stay real, independently clickable controls instead of an <a> inside an <a>. */}
      <div className="absolute inset-x-0 top-0 aspect-[4/5] flex items-center justify-center gap-3 bg-black/40 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300">
        <Link
          href={href}
          aria-label={`View details for ${product.name}`}
          title="View details"
          className="p-3 bg-vortx-white text-vortx-black rounded-full hover:scale-110 active:scale-95 transition btn-lift"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
          title={isPreOrder ? 'Pre-order item' : 'Add to cart'}
          className="p-3 bg-vortx-white text-vortx-black rounded-full hover:scale-110 active:scale-95 transition btn-lift"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
