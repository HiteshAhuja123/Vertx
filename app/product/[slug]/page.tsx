import React from 'react';
import { Metadata } from 'next';
import { fetchSupabaseProducts } from '@/lib/supabase';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. DYNAMIC METADATA GENERATOR (FOR OG AND SEARCH INDEXING)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const products = await fetchSupabaseProducts();
  const product = products.find((p: any) => p.slug === slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | VORTX Activewear',
      description: 'The requested activewear drop could not be found.'
    };
  }

  return {
    title: `${product.name} | VORTX`,
    description: product.description,
    openGraph: {
      title: `${product.name} | VORTX Activewear`,
      description: product.description,
      url: `https://vortx.fit/product/${product.slug}`,
      type: 'website',
      images: [
        {
          url: product.images?.[0] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
          width: 800,
          height: 1000,
          alt: product.name,
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const products = await fetchSupabaseProducts();
  const product = products.find((p: any) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // 2. PRODUCT SCHEMA (JSON-LD STRUCTURED DATA)
  const productSchemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [],
    "description": product.description,
    "sku": product.variants?.[0]?.sku || `VX-${product.slug.toUpperCase()}`,
    "offers": {
      "@type": "Offer",
      "url": `https://vortx.fit/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.variants?.some((v: any) => v.stock > 0) 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "VORTX"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "2"
    }
  };

  return (
    <>
      {/* Injected Rich Schema for Google Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemaJsonLd) }}
      />
      
      <ProductClient initialProduct={product} />
    </>
  );
}
