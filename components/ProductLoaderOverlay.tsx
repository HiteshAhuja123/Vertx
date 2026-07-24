'use client';

import React from 'react';
import { useStore } from './StoreContext';

export function ProductLoaderOverlay() {
  const { isProductLoading } = useStore();

  if (!isProductLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-vortx-black/85 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* Top glowing progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-vortx-white/10 overflow-hidden z-[101]">
        <div className="h-full bg-vortx-white animate-pulse w-full shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
      </div>

      {/* Center Spinner Badge */}
      <div className="flex flex-col items-center space-y-4 p-8 bg-vortx-dark/90 border border-vortx-white/20 rounded-xl glassmorphism text-center max-w-xs shadow-2xl">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-2 border-t-vortx-white border-vortx-white/20 rounded-full animate-spin" />
          <div className="absolute w-5 h-5 bg-vortx-white rounded-full animate-ping opacity-30" />
        </div>
        <div className="space-y-1 font-mono">
          <p className="text-xs font-bold tracking-widest text-vortx-white uppercase">LOADING GEAR...</p>
          <p className="text-[9px] text-vortx-gray uppercase tracking-widest animate-pulse">FOR WARRIORS, NOT WATCHERS</p>
        </div>
      </div>
    </div>
  );
}
