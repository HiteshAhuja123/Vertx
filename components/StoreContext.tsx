'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  isSupabaseConfigured,
  supabaseSignUp,
  supabaseLogin,
  supabaseLogout,
  supabaseGetSession,
  supabaseOnAuthStateChange,
  fetchProfile,
  fetchAddresses,
  createAddress as createAddressInDb,
  deleteAddressById,
  fetchOrders,
  fetchAllOrders,
  createOrderInDb,
  updateOrderStatusInDb,
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  validateCoupon,
  mockDb
} from '@/lib/supabase';
import { 
  logAutomation, 
  triggerWelcomeAutomation, 
  triggerOrderCompletedAutomation, 
  triggerShippingAutomation, 
  triggerDeliveryAutomation 
} from '@/lib/email';

export interface CartItem {
  id: string; // product ID
  variantId: string;
  name: string;
  price: number;
  mrp?: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
  sku: string;
  isPreOrder: boolean;
  preOrderDate?: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  couponCode?: string;
  shippingAddress: Address;
  trackingNumber?: string;
  courierName?: string;
  trackingStatus?: string;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    method: 'razorpay' | 'cod' | 'upi' | 'card' | 'netbanking';
    status: 'success' | 'failed' | 'pending';
    transactionId: string;
  };
}

// Map database orders to frontend Order format
// Handles both mock format (items embedded) and Supabase format (order_items + addresses joined)
export const mapDbOrders = (dbOrders: any[], dbAddresses?: any[]): Order[] => {
  return dbOrders.map(o => {
    // Determine address - for Supabase, we pass addresses separately
    let addr: any;
    if (dbAddresses) {
      addr = dbAddresses.find((a: any) => a.id === o.shipping_address_id);
    }
    if (!addr) {
      addr = {
        id: o.shipping_address_id || 'addr_unknown',
        type: 'shipping',
        address_line1: 'Unknown Address',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: ''
      };
    }

    // Map items - handle both mock format and Supabase joined format
    const rawItems = o.items || o.order_items || [];
    const mappedItems = rawItems.map((i: any) => ({
      id: i.id,
      productId: i.product_id || i.product_variant_id || '',
      productName: i.product_name || '',
      imageUrl: i.image_url || '',
      size: i.size || '',
      color: i.color || '',
      quantity: i.quantity,
      unitPrice: Number(i.unit_price)
    }));

    // Map payment - handle both mock format and Supabase joined format
    let payment: Order['payment'] | undefined;
    if (o.payment) {
      payment = {
        method: o.payment.method,
        status: o.payment.status,
        transactionId: o.payment.transaction_id || o.payment.transactionId || ''
      };
    } else if (o.payments && o.payments.length > 0) {
      const p = o.payments[0];
      payment = {
        method: p.method,
        status: p.status,
        transactionId: p.transaction_id || ''
      };
    }

    return {
      id: o.id,
      userId: o.user_id,
      orderNumber: o.order_number,
      status: o.status,
      totalAmount: Number(o.total_amount),
      couponCode: o.coupon_code,
      shippingAddress: {
        id: addr.id,
        type: addr.type || 'shipping',
        addressLine1: addr.address_line1 || '',
        addressLine2: addr.address_line2 || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postal_code || '',
        country: addr.country || '',
        phone: addr.phone || ''
      },
      trackingNumber: o.tracking_number,
      courierName: o.courier_name,
      trackingStatus: o.tracking_status,
      createdAt: o.created_at,
      items: mappedItems,
      payment
    };
  });
};

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface StoreContextType {
  user: UserProfile | null;
  addresses: Address[];
  orders: Order[];
  allOrders: Order[]; // For Admin View
  cart: CartItem[];
  wishlist: string[]; // List of product IDs
  preOrderMode: boolean; // Global Catalog toggle for testing (In Stock vs Pre-order)
  authLoading: boolean; // Loading state during auth operations
  
  // Product Navigation Loader
  isProductLoading: boolean;
  navigateToProduct: (slug: string) => void;
  stopProductLoading: () => void;
  
  // Auth Functions
  signup: (fullName: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Cart Functions
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Coupon
  couponCode: string;
  discountPercent: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Wishlist Functions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Address Functions
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;

  // Order Functions
  placeOrder: (method: Required<Order>['payment']['method'], addressId: string) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status'], courierName?: string, trackingNumber?: string) => Promise<void>;
  
  // Mode & Theme Toggles
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  togglePreOrderMode: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [preOrderMode, setPreOrderMode] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const navigateToProduct = (slug: string) => {
    setIsProductLoading(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    router.push(`/product/${slug}`);
  };

  const stopProductLoading = () => {
    setIsProductLoading(false);
  };

  // Helper: Load user data (addresses, orders, wishlist) after authentication
  const loadUserData = async (profile: UserProfile) => {
    try {
      // Load addresses
      const rawAddresses = await fetchAddresses(profile.id);
      setAddresses(rawAddresses.map((a: any) => ({
        id: a.id,
        type: a.type || 'shipping',
        addressLine1: a.address_line1 || '',
        addressLine2: a.address_line2 || '',
        city: a.city || '',
        state: a.state || '',
        postalCode: a.postal_code || '',
        country: a.country || '',
        phone: a.phone || ''
      })));

      // Load user orders
      const rawOrders = await fetchOrders(profile.id);
      const rawAllAddresses = await fetchAddresses(profile.id);
      const mappedOrders = mapDbOrders(rawOrders, rawAllAddresses);
      setOrders(mappedOrders);

      // Load all orders for admin
      if (profile.role === 'admin') {
        const rawAll = await fetchAllOrders();
        setAllOrders(mapDbOrders(rawAll));
      }

      // Load wishlist
      const wishlistIds = await fetchWishlist(profile.id);
      setWishlist(wishlistIds);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Initialize: Load theme, check auth session, listen for auth changes
  useEffect(() => {
    // Theme
    const savedTheme = (localStorage.getItem('vortx_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // Cart from localStorage (kept in localStorage — industry standard)
    const localCart = localStorage.getItem('vortx_cart');
    if (localCart) setCart(JSON.parse(localCart));

    // Check existing session
    const initAuth = async () => {
      try {
        const session = await supabaseGetSession();
        if (session?.user) {
          const userId = isSupabaseConfigured ? session.user.id : session.user.id;
          const profile = await fetchProfile(userId);
          if (profile) {
            const userProfile: UserProfile = {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name || '',
              phone: profile.phone || '',
              role: profile.role || 'customer',
              createdAt: profile.created_at || ''
            };
            setUser(userProfile);
            await loadUserData(userProfile);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes (handles token refresh, sign out from other tabs, etc.)
    const { data: { subscription } } = supabaseOnAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setAddresses([]);
        setOrders([]);
        setAllOrders([]);
        setWishlist([]);
        setCouponCode('');
        setDiscountPercent(0);
      } else if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name || '',
            phone: profile.phone || '',
            role: profile.role || 'customer',
            createdAt: profile.created_at || ''
          };
          setUser(userProfile);
          await loadUserData(userProfile);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save cart on change
  useEffect(() => {
    localStorage.setItem('vortx_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth Operations
  const signup = async (fullName: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    logAutomation('SYSTEM', `⚙️ Signup attempt for ${email}`);

    const { user: newUser, error } = await supabaseSignUp(email, password, fullName, phone);
    
    if (error) {
      logAutomation('SYSTEM', `❌ Signup Failed: ${error.message}`);
      return { success: false, error: error.message };
    }

    if (newUser) {
      // For mock mode, set user immediately
      if (!isSupabaseConfigured) {
        const userProfile: UserProfile = {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name || fullName,
          phone: newUser.phone || phone,
          role: newUser.role || 'customer',
          createdAt: newUser.created_at || new Date().toISOString()
        };
        setUser(userProfile);
        await loadUserData(userProfile);
      }
      // For Supabase, the onAuthStateChange listener handles setting user

      logAutomation('SYSTEM', `⚙️ Account Created for ${fullName} (${email})`);
      await triggerWelcomeAutomation(email, fullName, phone);
    }

    return { success: true };
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { user: authUser, error } = await supabaseLogin(email, password);

    if (error) {
      logAutomation('SYSTEM', `❌ Login Failed: ${error.message}`);
      return { success: false, error: error.message };
    }

    if (authUser) {
      // Mock mode resolves the session synchronously; live Supabase mode is
      // handled by the onAuthStateChange listener below instead.
      if (!isSupabaseConfigured) {
        const userProfile: UserProfile = {
          id: authUser.id,
          email: authUser.email,
          fullName: authUser.full_name || authUser.fullName,
          phone: authUser.phone,
          role: authUser.role || 'customer',
          createdAt: authUser.created_at || new Date().toISOString()
        };
        setUser(userProfile);
        await loadUserData(userProfile);
      }
      // For Supabase, the onAuthStateChange listener handles setting user

      logAutomation('SYSTEM', `⚙️ User Logged In: ${authUser.email}`);
      logAutomation('WHATSAPP', `💬 OTP Verification Code sent to mobile: "Your VORTX login code is ${Math.floor(Math.random() * 900000 + 100000)}. Valid for 10 mins."`);
    }

    return { success: true };
  };

  const logout = async () => {
    await supabaseLogout();
    setUser(null);
    setAddresses([]);
    setOrders([]);
    setAllOrders([]);
    setWishlist([]);
    setCouponCode('');
    setDiscountPercent(0);
    logAutomation('SYSTEM', `⚙️ User logged out.`);
  };

  // Cart Operations
  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.variantId === item.variantId);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, { ...item, quantity }];
    });
    logAutomation('SYSTEM', `⚙️ Cart Item Added: ${item.name} (${item.size}/${item.color}) x ${quantity}`);
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prev => prev.map(item => item.variantId === variantId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscountPercent(0);
  };

  // Coupon — now async since it queries Supabase
  const applyCoupon = async (code: string): Promise<boolean> => {
    const result = await validateCoupon(code);
    if (result.valid) {
      setCouponCode(code.toUpperCase());
      setDiscountPercent(result.discount_percent);
      logAutomation('SYSTEM', `⚙️ Promo Applied: ${code.toUpperCase()} (${result.discount_percent}% OFF)`);
      return true;
    }
    logAutomation('SYSTEM', `❌ Invalid Coupon: "${code}" is expired or incorrect.`);
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  // Wishlist — now async since it uses Supabase
  const toggleWishlist = async (productId: string) => {
    if (!user) {
      logAutomation('SYSTEM', `⚠️ Wishlist action failed: User must log in first.`);
      return;
    }
    
    const isCurrentlyInWishlist = wishlist.includes(productId);
    
    try {
      if (isCurrentlyInWishlist) {
        await removeFromWishlist(user.id, productId);
        setWishlist(prev => prev.filter(id => id !== productId));
        logAutomation('SYSTEM', `⚙️ Wishlist Item Removed: Product ${productId}`);
      } else {
        await addToWishlist(user.id, productId);
        setWishlist(prev => [...prev, productId]);
        logAutomation('SYSTEM', `⚙️ Wishlist Item Added: Product ${productId}`);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Address Operations — now async
  const addAddress = async (addr: Omit<Address, 'id'>) => {
    if (!user) return;

    try {
      const newAddr = await createAddressInDb(user.id, {
        type: addr.type,
        address_line1: addr.addressLine1,
        address_line2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postalCode,
        country: addr.country,
        phone: addr.phone
      });

      const mappedAddr: Address = {
        id: newAddr.id,
        type: newAddr.type || addr.type,
        addressLine1: newAddr.address_line1 || addr.addressLine1,
        addressLine2: newAddr.address_line2 || addr.addressLine2,
        city: newAddr.city || addr.city,
        state: newAddr.state || addr.state,
        postalCode: newAddr.postal_code || addr.postalCode,
        country: newAddr.country || addr.country,
        phone: newAddr.phone || addr.phone
      };

      setAddresses(prev => [...prev, mappedAddr]);
      logAutomation('SYSTEM', `⚙️ Address saved successfully under type: ${addr.type}`);
    } catch (err) {
      console.error('Add address error:', err);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteAddressById(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  // Orders — now async with Supabase
  const placeOrder = async (method: Required<Order>['payment']['method'], addressId: string): Promise<string> => {
    if (!user) throw new Error('Authentication required');
    const selectedAddress = addresses.find(a => a.id === addressId);
    if (!selectedAddress) throw new Error('Address not found');

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = Math.round(subtotal * (discountPercent / 100));
    const shipping = subtotal > 3000 ? 0 : 250;
    const total = subtotal - discount + shipping;

    const orderNumber = 'VX-' + Math.floor(Math.random() * 900000 + 100000);

    try {
      const orderResult = await createOrderInDb(
        user.id,
        {
          order_number: orderNumber,
          status: method === 'cod' ? 'pending' : 'paid',
          total_amount: total,
          coupon_code: couponCode || undefined,
          shipping_address_id: addressId
        },
        cart.map(c => ({
          product_name: c.name,
          image_url: c.image,
          size: c.size,
          color: c.color,
          quantity: c.quantity,
          unit_price: c.price,
          product_variant_id: c.variantId
        })),
        {
          method,
          status: method === 'cod' ? 'pending' : 'success',
          amount: total,
          transaction_id: method === 'cod' ? '' : 'TXN-' + Math.floor(Math.random() * 900000 + 100000)
        }
      );

      // Build local Order object for immediate UI update
      const newOrder: Order = {
        id: orderResult.id,
        userId: user.id,
        orderNumber,
        status: method === 'cod' ? 'pending' : 'paid',
        totalAmount: total,
        couponCode: couponCode || undefined,
        shippingAddress: selectedAddress,
        createdAt: orderResult.created_at || new Date().toISOString(),
        items: cart.map(c => ({
          id: 'oi_' + Math.random(),
          productId: c.id,
          productName: c.name,
          imageUrl: c.image,
          size: c.size,
          color: c.color,
          quantity: c.quantity,
          unitPrice: c.price
        })),
        payment: {
          method,
          status: method === 'cod' ? 'pending' : 'success',
          transactionId: method === 'cod' ? '' : 'TXN-' + Math.floor(Math.random() * 900000 + 100000)
        }
      };

      // Sync state
      setOrders(prev => [newOrder, ...prev]);
      setAllOrders(prev => [newOrder, ...prev]);

      // Log Automations
      const preOrderCount = cart.filter(i => i.isPreOrder).length;
      await triggerOrderCompletedAutomation(
        user.email,
        user.fullName,
        orderNumber,
        total,
        selectedAddress.phone,
        preOrderCount
      );

      clearCart();
      return orderNumber;
    } catch (err) {
      console.error('Place order error:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (
    orderId: string, 
    status: Order['status'], 
    courierName?: string, 
    trackingNumber?: string
  ) => {
    try {
      await updateOrderStatusInDb(orderId, status, courierName, trackingNumber);

      // Reload orders from DB for accuracy
      if (user) {
        const rawUserOrders = await fetchOrders(user.id);
        const rawAddresses = await fetchAddresses(user.id);
        setOrders(mapDbOrders(rawUserOrders, rawAddresses));

        if (user.role === 'admin') {
          const rawAll = await fetchAllOrders();
          const allMapped = mapDbOrders(rawAll);
          setAllOrders(allMapped);

          // Find updated order for automation triggers
          const updatedOrder = allMapped.find(o => o.id === orderId);
          if (updatedOrder) {
            if (status === 'shipped') {
              triggerShippingAutomation(
                user.email,
                updatedOrder.shippingAddress.phone || '+91XXXXXXXXXX',
                updatedOrder.orderNumber,
                courierName || 'Shiprocket',
                trackingNumber || 'SR1029837'
              );
            } else if (status === 'delivered') {
              triggerDeliveryAutomation(
                user.email,
                updatedOrder.shippingAddress.phone || '+91XXXXXXXXXX',
                updatedOrder.orderNumber
              );
            }
          }
        }
      }

      logAutomation('SYSTEM', `⚙️ Order Status Updated: Order marked as ${status.toUpperCase()}`);
    } catch (err) {
      console.error('Update order status error:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vortx_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      if (next === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      logAutomation('SYSTEM', `⚙️ Theme changed to ${next.toUpperCase()} mode.`);
      return next;
    });
  };

  const togglePreOrderMode = () => {
    setPreOrderMode(prev => {
      const mode = !prev;
      logAutomation('SYSTEM', `⚙️ Catalog Mode Toggled: items configured for ${mode ? 'PRE-ORDER ONLY' : 'STANDARD IN-STOCK'} listing.`);
      return mode;
    });
  };

  return (
    <StoreContext.Provider value={{
      user,
      addresses,
      orders,
      allOrders,
      cart,
      wishlist,
      preOrderMode,
      theme,
      authLoading,
      isProductLoading,
      navigateToProduct,
      stopProductLoading,
      toggleTheme,
      signup,
      login,
      logout,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      couponCode,
      discountPercent,
      applyCoupon,
      removeCoupon,
      toggleWishlist,
      isInWishlist,
      addAddress,
      deleteAddress,
      placeOrder,
      updateOrderStatus,
      togglePreOrderMode
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
