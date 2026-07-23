'use client';

import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="group flex flex-col border border-vortx-white/10 bg-vortx-dark/40 overflow-hidden relative rounded">
      {/* Target brackets placeholder */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
        <div className="card-target-bracket card-target-top-left opacity-100" />
        <div className="card-target-bracket card-target-top-right opacity-100" />
        <div className="card-target-bracket card-target-bottom-left opacity-100" />
        <div className="card-target-bracket card-target-bottom-right opacity-100" />
      </div>

      {/* Main Image Aspect Box Skeleton */}
      <div className="aspect-[4/5] w-full bg-vortx-black/90 animate-shimmer relative overflow-hidden flex items-center justify-center">
        {/* Center logo badge shimmer */}
        <div className="w-12 h-12 rounded-full border border-vortx-white/10 bg-vortx-white/5 animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-vortx-white/20" />
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between border-t border-vortx-white/10 bg-vortx-black/80 space-y-3">
        <div className="space-y-2">
          {/* Category Skeleton */}
          <div className="h-2.5 w-1/4 rounded bg-vortx-white/10 animate-shimmer" />
          {/* Title Skeleton Line */}
          <div className="h-4 w-4/5 rounded bg-vortx-white/15 animate-shimmer" />
        </div>
        
        {/* Price & Badge Skeleton Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3.5 w-1/3 rounded bg-vortx-white/20 animate-shimmer" />
          <div className="h-3 w-1/5 rounded bg-vortx-white/10 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}
