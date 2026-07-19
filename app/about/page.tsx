'use client';

import React, { useState } from 'react';
import { Send, Instagram, Smartphone, Mail, Clock, HelpCircle, ChevronDown } from 'lucide-react';
import { logAutomation } from '@/lib/email';

export default function AboutPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    logAutomation('EMAIL', `✉️ Support Lead created: Message from ${name} (${email}): "${message.substring(0, 30)}..."`);
    logAutomation('SYSTEM', `⚙️ Contact query dispatched to queue.`);
    
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  const faqs = [
    {
      q: "How does the Pre-order system work?",
      a: "For limited drop activewear, VORTX allows you to book before stock arrives. Every pre-order has a scheduled ship date (e.g. August 15, 2026). Payments are processed at the time of pre-order, booking your gear in our global production queue."
    },
    {
      q: "What payment gateways are supported?",
      a: "We process payments securely via Razorpay. Supported modes include all Indian Credit/Debit cards, UPI payments, Net Banking from major Indian banks, Mobile Wallets, and Cash on Delivery (COD)."
    },
    {
      q: "What is your return & refund policy?",
      a: "We offer a 7-day hassle-free return and exchange policy on all standard in-stock items. Items must be unworn, unwashed, and in their original packaging. Pre-order collections are final sale but eligible for size exchanges."
    },
    {
      q: "How do I track my order courier status?",
      a: "Once shipped, we send tracking credentials via WhatsApp and Email. You can enter this code in your VORTX Profile Dashboard under the Shiprocket tracking timeline to view real-time shipping updates."
    }
  ];

  return (
    <div className="bg-vortx-black min-h-screen text-vortx-white">
      
      {/* 1. BRAND STORY BANNER */}
      <section className="py-20 border-b border-vortx-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80')] bg-cover bg-center opacity-10 grayscale" />
        <div className="max-w-4xl mx-auto text-center relative z-10 px-4 space-y-4">
          <span className="font-syne text-[8px] font-black tracking-[0.3em] text-vortx-gray uppercase">THE CLAN GENESIS</span>
          <h1 className="font-syne text-4xl sm:text-6xl font-extrabold tracking-wide uppercase leading-tight">
            FOR WARRIORS,<br />NOT WATCHERS.
          </h1>
          <div className="w-16 h-0.5 bg-vortx-white mx-auto my-6" />
          <p className="text-xs sm:text-sm text-vortx-gray leading-relaxed max-w-xl mx-auto font-medium">
            VORTX was founded in 2026 with a single directive: build technical, high-performance athletic apparel that makes no concessions. We don't build for the watch list. We construct armor for hybrid athletes who push boundaries. 
          </p>
        </div>
      </section>

      {/* 2. SPECS & FAQ ACCORDIONS */}
      <section id="faq" className="py-20 border-b border-vortx-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="font-syne text-[8px] font-black tracking-[0.25em] text-vortx-gray uppercase">FAQ CORE</span>
            <h2 className="font-syne text-2xl font-bold tracking-wider uppercase">CLAN SUPPORT</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-vortx-white/10 bg-vortx-dark/30 rounded overflow-hidden glassmorphism"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-syne text-xs font-bold tracking-wider text-vortx-white hover:bg-vortx-white/5 transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-vortx-gray" />
                    {faq.q.toUpperCase()}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-vortx-gray transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 border-t border-vortx-white/10 text-xs text-vortx-gray leading-relaxed font-medium bg-vortx-black/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CONTACT US FORM & DETAILS */}
      <section id="contact" className="py-24 bg-vortx-gray-dark/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Contact Details info panel (5/12) */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <span className="font-syne text-xs font-black tracking-[0.18em] text-vortx-gray uppercase">CONNECT</span>
                <h2 className="font-syne text-4xl font-extrabold tracking-wide uppercase mt-2">WAR ROOM CONTACT</h2>
                <p className="text-base text-vortx-gray mt-4 leading-relaxed max-w-lg">
                  Have questions about fit, pre-order queues, or custom sponsorships? Reach out directly. Our support squad runs Monday through Saturday.
                </p>
              </div>

              <div className="space-y-6 font-mono text-base text-vortx-gray">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded border border-vortx-white/10 flex items-center justify-center text-vortx-white">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1">EMAIL SUPPORT</span>
                    <span>SUPPORT@VORTX.FIT</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded border border-vortx-white/10 flex items-center justify-center text-vortx-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1">WHATSAPP CHAT</span>
                    <span>+91 99999 99999</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded border border-vortx-white/10 flex items-center justify-center text-vortx-white">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1">BUSINESS HOURS</span>
                    <span>MON - SAT, 09:00 - 18:00 IST</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded border border-vortx-white/10 flex items-center justify-center text-vortx-white">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1">INSTAGRAM CLAN</span>
                    <span>@VORTX.FIT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Query Form (7/12) */}
            <div className="lg:col-span-7">
              <div className="p-8 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism">
                
                {submitted ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-10 h-10 border border-vortx-white flex items-center justify-center text-vortx-white rounded-full animate-pulse">
                      ✓
                    </div>
                    <p className="font-syne font-bold tracking-widest text-vortx-white uppercase mt-4">QUERY DISPATCHED</p>
                    <p className="text-xs text-vortx-gray max-w-xs">We will follow up via email within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-syne font-bold tracking-wider text-vortx-gray uppercase mb-3">YOUR NAME</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="ENTER YOUR NAME"
                          className="w-full bg-vortx-black border border-vortx-white/20 px-5 py-4 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50 uppercase"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-syne font-bold tracking-wider text-vortx-gray uppercase mb-3">YOUR EMAIL</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ENTER EMAIL ADDRESS"
                          className="w-full bg-vortx-black border border-vortx-white/20 px-5 py-4 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50 uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-syne font-bold tracking-wider text-vortx-gray uppercase mb-3">MESSAGE QUERY</label>
                      <textarea 
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="ENTER MESSAGE DETAIL"
                        className="w-full bg-vortx-black border border-vortx-white/20 px-5 py-4 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50 uppercase"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 bg-vortx-white text-vortx-black font-syne text-sm font-bold tracking-widest hover:bg-vortx-white/95 transition uppercase flex items-center justify-center gap-2"
                    >
                      <span>SEND DISPATCH</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
