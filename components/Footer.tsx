'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from './StoreContext';
import { logAutomation } from '@/lib/email';
import { ArrowRight, Instagram, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { applyCoupon } = useStore();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Simulate database write & email send
    logAutomation('EMAIL', `✉️ Newsletter Confirmation sent to ${emailInput}. Special 10% coupon WELCOME10 attached.`);
    logAutomation('WHATSAPP', `💬 Broadcast alert: Registered newsletter lead from ${emailInput}.`);
    
    setIsSubscribed(true);
    setEmailInput('');
  };

  const footerLinks = {
    shop: [
      { label: 'All Products', href: '/shop' },
      { label: 'New Arrivals', href: '/shop?filter=new' },
      { label: 'Best Sellers', href: '/shop?filter=best' },
      { label: 'Pre-Orders', href: '/shop?filter=preorder' },
    ],
    support: [
      { label: 'Track Order', href: '/profile#orders' },
      { label: 'Business Support', href: '/about#contact' },
      { label: 'Size Guide & FAQs', href: '/about#faq' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Return & Refund Policy', href: '#' },
    ]
  };

  return (
    <footer className="bg-vortx-black border-t border-vortx-white/10 text-vortx-white font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20">
        
        {/* Top Grid section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          
          {/* Logo & Slogan info */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="group flex items-center gap-3">
              <svg className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 115 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10 18 L 95 18 L 82 38 L 38 25 Z" fill="#E60000" />
                <path d="M 38 38 L 103 58 L 60 90 L 45 68 Z" fill="#E60000" />
              </svg>
              <div className="flex flex-col justify-center">
                <span className="font-syne text-2xl font-extrabold tracking-[0.25em] text-vortx-white">VORTX</span>
                <span className="text-xs font-bold tracking-[0.14em] text-vortx-gray/80 -mt-0.5">FOR WARRIORS, NOT WATCHERS.</span>
              </div>
            </Link>
            <p className="text-base text-vortx-gray leading-relaxed max-w-lg">
              We design and engineer high-performance activewear for the hybrid athlete. VORTX is built on relentless drive, structural minimalism, and absolute performance. 
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com" className="w-8 h-8 rounded-full border border-vortx-white/20 flex items-center justify-center hover:bg-vortx-white hover:text-vortx-black hover:border-vortx-white transition duration-300">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:support@vortx.fit" className="w-8 h-8 rounded-full border border-vortx-white/20 flex items-center justify-center hover:bg-vortx-white hover:text-vortx-black hover:border-vortx-white transition duration-300">
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick links columns */}
          <div>
            <h4 className="font-syne text-base font-bold tracking-widest text-vortx-white mb-8 uppercase">CATALOG</h4>
            <ul className="space-y-5 text-base">
              {footerLinks.shop.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-vortx-gray hover:text-vortx-white transition duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-syne text-base font-bold tracking-widest text-vortx-white mb-8 uppercase">HELP</h4>
            <ul className="space-y-5 text-base">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-vortx-gray hover:text-vortx-white transition duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div>
            <h4 className="font-syne text-base font-bold tracking-widest text-vortx-white mb-8 uppercase">NEWSLETTER</h4>
            <div className="space-y-4">
              <p className="text-base text-vortx-gray leading-relaxed">
                Join the clan. Receive 10% off your first drop.
              </p>
              {isSubscribed ? (
                <div className="border border-vortx-white/20 p-3 bg-vortx-white/5 rounded">
                  <p className="text-[10px] font-mono text-vortx-white uppercase font-bold tracking-wider">
                    SUCCESS. Code WELCOME10 activated.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex border-b border-vortx-white/35 focus-within:border-vortx-white transition pb-1">
                  <input 
                    type="email" 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ENTER YOUR EMAIL" 
                    className="w-full bg-transparent border-none text-base text-vortx-white focus:outline-none placeholder:text-vortx-gray/50 py-2"
                    required
                  />
                  <button type="submit" className="text-vortx-gray hover:text-vortx-white transition pl-2">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Brand statement / Hours info / Copyright */}
        <div className="border-t border-vortx-white/10 pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-vortx-gray font-medium">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> SUPPORT: MON-SAT, 9AM-6PM</span>
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> +91 99999 99999</span>
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> GEAR@VORTX.FIT</span>
          </div>

          <div className="flex flex-col md:items-end gap-3 text-sm text-vortx-gray font-medium">
            <div className="flex gap-4 mb-1">
              {footerLinks.legal.map((link, i) => (
                <Link key={i} href={link.href} className="hover:text-vortx-white transition">
                  {link.label}
                </Link>
              ))}
            </div>
            <p>© {new Date().getFullYear()} VORTX ACTIVEWEAR CO. ALL RIGHTS RESERVED.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
