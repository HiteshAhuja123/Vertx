import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Single flag to toggle mock vs live Supabase data
// Set NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local to force mock (localStorage) mode
const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Initialize real Supabase client only if keys are present AND mock mode is off
export const isSupabaseConfigured = !useMockData && !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

// ==========================================
// HIGH-FIDELITY MOCK DATABASE FOR LOCAL TESTING
// ==========================================
// Matches the exact tables in our schema.sql to ensure identical behavior.
// Only used when isSupabaseConfigured === false (no Supabase keys).

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
          "/products/hybrid-compression-shell.png"
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
          "/products/phantom-joggers.png"
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
          "/products/warrior-oversized-tee.png"
        ],
        variants: [
          { id: 'v5_m', size: 'M', color: 'Black', stock: 0, sku: 'VX-WAR-TEE-M-BLK' },
          { id: 'v5_l', size: 'L', color: 'Black', stock: 0, sku: 'VX-WAR-TEE-L-BLK' }
        ]
      },
      {
        id: 'p6',
        name: "Stealth 2-in-1 Shorts",
        slug: "stealth-2-in-1-shorts",
        description: "Lightweight four-way stretch outer shorts with a secure compression liner, side slits, and zip pockets for unrestricted training sessions.",
        price: 3999,
        mrp: 4799,
        discount_percent: 17,
        badge: "NEW DROP",
        is_in_stock: true,
        pre_order_available: false,
        created_at: new Date().toISOString(),
        images: [
          "/products/stealth-2-in-1-shorts.png"
        ],
        variants: [
          { id: 'v6_m', size: 'M', color: 'Black', stock: 14, sku: 'VX-STL-SHT-M-BLK' },
          { id: 'v6_l', size: 'L', color: 'Black', stock: 18, sku: 'VX-STL-SHT-L-BLK' },
          { id: 'v6_xl', size: 'XL', color: 'Black', stock: 8, sku: 'VX-STL-SHT-XL-BLK' }
        ]
      }
    ];
    const savedProducts = this.getStorageItem<MockProduct[] | null>('products', null);
    if (!savedProducts) return defaultProducts;

    // Keep locally-created products, while refreshing the built-in catalog assets
    // and adding any newly released default products for existing local sessions.
    const defaultsById = new Map(defaultProducts.map((product) => [product.id, product]));
    const refreshedProducts = savedProducts.map((product) => {
      const currentDefault = defaultsById.get(product.id);
      return currentDefault ? { ...product, images: currentDefault.images } : product;
    });
    const savedIds = new Set(savedProducts.map((product) => product.id));
    return [...refreshedProducts, ...defaultProducts.filter((product) => !savedIds.has(product.id))];
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

// ==========================================
// LIVE SUPABASE DATABASE INTEGRATION (REAL DB)
// ==========================================

// ---- AUTH FUNCTIONS ----

export async function supabaseSignUp(
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<{ user: any; error: any }> {
  if (!isSupabaseConfigured) {
    // Mock fallback
    const profiles = mockDb.getProfiles();
    if (profiles.some(p => p.email === email)) {
      return { user: null, error: { message: 'An account with this email already exists.' } };
    }
    const newProfile: MockProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      full_name: fullName,
      phone,
      role: email === 'admin@vortx.fit' ? 'admin' : 'customer',
      created_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    mockDb.saveProfiles(profiles);
    mockDb.setCurrentUser(newProfile);
    return { user: newProfile, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      }
    }
  });

  if (error) return { user: null, error };

  // Update the profile with phone (trigger creates profile, but phone comes from metadata)
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ phone, full_name: fullName })
      .eq('id', data.user.id);
  }

  return { user: data.user, error: null };
}

