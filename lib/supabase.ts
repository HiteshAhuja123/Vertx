import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize real Supabase client only if keys are present
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

// ==========================================
// HIGH-FIDELITY MOCK DATABASE FOR LOCAL TESTING
// ==========================================
// Matches the exact tables in our schema.sql to ensure identical behavior.

interface MockProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at: string;
}

interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp?: number;
  discount_percent?: number;
  badge?: string;
  size_guide_url?: string;
  is_in_stock: boolean;
  pre_order_available: boolean;
  pre_order_date?: string;
  created_at: string;
  images: string[];
  variants: {
    id: string;
    size: string;
    color: string;
    stock: number;
    sku: string;
  }[];
}

interface MockAddress {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  created_at: string;
}

interface MockOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  coupon_code?: string;
  shipping_address_id: string;
  tracking_number?: string;
  courier_name?: string;
  tracking_status?: string;
  created_at: string;
  items: {
    id: string;
    product_id: string;
    product_name: string;
    image_url: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
  }[];
  payment?: {
    method: string;
    status: string;
    transaction_id: string;
  };
}

interface MockCoupon {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  valid_until?: string;
}

interface MockWishlist {
  id: string;
  user_id: string;
  product_id: string;
}

interface MockReview {
  id: string;
  user_id: string;
  user_name: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

class MockDatabase {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const data = localStorage.getItem(`vortx_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`vortx_${key}`, JSON.stringify(value));
  }

  // --- Products DB ---
  getProducts(): MockProduct[] {
    const defaultProducts: MockProduct[] = [
      {
        id: 'p1',
        name: "Hybrid Compression Shell",
        slug: "hybrid-compression-shell",
        description: "Engineered for the hybrid athlete who lives between the weight room and the track. The Hybrid Compression Shell delivers elite muscle support, sweat-wicking performance, and a silhouette that moves like a second skin.",
        price: 5499,
        mrp: 6999,
        discount_percent: 21,
        badge: "NEW DROP",
        is_in_stock: true,
        pre_order_available: true,
        pre_order_date: "2026-08-15T00:00:00.000Z",
        created_at: new Date().toISOString(),
        images: [
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=90",
          "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=90"
        ],
        variants: [
          { id: 'v1_m', size: 'M', color: 'Black', stock: 10, sku: 'VX-HYB-COMP-M-BLK' },
          { id: 'v1_l', size: 'L', color: 'Black', stock: 15, sku: 'VX-HYB-COMP-L-BLK' },
          { id: 'v1_xl', size: 'XL', color: 'Black', stock: 5, sku: 'VX-HYB-COMP-XL-BLK' }
        ]
      },
      {
        id: 'p2',
        name: "Phantom Joggers",
        slug: "phantom-joggers",
        description: "The Phantom Joggers redefine what training bottoms can be. Cut with a tailored taper and finished with brushed fleece that's cloud-soft from the first wear, these are built for the athlete who refuses to compromise.",
        price: 4999,
        mrp: 5999,
        discount_percent: 16,
        badge: "BESTSELLER",
        is_in_stock: true,
        pre_order_available: false,
        created_at: new Date().toISOString(),
        images: [
          "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=90"
        ],
        variants: [
          { id: 'v2_m', size: 'M', color: 'Black', stock: 20, sku: 'VX-PHN-JOG-M-BLK' },
          { id: 'v2_l', size: 'L', color: 'Black', stock: 25, sku: 'VX-PHN-JOG-L-BLK' }
        ]
      },
      {
        id: 'p3',
        name: "Apex Performance Tank",
        slug: "apex-performance-tank",
        description: "When intensity peaks, the Apex Performance Tank keeps you cool. Open-mesh panels channel airflow to your core, and zinc-oxide technology eliminates odor even in your hardest sessions.",
        price: 3499,
        is_in_stock: true,
        pre_order_available: true,
        pre_order_date: "2026-09-01T00:00:00.000Z",
        created_at: new Date().toISOString(),
        images: [
          "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&q=90"
        ],
        variants: [
          { id: 'v3_m', size: 'M', color: 'White', stock: 8, sku: 'VX-APX-TNK-M-WHT' },
          { id: 'v3_l', size: 'L', color: 'White', stock: 12, sku: 'VX-APX-TNK-L-WHT' }
        ]
      },
      {
        id: 'p4',
        name: "Shadow Leggings",
        slug: "shadow-leggings",
        description: "Sculpt. Support. Dominate. The Shadow Leggings feature our high-waist compression technology for a defined silhouette from every angle. Squat-proof, sweat-proof, and built to outlast your hardest sessions.",
        price: 4499,
        mrp: 5499,
        discount_percent: 18,
        badge: "BESTSELLER",
        is_in_stock: true,
        pre_order_available: false,
        created_at: new Date().toISOString(),
        images: [
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=90"
        ],
        variants: [
          { id: 'v4_s', size: 'S', color: 'Black', stock: 15, sku: 'VX-SHD-LEG-S-BLK' },
          { id: 'v4_m', size: 'M', color: 'Black', stock: 20, sku: 'VX-SHD-LEG-M-BLK' }
        ]
      },
      {
        id: 'p5',
        name: "Warrior Oversized Tee",
        slug: "warrior-oversized-tee",
        description: "A statement piece for the off-days. Heavyweight ring-spun cotton in an oversized silhouette with VORTX branding. This is how warriors recover.",
        price: 2999,
        badge: "NEW DROP",
        is_in_stock: false,
        pre_order_available: true,
        pre_order_date: "2026-08-20T00:00:00.000Z",
        created_at: new Date().toISOString(),
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=90"
        ],
        variants: [
          { id: 'v5_m', size: 'M', color: 'Black', stock: 0, sku: 'VX-WAR-TEE-M-BLK' },
          { id: 'v5_l', size: 'L', color: 'Black', stock: 0, sku: 'VX-WAR-TEE-L-BLK' }
        ]
      }
    ];
    return this.getStorageItem<MockProduct[]>('products', defaultProducts);
  }

  saveProducts(products: MockProduct[]): void {
    this.setStorageItem('products', products);
  }

  // --- Users & Profiles DB ---
  getCurrentUser(): MockProfile | null {
    return this.getStorageItem<MockProfile | null>('current_user', null);
  }

  setCurrentUser(profile: MockProfile | null): void {
    this.setStorageItem('current_user', profile);
  }

  getProfiles(): MockProfile[] {
    const defaultProfiles: MockProfile[] = [
      {
        id: 'admin-usr',
        email: 'admin@vortx.fit',
        full_name: 'VORTX Admin',
        phone: '+919999999999',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ];
    return this.getStorageItem<MockProfile[]>('profiles', defaultProfiles);
  }

  saveProfiles(profiles: MockProfile[]): void {
    this.setStorageItem('profiles', profiles);
  }

  // --- Addresses ---
  getAddresses(): MockAddress[] {
    return this.getStorageItem<MockAddress[]>('addresses', []);
  }

  saveAddresses(addresses: MockAddress[]): void {
    this.setStorageItem('addresses', addresses);
  }

  // --- Orders ---
  getOrders(): MockOrder[] {
    const defaultOrders: MockOrder[] = [];
    return this.getStorageItem<MockOrder[]>('orders', defaultOrders);
  }

  saveOrders(orders: MockOrder[]): void {
    this.setStorageItem('orders', orders);
  }

  // --- Coupons ---
  getCoupons(): MockCoupon[] {
    const defaultCoupons: MockCoupon[] = [
      { id: 'c1', code: 'WELCOME10', discount_percent: 10, is_active: true }
    ];
    return this.getStorageItem<MockCoupon[]>('coupons', defaultCoupons);
  }

  saveCoupons(coupons: MockCoupon[]): void {
    this.setStorageItem('coupons', coupons);
  }

  // --- Wishlists ---
  getWishlists(): MockWishlist[] {
    return this.getStorageItem<MockWishlist[]>('wishlists', []);
  }

  saveWishlists(wishlists: MockWishlist[]): void {
    this.setStorageItem('wishlists', wishlists);
  }

  // --- Reviews ---
  getReviews(): MockReview[] {
    const defaultReviews: MockReview[] = [
      {
        id: 'r1',
        user_id: 'u1',
        user_name: 'Arjun S.',
        product_id: 'p1',
        rating: 5,
        comment: 'Absolutely elite quality. Wore it to a 5k and then straight to the gym. Zero discomfort.',
        created_at: new Date().toISOString()
      },
      {
        id: 'r2',
        user_id: 'u2',
        user_name: 'Shreya T.',
        product_id: 'p4',
        rating: 5,
        comment: 'These are literally perfect. The waistband does not roll and they are squat proof!',
        created_at: new Date().toISOString()
      }
    ];
    return this.getStorageItem<MockReview[]>('reviews', defaultReviews);
  }

  saveReviews(reviews: MockReview[]): void {
    this.setStorageItem('reviews', reviews);
  }
}

export const mockDb = new MockDatabase();
