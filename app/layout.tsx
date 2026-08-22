import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Work_Sans, Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/components/StoreContext';
import { ProductLoaderOverlay } from '@/components/ProductLoaderOverlay';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-worksans',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plexmono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VORTX | FOR WARRIORS, NOT WATCHERS.',
  description: 'Ultra-premium, minimal technical activewear engineered for the hybrid athlete. Shop high-performance jackets, compression tops, and runners.',
  keywords: 'vortx, activewear, hybrid athlete, gymwear, lululemon, gymshark, represent, premium gym gear, compression shirt, runners, fitness wear',
  metadataBase: new URL('https://vortx.fit'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VORTX | FOR WARRIORS, NOT WATCHERS.',
    description: 'High-performance luxury activewear designed for hybrid athletes. Built to perform, styled to command.',
    type: 'website',
    url: 'https://vortx.fit',
    siteName: 'VORTX',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'VORTX Hybrid Activewear Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VORTX | FOR WARRIORS, NOT WATCHERS.',
    description: 'Ultra-premium, minimal technical activewear engineered for the hybrid athlete.',
    images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: 'Hitesh Ahuja', url: 'https://hitesh-portfolio-website.vercel.app/' }],
  creator: 'Hitesh Ahuja',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full scroll-smooth ${workSans.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-vortx-black text-vortx-white flex flex-col antialiased font-sans">
        <StoreProvider>
          <ProductLoaderOverlay />
          <Suspense fallback={<div className="h-20 bg-vortx-black border-b border-vortx-white/10 w-full" />}>
            <Navbar />
          </Suspense>
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