export async function supabaseLogin(
  email: string,
  password: string
): Promise<{ user: any; error: any }> {
  if (!isSupabaseConfigured) {
    // Mock fallback
    const profiles = mockDb.getProfiles();
    let found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    // Auto-provision admin account
    if (!found && (email.toLowerCase() === 'admin@vortx.fit' || email.toLowerCase().includes('admin'))) {
      found = {
        id: 'usr_admin_' + Math.random().toString(36).substr(2, 6),
        email,
        full_name: 'VORTX Administrator',
        phone: '+919999999999',
        role: 'admin',
        created_at: new Date().toISOString()
      };
      profiles.push(found);
      mockDb.saveProfiles(profiles);
    }

    if (!found) {
      return { user: null, error: { message: 'Invalid email credentials.' } };
    }

    mockDb.setCurrentUser(found);
    return { user: found, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

export async function supabaseLogout(): Promise<void> {
  if (!isSupabaseConfigured) {
    mockDb.setCurrentUser(null);
    return;
  }
  await supabase.auth.signOut();
}

export async function supabaseGetSession(): Promise<{ user: any; session: any } | null> {
  if (!isSupabaseConfigured) {
    const user = mockDb.getCurrentUser();
    return user ? { user, session: { user } } : null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session ? { user: session.user, session } : null;
}

export function supabaseOnAuthStateChange(callback: (event: string, session: any) => void) {
  if (!isSupabaseConfigured) {
    // No-op for mock — session is managed synchronously
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}

// ---- PROFILE FUNCTIONS ----

export async function fetchProfile(userId: string): Promise<any | null> {
  if (!isSupabaseConfigured) {
    const profiles = mockDb.getProfiles();
    return profiles.find(p => p.id === userId) || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('fetchProfile error:', error);
    return null;
  }
  return data;
}

// ---- ADDRESS FUNCTIONS ----

export async function fetchAddresses(userId: string): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return mockDb.getAddresses().filter(a => a.user_id === userId);
  }

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchAddresses error:', error);
    return [];
  }
  return data || [];
}

export async function createAddress(userId: string, addressData: {
  type: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}): Promise<any> {
  if (!isSupabaseConfigured) {
    const addresses = mockDb.getAddresses();
    const newAddr = {
      id: 'addr_' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      ...addressData,
      created_at: new Date().toISOString()
    };
    addresses.push(newAddr as any);
    mockDb.saveAddresses(addresses);
    return newAddr;
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      ...addressData
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAddressById(addressId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const addresses = mockDb.getAddresses().filter(a => a.id !== addressId);
    mockDb.saveAddresses(addresses);
    return;
  }

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId);

  if (error) throw error;
}

// ---- ORDER FUNCTIONS ----

export async function fetchOrders(userId: string): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return mockDb.getOrders().filter(o => o.user_id === userId);
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      payments(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchOrders error:', error);
    return [];
  }
  return data || [];
}

export async function fetchAllOrders(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return mockDb.getOrders();
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      payments(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchAllOrders error:', error);
    return [];
  }
  return data || [];
}

export async function createOrderInDb(
  userId: string,
  orderData: {
    order_number: string;
    status: string;
    total_amount: number;
    coupon_code?: string;
    shipping_address_id: string;
  },
  items: {
    product_name: string;
    image_url: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
    product_variant_id?: string;
  }[],
  paymentData: {
    method: string;
    status: string;
    amount: number;
    transaction_id?: string;
  }
): Promise<any> {
  if (!isSupabaseConfigured) {
    const orders = mockDb.getOrders();
    const newOrder = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      ...orderData,
      tracking_number: '',
      courier_name: '',
      tracking_status: 'Order Placed',
      created_at: new Date().toISOString(),
      items: items.map(i => ({
        id: 'oi_' + Math.random(),
        product_id: i.product_variant_id || '',
        product_name: i.product_name,
        image_url: i.image_url,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unit_price: i.unit_price
      })),
      payment: {
        method: paymentData.method,
        status: paymentData.status,
        transaction_id: paymentData.transaction_id || ''
      }
    };
    orders.push(newOrder as any);
    mockDb.saveOrders(orders);
    return newOrder;
  }

  // 1. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderData.order_number,
      status: orderData.status,
      total_amount: orderData.total_amount,
      coupon_code: orderData.coupon_code || null,
      shipping_address_id: orderData.shipping_address_id
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Insert order items with denormalized product info
  const orderItems = items.map(i => ({
    order_id: order.id,
    product_variant_id: i.product_variant_id || null,
    product_name: i.product_name,
    image_url: i.image_url,
    size: i.size,
    color: i.color,
    quantity: i.quantity,
    unit_price: i.unit_price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Order items insert error:', itemsError);
  }

  // 3. Insert payment
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      method: paymentData.method,
      status: paymentData.status,
      amount: paymentData.amount,
      transaction_id: paymentData.transaction_id || null
    });

  if (paymentError) {
    console.error('Payment insert error:', paymentError);
  }

  return order;
}

