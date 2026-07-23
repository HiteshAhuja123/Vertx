-- VORTX Database Schema Configuration
-- To be run in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. ADDRESSES Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing')),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India' NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CATEGORIES Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    mrp NUMERIC CHECK (mrp >= price),
    discount_percent INTEGER DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    badge TEXT, -- 'NEW DROP', 'BESTSELLER', 'SALE', 'LIMITED'
    size_guide_url TEXT,
    is_in_stock BOOLEAN DEFAULT TRUE NOT NULL,
    pre_order_available BOOLEAN DEFAULT FALSE NOT NULL,
    pre_order_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. PRODUCT VARIANTS Table (Sizes and Colors stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PRODUCT IMAGES Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. WISHLIST Table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 8. COUPONS Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    coupon_code TEXT,
    shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    tracking_number TEXT,
    courier_name TEXT,
    tracking_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. ORDER ITEMS Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0)
);

-- 11. PAYMENTS Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    transaction_id TEXT,
    method TEXT NOT NULL CHECK (method IN ('razorpay', 'cod', 'upi', 'card', 'netbanking')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. REVIEWS Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- --- Row Level Security (RLS) Setup ---
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses Policies
CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- General read-only access for customers on catalog items
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- Customer access policies
CREATE POLICY "Users can view and insert their own wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin CRUD Access (For users with role = 'admin' in profiles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin and public management write policies for catalog
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage product variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- Profile Sync Trigger: Create a profile whenever a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    CASE 
      WHEN new.email = 'admin@vortx.fit' THEN 'admin' -- Hardcoded seed admin for testing
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --- SEED DATA ---

-- Coupons
INSERT INTO public.coupons (code, discount_percent, is_active)
VALUES ('WELCOME10', 10, true)
ON CONFLICT (code) DO NOTHING;

-- Categories
INSERT INTO public.categories (id, name, slug)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Tops', 'tops'),
    ('c2222222-2222-2222-2222-222222222222', 'Bottoms', 'bottoms'),
    ('c3333333-3333-3333-3333-333333333333', 'Outerwear', 'outerwear')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (id, name, slug, description, price, mrp, discount_percent, badge, is_in_stock, pre_order_available, pre_order_date)
VALUES 
    (
        'a1111111-1111-1111-1111-111111111111', 
        'Hybrid Compression Shell', 
        'hybrid-compression-shell', 
        'Engineered for the hybrid athlete who lives between the weight room and the track. The Hybrid Compression Shell delivers elite muscle support, sweat-wicking performance, and a silhouette that moves like a second skin.', 
        5499, 6999, 21, 'NEW DROP', true, true, '2026-08-15T00:00:00Z'
    ),
    (
        'a2222222-2222-2222-2222-222222222222', 
        'Phantom Joggers', 
        'phantom-joggers', 
        'The Phantom Joggers redefine what training bottoms can be. Cut with a tailored taper and finished with brushed fleece that is cloud-soft from the first wear, these are built for the athlete who refuses to compromise.', 
        4999, 5999, 16, 'BESTSELLER', true, false, null
    ),
    (
        'a3333333-3333-3333-3333-333333333333', 
        'Apex Performance Tank', 
        'apex-performance-tank', 
        'When intensity peaks, the Apex Performance Tank keeps you cool. Open-mesh panels channel airflow to your core, and zinc-oxide technology eliminates odor even in your hardest sessions.', 
        3499, 3499, 0, 'LIMITED', true, true, '2026-09-01T00:00:00Z'
    ),
    (
        'a4444444-4444-4444-4444-444444444444', 
        'Shadow Leggings', 
        'shadow-leggings', 
        'Sculpt. Support. Dominate. The Shadow Leggings feature our high-waist compression technology for a defined silhouette from every angle. Squat-proof, sweat-proof, and built to outlast your hardest sessions.', 
        4499, 5499, 18, 'BESTSELLER', true, false, null
    ),
    (
        'a5555555-5555-5555-5555-555555555555', 
        'Warrior Oversized Tee', 
        'warrior-oversized-tee', 
        'A statement piece for the off-days. Heavyweight ring-spun cotton in an oversized silhouette with VORTX branding. This is how warriors recover.', 
        2999, 2999, 0, 'NEW DROP', false, true, '2026-08-20T00:00:00Z'
    )
ON CONFLICT (id) DO NOTHING;

-- Variants
INSERT INTO public.product_variants (product_id, size, color, stock, sku)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'M', 'Black', 10, 'VX-HYB-COMP-M-BLK'),
    ('a1111111-1111-1111-1111-111111111111', 'L', 'Black', 15, 'VX-HYB-COMP-L-BLK'),
    ('a1111111-1111-1111-1111-111111111111', 'XL', 'Black', 5, 'VX-HYB-COMP-XL-BLK'),
    ('a2222222-2222-2222-2222-222222222222', 'M', 'Black', 20, 'VX-PHN-JOG-M-BLK'),
    ('a2222222-2222-2222-2222-222222222222', 'L', 'Black', 25, 'VX-PHN-JOG-L-BLK'),
    ('a3333333-3333-3333-3333-333333333333', 'M', 'White', 8, 'VX-APX-TNK-M-WHT'),
    ('a3333333-3333-3333-3333-333333333333', 'L', 'White', 12, 'VX-APX-TNK-L-WHT'),
    ('a4444444-4444-4444-4444-444444444444', 'S', 'Black', 15, 'VX-SHD-LEG-S-BLK'),
    ('a4444444-4444-4444-4444-444444444444', 'M', 'Black', 20, 'VX-SHD-LEG-M-BLK'),
    ('a5555555-5555-5555-5555-555555555555', 'M', 'Black', 0, 'VX-WAR-TEE-M-BLK'),
    ('a5555555-5555-5555-5555-555555555555', 'L', 'Black', 0, 'VX-WAR-TEE-L-BLK')
ON CONFLICT (sku) DO NOTHING;

-- Product Images
INSERT INTO public.product_images (product_id, image_url, display_order)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 0),
    ('a1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', 1),
    ('a2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', 0),
    ('a3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&q=80', 0),
    ('a4444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', 0),
    ('a5555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 0)
ON CONFLICT (id) DO NOTHING;

-- --- SUPABASE STORAGE CONFIGURATION & RLS POLICIES ---

-- 1. Create the 'product-images' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public viewing of stored images
CREATE POLICY "Public Read Access on product-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- 3. Allow uploads into product-images bucket
CREATE POLICY "Public Upload Access on product-images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- 4. Allow updates and deletes on product-images bucket
CREATE POLICY "Public Update Access on product-images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Public Delete Access on product-images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');

