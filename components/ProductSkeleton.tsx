'use client';

import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-vortx-dark border border-vortx-white/10 rounded overflow-hidden flex flex-col p-3 space-y-3">
      {/* Main Image Aspect Box Skeleton */}
      <div className="aspect-[4/5] w-full rounded bg-vortx-black/80 animate-shimmer relative overflow-hidden flex items-center justify-center">
        {/* Subtle center logo badge shimmer placeholder */}
        <div className="w-10 h-10 rounded-full bg-vortx-white/5 animate-pulse" />
      </div>
      
      {/* Category / Badge Skeleton */}
      <div className="h-3 w-1/3 rounded bg-vortx-white/10 animate-shimmer" />
      
      {/* Title Skeleton Line */}
      <div className="h-4 w-3/4 rounded bg-vortx-white/15 animate-shimmer" />
      
      {/* Price & Rating Skeleton Row */}
      <div className="flex items-center justify-between pt-2 mt-auto">
        <div className="h-4 w-1/3 rounded bg-vortx-white/20 animate-shimmer" />
        <div className="h-3 w-1/4 rounded bg-vortx-white/10 animate-shimmer" />
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
