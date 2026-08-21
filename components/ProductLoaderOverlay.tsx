'use client';

import React from 'react';
import { useStore } from './StoreContext';

export function ProductLoaderOverlay() {
  const { isProductLoading } = useStore();

  if (!isProductLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-vortx-black/90 backdrop-blur-sm flex flex-col items-center justify-center">
      {/* Top progress bar — the one loading signal, no glow */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-vortx-white/10 overflow-hidden z-[101]">
        <div className="h-full bg-vortx-white animate-pulse w-full" />
      </div>

      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="w-10 h-10 border-2 border-t-vortx-white border-vortx-white/20 rounded-full animate-spin" />
        <p className="text-2xs font-mono font-medium tracking-widest text-vortx-gray uppercase">Loading</p>
      </div>
    </div>
  );
}
