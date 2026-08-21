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
      q: "How does the pre-order system work?",
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
      a: "Once shipped, we send tracking credentials via WhatsApp and Email. You can enter this code in your VORTX profile under the order tracking timeline to view real-time shipping updates."
    }
  ];

  return (
    <div className="bg-vortx-black min-h-screen text-vortx-white">

      {/* 1. BRAND STORY BANNER */}
      <section className="py-20 sm:py-28 border-b border-vortx-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80')] bg-cover bg-center opacity-15 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-vortx-black via-vortx-black/60 to-vortx-black/30" />
        <div className="max-w-3xl mx-auto text-center relative z-10 px-4 space-y-5">
          <span className="font-mono text-2xs font-semibold tracking-[0.2em] text-vortx-gray uppercase">Our Story</span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-wide leading-tight text-vortx-white">
            For Warriors,<br />Not Watchers.
          </h1>
          <p className="text-base sm:text-lg text-vortx-gray leading-relaxed max-w-2xl mx-auto">
            VORTX was founded in 2026 with a single directive: build technical, high-performance athletic apparel that makes no concessions. We don't design for the watch list — we build for the ones who train.
          </p>
        </div>
      </section>

      {/* 2. FAQ */}
      <section id="faq" className="py-16 sm:py-24 border-b border-vortx-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="font-mono text-2xs font-semibold tracking-[0.2em] text-vortx-gray uppercase">FAQ</span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wide">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-vortx-white/10 bg-vortx-dark/30 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-sans text-sm font-semibold text-vortx-white hover:bg-vortx-white/5 transition"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-vortx-gray flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-vortx-gray flex-shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 border-t border-vortx-white/10 text-sm text-vortx-gray leading-relaxed bg-vortx-black/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CONTACT */}
      <section id="contact" className="py-16 sm:py-24 bg-vortx-gray-dark/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Contact Details info panel (5/12) */}
            <div className="lg:col-span-5 space-y-10">
              <div>
                <span className="font-mono text-2xs font-semibold tracking-[0.15em] text-vortx-gray uppercase">Connect</span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-wide mt-2">Get in Touch</h2>
                <p className="text-base text-vortx-gray mt-4 leading-relaxed max-w-lg">
                  Questions about fit, pre-order timelines, or a wholesale enquiry? Our team responds Monday through Saturday.
                </p>
              </div>

              <div className="space-y-6 text-base text-vortx-gray">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-vortx-white/10 flex items-center justify-center text-vortx-white flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1 uppercase tracking-wide">Email support</span>
                    <span className="font-mono text-sm">support@vortx.fit</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-vortx-white/10 flex items-center justify-center text-vortx-white flex-shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1 uppercase tracking-wide">WhatsApp</span>
                    <span className="font-mono text-sm">+91 99999 99999</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-vortx-white/10 flex items-center justify-center text-vortx-white flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1 uppercase tracking-wide">Business hours</span>
                    <span className="font-mono text-sm">Mon–Sat, 09:00–18:00 IST</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-vortx-white/10 flex items-center justify-center text-vortx-white flex-shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-sans font-bold text-vortx-white block mb-1 uppercase tracking-wide">Instagram</span>
                    <span className="font-mono text-sm">@vortx.fit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Query Form (7/12) */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 border border-vortx-white/10 bg-vortx-dark/30">

                {submitted ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border border-vortx-white flex items-center justify-center text-vortx-white">
                      ✓
                    </div>
                    <p className="font-display font-bold tracking-wide text-vortx-white mt-2">Message sent</p>
                    <p className="text-xs text-vortx-gray max-w-xs">We'll follow up by email within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-3">Your name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          className="w-full bg-vortx-black border border-vortx-white/20 px-5 py-4 text-base text-vortx-white focus:outline-none focus:border-vortx-white placeholder:text-vortx-gray/50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-3">Your email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full bg-vortx-black border border-vortx-white/20 px-5 py-4 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-3">Message</label>
                      <textarea
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="How can we help?"
                        className="w-full bg-vortx-black border border-vortx-white/20 px-5 py-4 text-base text-vortx-white focus:outline-none focus:border-vortx-white placeholder:text-vortx-gray/50"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-vortx-white text-vortx-black font-sans text-sm font-bold tracking-widest hover:bg-vortx-white/90 transition uppercase flex items-center justify-center gap-2"
                    >
                      <span>Send Message</span>
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
