'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from './StoreContext';
import { ShoppingBag, Heart, User, LogOut, Menu, X, Trash2, ShieldAlert } from 'lucide-react';
import { formatPrice } from '@/products';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const { 
    user, 
    logout, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    wishlist,
    couponCode,
    discountPercent,
    applyCoupon,
    removeCoupon
  } = useStore();

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = Math.round(cartSubtotal * (discountPercent / 100));
  const shippingThreshold = 3000;
  const shippingFee = cartSubtotal > shippingThreshold || cartSubtotal === 0 ? 0 : 250;
  const cartTotal = cartSubtotal - discountAmount + shippingFee;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    
    setCouponError('');
    const success = applyCoupon(couponInput);
    if (!success) {
      setCouponError('Invalid coupon code');
    } else {
      setCouponInput('');
    }
  };

  const navLinks = [
    { label: 'SHOP', href: '/shop' },
    { label: 'ABOUT US', href: '/about' },
  ];

  return (
    <>
      <header className="sticky top-0 w-full z-40 bg-vortx-black/85 backdrop-blur-md border-b border-vortx-white/10 transition duration-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex flex-col justify-center">
              <span className="font-syne text-lg sm:text-xl md:text-2xl font-extrabold tracking-[0.22em] text-vortx-white transition group-hover:tracking-[0.3em]">
                VORTX
              </span>
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.1em] text-vortx-gray/80 -mt-0.5 whitespace-nowrap">
                WARRIORS, NOT WATCHERS.
              </span>
            </Link>
          </div>

          {/* Nav Menu Desktop */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`font-syne text-sm md:text-base font-bold tracking-widest transition duration-300 hover:text-vortx-white ${
                  pathname === link.href ? 'text-vortx-white' : 'text-vortx-gray'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user?.role === 'admin' && (
              <Link 
                href="/admin"
                className="flex items-center gap-1 font-syne text-xs font-bold tracking-widest text-vortx-white bg-vortx-white/10 px-3 py-1.5 border border-vortx-white/20 rounded hover:bg-vortx-white/20 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                ADMIN PORTAL
              </Link>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* User Access */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/profile" 
                  title="My Profile"
                  className={`text-vortx-gray hover:text-vortx-white transition ${pathname === '/profile' ? 'text-vortx-white' : ''}`}
                >
                  <User className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
                <button 
                  onClick={logout}
                  title="Logout"
                  className="text-vortx-gray hover:text-vortx-white transition"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ) : (
              <Link 
                href="/auth" 
                title="Account Login"
                className={`text-vortx-gray hover:text-vortx-white transition ${pathname === '/auth' ? 'text-vortx-white' : ''}`}
              >
                <User className="w-5 h-5 md:w-5 md:h-5" />
              </Link>
            )}

            {/* Wishlist */}
            <Link 
              href={user ? "/profile#wishlist" : "/auth"} 
              title="My Wishlist"
              className="text-vortx-gray hover:text-vortx-white transition relative"
            >
              <Heart className="w-5 h-5 md:w-5 md:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-vortx-white text-vortx-black text-[7px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
              className="text-vortx-gray hover:text-vortx-white transition relative"
            >
              <ShoppingBag className="w-5 h-5 md:w-5 md:h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-vortx-white text-vortx-black text-[7px] font-bold rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-vortx-gray hover:text-vortx-white transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-vortx-black border-b border-vortx-white/10 px-4 py-6 space-y-4 font-syne text-xs font-bold tracking-widest">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-vortx-gray hover:text-vortx-white py-2"
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link 
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-vortx-white bg-vortx-white/10 px-3 py-2 border border-vortx-white/20 rounded hover:bg-vortx-white/20 transition text-center"
              >
                ADMIN PORTAL
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer Sliding Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-vortx-dark border-l border-vortx-white/20 flex flex-col glassmorphism">
              {/* Cart Header */}
              <div className="px-6 py-5 bg-vortx-gray-dark border-b border-vortx-white/10 flex items-center justify-between">
                <span className="font-syne text-sm font-bold tracking-widest text-vortx-white">YOUR GEAR ({totalItemsCount})</span>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:bg-vortx-white/10 rounded transition text-vortx-gray hover:text-vortx-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <ShoppingBag className="w-12 h-12 text-vortx-gray/40 stroke-[1]" />
                    <p className="font-syne text-xs font-bold tracking-wider text-vortx-gray">YOUR CART IS EMPTY</p>
                    <Link 
                      href="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="inline-block px-6 py-2.5 bg-vortx-white text-vortx-black font-syne text-[10px] font-bold tracking-widest hover:bg-vortx-white/90 active:scale-95 transition"
                    >
                      BROWSE CATALOG
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.variantId} className="flex gap-4 p-3 border border-vortx-white/10 bg-vortx-black/50 rounded">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-20 object-cover border border-vortx-white/10 bg-vortx-dark flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-syne text-[10px] font-bold tracking-wider text-vortx-white truncate mr-2">{item.name.toUpperCase()}</h4>
                            <button 
                              onClick={() => removeFromCart(item.variantId)}
                              className="text-vortx-gray hover:text-vortx-white transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-[10px] text-vortx-gray mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                            <span>SIZE: {item.size}</span>
                            <span>|</span>
                            <span>COLOR: {item.color}</span>
                          </div>
                          {item.isPreOrder && (
                            <span className="inline-block border border-vortx-white/30 text-vortx-white text-[8px] font-bold tracking-widest px-1.5 py-0.5 mt-1">
                              PRE-ORDER (SHIPS {item.preOrderDate ? new Date(item.preOrderDate).toLocaleDateString() : 'LATER'})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-vortx-white/10 rounded overflow-hidden h-7">
                            <button 
                              onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-vortx-white/10 text-xs font-bold transition"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-mono flex items-center justify-center h-7">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-vortx-white/10 text-xs font-bold transition"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-mono text-xs font-bold text-vortx-white">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Footing */}
              {cart.length > 0 && (
                <div className="border-t border-vortx-white/10 px-6 py-5 bg-vortx-gray-dark/50 space-y-4">
                  {/* Coupon section */}
                  {couponCode ? (
                    <div className="flex items-center justify-between text-xs border border-dashed border-vortx-white/20 p-2.5 rounded bg-vortx-white/5">
                      <span className="font-mono text-vortx-white font-bold">CODE: {couponCode} (-{discountPercent}%)</span>
                      <button onClick={removeCoupon} className="text-xs font-bold text-vortx-gray hover:text-vortx-white transition underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="ENTER COUPON (WELCOME10)" 
                        className="flex-1 px-3 py-2.5 bg-vortx-black border border-vortx-white/25 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50 placeholder:font-sans uppercase"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2.5 border border-vortx-white text-vortx-white hover:bg-vortx-white hover:text-vortx-black text-[10px] font-syne font-bold tracking-widest transition duration-300"
                      >
                        APPLY
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-[10px] text-vortx-white font-medium">{couponError}</p>}

                  {/* Pricing Tally */}
                  <div className="space-y-2 text-xs font-medium text-vortx-gray">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono text-vortx-white">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-vortx-white">
                        <span>Discount ({discountPercent}%)</span>
                        <span className="font-mono">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-mono text-vortx-white">
                        {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                      </span>
                    </div>
                    {shippingFee > 0 && (
                      <p className="text-[9px] text-vortx-gray italic -mt-1">
                        Add {formatPrice(shippingThreshold - cartSubtotal)} more to qualify for FREE shipping.
                      </p>
                    )}
                    <div className="flex justify-between border-t border-vortx-white/10 pt-3 text-sm font-bold text-vortx-white">
                      <span>TOTAL</span>
                      <span className="font-mono">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <Link 
                    href={user ? "/checkout" : "/auth?redirect=checkout"}
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full py-3.5 bg-vortx-white text-vortx-black font-syne text-[11px] font-bold tracking-widest hover:bg-vortx-white/90 active:scale-95 transition text-center shadow-lg hover:shadow-vortx-white/10"
                  >
                    PROCEED TO CHECKOUT
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
