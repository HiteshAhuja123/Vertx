import { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AutomationLogger from '@/components/AutomationLogger';

export const metadata: Metadata = {
  title: 'VORTX | FOR WARRIORS, NOT WATCHERS.',
  description: 'Ultra-premium, minimal technical activewear engineered for the hybrid athlete. Shop high-performance jackets, compression tops, and runners.',
  keywords: 'vortx, activewear, hybrid athlete, gymwear, lululemon, gymshark, represent, premium gym gear, compression shirt, runners, fitness wear',
  openGraph: {
    title: 'VORTX | FOR WARRIORS, NOT WATCHERS.',
    description: 'High-performance luxury activewear designed for hybrid athletes. Built to perform, styled to command.',
    type: 'website',
    url: 'https://vortx.fit',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-screen bg-vortx-black text-vortx-white flex flex-col antialiased">
        <StoreProvider>
          <Suspense fallback={<div className="h-20 bg-vortx-black border-b border-vortx-white/10 w-full" />}>
            <Navbar />
          </Suspense>
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
          <AutomationLogger />
        </StoreProvider>
      </body>
    </html>
  );
}
