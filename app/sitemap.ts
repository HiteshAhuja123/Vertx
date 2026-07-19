import { MetadataRoute } from 'next';
import { mockDb } from '@/lib/supabase';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vortx.fit';
  
  // Static pages
  const staticRoutes = ['', '/shop', '/about', '/auth', '/profile'].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
  
  // Dynamic products list
  const products = mockDb.getProducts().map(prod => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
  return [...staticRoutes, ...products];
}
