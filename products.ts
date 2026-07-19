// VORTX Product Utility functions

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function getDiscountPercent(price: number, originalPrice: number): number {
  if (!originalPrice) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