export async function updateOrderStatusInDb(
  orderId: string,
  status: string,
  courierName?: string,
  trackingNumber?: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    const orders = mockDb.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;
    orders[idx].status = status as any;
    if (courierName) orders[idx].courier_name = courierName;
    if (trackingNumber) orders[idx].tracking_number = trackingNumber;
    if (status === 'shipped') orders[idx].tracking_status = 'In Transit';
    else if (status === 'delivered') orders[idx].tracking_status = 'Delivered';
    mockDb.saveOrders(orders);
    return;
  }

  const updateData: any = { status };
  if (courierName) updateData.courier_name = courierName;
  if (trackingNumber) updateData.tracking_number = trackingNumber;
  if (status === 'shipped') updateData.tracking_status = 'In Transit';
  else if (status === 'delivered') updateData.tracking_status = 'Delivered';

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) throw error;
}

// ---- COUPON FUNCTIONS ----

export async function fetchCoupons(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return mockDb.getCoupons().filter(c => c.is_active);
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('fetchCoupons error:', error);
    return [];
  }
  return data || [];
}

export async function fetchAllCouponsAdmin(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return mockDb.getCoupons();
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchAllCouponsAdmin error:', error);
    return [];
  }
  return data || [];
}

export async function createSupabaseCoupon(code: string, discountPercent: number, validUntil?: string): Promise<any> {
  const cleanCode = code.toUpperCase().trim();
  if (!isSupabaseConfigured) {
    const list = mockDb.getCoupons();
    const newCoupon = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      code: cleanCode,
      discount_percent: discountPercent,
      is_active: true,
      valid_until: validUntil || undefined
    };
    list.push(newCoupon);
    mockDb.saveCoupons(list);
    return newCoupon;
  }

  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: cleanCode,
      discount_percent: discountPercent,
      is_active: true,
      valid_until: validUntil || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSupabaseCoupon(couponId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const list = mockDb.getCoupons().filter(c => c.id !== couponId);
    mockDb.saveCoupons(list);
    return;
  }

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId);

  if (error) throw error;
}

export async function toggleSupabaseCouponStatus(couponId: string, currentStatus: boolean): Promise<boolean> {
  const newStatus = !currentStatus;
  if (!isSupabaseConfigured) {
    const list = mockDb.getCoupons().map(c => c.id === couponId ? { ...c, is_active: newStatus } : c);
    mockDb.saveCoupons(list);
    return newStatus;
  }

  const { error } = await supabase
    .from('coupons')
    .update({ is_active: newStatus })
    .eq('id', couponId);

  if (error) throw error;
  return newStatus;
}

export async function validateCoupon(code: string): Promise<{ valid: boolean; discount_percent: number }> {
  if (!isSupabaseConfigured) {
    const coupons = mockDb.getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
    return found
      ? { valid: true, discount_percent: found.discount_percent }
      : { valid: false, discount_percent: 0 };
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', code)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false, discount_percent: 0 };
  }

  // Check expiry
  if (data.valid_until && new Date(data.valid_until) < new Date()) {
    return { valid: false, discount_percent: 0 };
  }

  return { valid: true, discount_percent: data.discount_percent };
}

// ---- WISHLIST FUNCTIONS ----

export async function fetchWishlist(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return mockDb.getWishlists()
      .filter(w => w.user_id === userId)
      .map(w => w.product_id);
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    console.error('fetchWishlist error:', error);
    return [];
  }
  return (data || []).map((w: any) => w.product_id);
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const list = mockDb.getWishlists();
    list.push({ id: 'w_' + Math.random(), user_id: userId, product_id: productId });
    mockDb.saveWishlists(list);
    return;
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, product_id: productId });

  // Ignore duplicate errors (UNIQUE constraint)
  if (error && !error.message?.includes('duplicate')) {
    throw error;
  }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const list = mockDb.getWishlists().filter(w => !(w.user_id === userId && w.product_id === productId));
    mockDb.saveWishlists(list);
    return;
  }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) throw error;
}

// ---- REVIEW FUNCTIONS ----

export async function fetchReviews(productId?: string): Promise<any[]> {
  if (!isSupabaseConfigured) {
    const reviews = mockDb.getReviews();
    return productId ? reviews.filter(r => r.product_id === productId) : reviews;
  }

  let query = supabase
    .from('reviews')
    .select(`
      *,
      profiles:user_id(full_name)
    `)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('fetchReviews error:', error);
    return [];
  }

  // Map to include user_name from joined profiles
  return (data || []).map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    user_name: r.profiles?.full_name || 'Anonymous',
    product_id: r.product_id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at
  }));
}

export async function createReview(
  userId: string,
  productId: string,
  rating: number,
  comment: string
): Promise<any> {
  if (!isSupabaseConfigured) {
    const reviews = mockDb.getReviews();
    const profiles = mockDb.getProfiles();
    const userProfile = profiles.find(p => p.id === userId);
    const newReview = {
      id: 'rev_' + Math.random(),
      user_id: userId,
      user_name: userProfile?.full_name || 'Anonymous',
      product_id: productId,
      rating,
      comment,
      created_at: new Date().toISOString()
    };
    reviews.push(newReview);
    mockDb.saveReviews(reviews);
    return newReview;
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: userId,
      product_id: productId,
      rating,
      comment
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---- PRODUCT FUNCTIONS (EXISTING - PRESERVED) ----

export async function fetchSupabaseProducts(): Promise<MockProduct[]> {
  if (!isSupabaseConfigured) return mockDb.getProducts();

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(image_url, display_order),
        product_variants(id, size, color, stock, sku)
      `)
      .order('created_at', { ascending: false });

    if (error || !products) {
      console.error('Fetch Supabase error:', error);
      return [];
    }

    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: Number(p.price),
      mrp: Number(p.mrp || p.price),
      discount_percent: p.discount_percent || 0,
      badge: p.badge || '',
      is_in_stock: p.is_in_stock,
      pre_order_available: p.pre_order_available,
      pre_order_date: p.pre_order_date,
      created_at: p.created_at,
      images: (p.product_images || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((img: any) => img.image_url),
      variants: (p.product_variants || []).map((v: any) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
        sku: v.sku
      }))
    }));
  } catch (err) {
    console.error('Fetch Supabase error:', err);
    return [];
  }
}

export async function createSupabaseProduct(productData: {
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discount_percent: number;
  badge: string;
  category?: string;
  gender?: string;
  is_in_stock: boolean;
  pre_order_available: boolean;
  pre_order_date?: string | null;
  images: string[];
  variants: { size: string; color: string; stock: number; sku: string }[];
}): Promise<any> {
  if (!isSupabaseConfigured) {
    const currentProds = mockDb.getProducts();
    const newProd: MockProduct = {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      ...productData,
      pre_order_date: productData.pre_order_date || undefined,
      created_at: new Date().toISOString(),
      variants: productData.variants.map((v, i) => ({
        id: `v_${i}`,
        ...v
      }))
    };
    mockDb.saveProducts([...currentProds, newProd]);
    return newProd;
  }

  // 1. Insert into products table
  const { data: product, error: pError } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      price: productData.price,
      mrp: productData.mrp,
      discount_percent: productData.discount_percent,
      badge: productData.badge,
      is_in_stock: productData.is_in_stock,
      pre_order_available: productData.pre_order_available,
      pre_order_date: productData.pre_order_date || null
    })
    .select()
    .single();

  if (pError) throw pError;

  // 2. Insert variants
  if (productData.variants && productData.variants.length > 0) {
    const variantRows = productData.variants.map((v) => ({
      product_id: product.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      sku: v.sku
    }));
    const { error: vError } = await supabase.from('product_variants').insert(variantRows);
    if (vError) throw vError;
  }

  // 3. Insert images
  if (productData.images && productData.images.length > 0) {
    const imageRows = productData.images.map((imgUrl, idx) => ({
      product_id: product.id,
      image_url: imgUrl,
      display_order: idx
    }));
    const { error: imgError } = await supabase.from('product_images').insert(imageRows);
    if (imgError) throw imgError;
  }

  return product;
}

export async function deleteSupabaseProduct(productId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const next = mockDb.getProducts().filter(p => p.id !== productId);
    mockDb.saveProducts(next);
    return;
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

export async function toggleSupabaseProductVisibility(productId: string, currentStatus: boolean): Promise<boolean> {
  const newStatus = !currentStatus;
  if (!isSupabaseConfigured) {
    const prods = mockDb.getProducts();
    const updated = prods.map(p => p.id === productId ? { ...p, is_in_stock: newStatus } : p);
    mockDb.saveProducts(updated);
    return newStatus;
  }

  const { error } = await supabase
    .from('products')
    .update({ is_in_stock: newStatus })
    .eq('id', productId);

  if (error) throw error;
  return newStatus;
}
