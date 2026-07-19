'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '@/lib/supabase';
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

export const mapDbOrders = (dbOrders: any[]): Order[] => {
  const dbAddresses = mockDb.getAddresses();
  return dbOrders.map(o => {
    const addr = dbAddresses.find(a => a.id === o.shipping_address_id) || {
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
    return {
      id: o.id,
      userId: o.user_id,
      orderNumber: o.order_number,
      status: o.status,
      totalAmount: o.total_amount,
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
      items: (o.items || []).map((i: any) => ({
        id: i.id,
        productId: i.product_id,
        productName: i.product_name,
        imageUrl: i.image_url,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unitPrice: i.unit_price
      })),
      payment: o.payment ? {
        method: o.payment.method,
        status: o.payment.status,
        transactionId: o.payment.transaction_id || o.payment.transactionId
      } : undefined
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
  
  // Auth Functions
  signup: (fullName: string, email: string, phone: string) => Promise<boolean>;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  
  // Cart Functions
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Coupon
  couponCode: string;
  discountPercent: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // Wishlist Functions
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Address Functions
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;

  // Order Functions
  placeOrder: (method: Required<Order>['payment']['method'], addressId: string) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status'], courierName?: string, trackingNumber?: string) => void;
  
  // Mode Toggle
  togglePreOrderMode: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [preOrderMode, setPreOrderMode] = useState(false);

  // Load state on mount
  useEffect(() => {
    const currUser = mockDb.getCurrentUser();
    if (currUser) {
      const mappedUser: UserProfile = {
        id: currUser.id,
        email: currUser.email,
        fullName: currUser.full_name || (currUser as any).fullName || '',
        phone: currUser.phone || '',
        role: currUser.role,
        createdAt: currUser.created_at || (currUser as any).createdAt || ''
      };
      setUser(mappedUser);

      // Load user details
      const allAddresses = mockDb.getAddresses().filter(a => a.user_id === currUser.id);
      setAddresses(allAddresses.map(a => ({
        id: a.id,
        type: a.type,
        addressLine1: a.address_line1,
        addressLine2: a.address_line2,
        city: a.city,
        state: a.state,
        postalCode: a.postal_code,
        country: a.country,
        phone: a.phone
      })));

      const allDbOrders = mockDb.getOrders();
      const mappedOrders = mapDbOrders(allDbOrders);
      const userOrders = mappedOrders.filter(o => o.userId === currUser.id);
      setOrders(userOrders);
    }
    
    // Load admin orders, wishlist, and cart
    setAllOrders(mapDbOrders(mockDb.getOrders()));
    setWishlist(mockDb.getWishlists().map(w => w.product_id));
    
    const localCart = localStorage.getItem('vortx_cart');
    if (localCart) setCart(JSON.parse(localCart));
  }, []);

  // Save cart on change
  useEffect(() => {
    localStorage.setItem('vortx_cart', JSON.stringify(cart));
  }, [cart]);

  // Auth Operations
  const signup = async (fullName: string, email: string, phone: string): Promise<boolean> => {
    const profiles = mockDb.getProfiles();
    if (profiles.some(p => p.email === email)) {
      logAutomation('SYSTEM', `❌ Signup Failed: Email ${email} already exists.`);
      return false;
    }

    const newDbProfile = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      full_name: fullName,
      phone,
      role: (email === 'admin@vortx.fit' ? 'admin' : 'customer') as 'admin' | 'customer',
      created_at: new Date().toISOString()
    };

    profiles.push(newDbProfile);
    mockDb.saveProfiles(profiles);

    const userProfile: UserProfile = {
      id: newDbProfile.id,
      email: newDbProfile.email,
      fullName: newDbProfile.full_name,
      phone: newDbProfile.phone,
      role: newDbProfile.role,
      createdAt: newDbProfile.created_at
    };
    
    // Auto Login
    setUser(userProfile);
    mockDb.setCurrentUser(newDbProfile);
    setAddresses([]);
    setOrders([]);

    logAutomation('SYSTEM', `⚙️ Account Created for ${fullName} (${email})`);
    
    // Trigger Signup Welcome Automations
    await triggerWelcomeAutomation(email, fullName, phone);

    return true;
  };

  const login = async (email: string): Promise<boolean> => {
    const profiles = mockDb.getProfiles();
    const found = profiles.find(p => p.email === email);
    if (!found) {
      logAutomation('SYSTEM', `❌ Login Failed: Email ${email} not registered.`);
      return false;
    }

    const userProfile: UserProfile = {
      id: found.id,
      email: found.email,
      fullName: found.full_name || (found as any).fullName || '',
      phone: found.phone || '',
      role: found.role as any,
      createdAt: found.created_at || (found as any).createdAt || ''
    };

    setUser(userProfile);
    mockDb.setCurrentUser(found);

    // Load addresses & orders
    const allAddresses = mockDb.getAddresses().filter(a => a.user_id === userProfile.id);
    setAddresses(allAddresses.map(a => ({
      id: a.id,
      type: a.type as any,
      addressLine1: a.address_line1,
      addressLine2: a.address_line2,
      city: a.city,
      state: a.state,
      postalCode: a.postal_code,
      country: a.country,
      phone: a.phone
    })));

    const userOrders = mapDbOrders(mockDb.getOrders()).filter(o => o.userId === userProfile.id);
    setOrders(userOrders);

    logAutomation('SYSTEM', `⚙️ User Logged In: ${userProfile.fullName} (${userProfile.email})`);
    logAutomation('WHATSAPP', `💬 OTP Verification Code sent to ${userProfile.phone || 'mobile'}: "Your VORTX login code is ${Math.floor(Math.random() * 900000 + 100000)}. Valid for 10 mins."`);
    return true;
  };

  const logout = () => {
    setUser(null);
    setAddresses([]);
    setOrders([]);
    setCouponCode('');
    setDiscountPercent(0);
    mockDb.setCurrentUser(null);
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

  // Coupon
  const applyCoupon = (code: string): boolean => {
    const coupons = mockDb.getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
    if (found) {
      setCouponCode(found.code);
      setDiscountPercent(found.discount_percent);
      logAutomation('SYSTEM', `⚙️ Promo Applied: ${found.code} (${found.discount_percent}% OFF)`);
      return true;
    }
    logAutomation('SYSTEM', `❌ Invalid Coupon: "${code}" is expired or incorrect.`);
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    if (!user) {
      logAutomation('SYSTEM', `⚠️ Wishlist action failed: User must log in first.`);
      return;
    }
    
    let nextWishlist: string[] = [];
    const list = mockDb.getWishlists();
    const idx = list.findIndex(w => w.user_id === user.id && w.product_id === productId);

    if (idx > -1) {
      list.splice(idx, 1);
      nextWishlist = wishlist.filter(id => id !== productId);
      logAutomation('SYSTEM', `⚙️ Wishlist Item Removed: Product ${productId}`);
    } else {
      list.push({ id: 'w_' + Math.random(), user_id: user.id, product_id: productId });
      nextWishlist = [...wishlist, productId];
      logAutomation('SYSTEM', `⚙️ Wishlist Item Added: Product ${productId}`);
    }
    
    mockDb.saveWishlists(list);
    setWishlist(nextWishlist);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Address Operations
  const addAddress = (addr: Omit<Address, 'id'>) => {
    if (!user) return;
    const dbAddresses = mockDb.getAddresses();
    const newAddr: Address = {
      id: 'addr_' + Math.random().toString(36).substr(2, 9),
      ...addr
    };
    
    dbAddresses.push({
      id: newAddr.id,
      user_id: user.id,
      type: newAddr.type,
      address_line1: newAddr.addressLine1,
      address_line2: newAddr.addressLine2,
      city: newAddr.city,
      state: newAddr.state,
      postal_code: newAddr.postalCode,
      country: newAddr.country,
      phone: newAddr.phone,
      created_at: new Date().toISOString()
    });
    
    mockDb.saveAddresses(dbAddresses);
    setAddresses(prev => [...prev, newAddr]);
    logAutomation('SYSTEM', `⚙️ Address saved successfully under type: ${addr.type}`);
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const dbAddresses = mockDb.getAddresses().filter(a => a.id !== id);
    mockDb.saveAddresses(dbAddresses);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  // Orders
  const placeOrder = async (method: Required<Order>['payment']['method'], addressId: string): Promise<string> => {
    if (!user) throw new Error('Authentication required');
    const selectedAddress = addresses.find(a => a.id === addressId);
    if (!selectedAddress) throw new Error('Address not found');

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = Math.round(subtotal * (discountPercent / 100));
    const shipping = subtotal > 3000 ? 0 : 250;
    const total = subtotal - discount + shipping;

    const orderNumber = 'VX-' + Math.floor(Math.random() * 900000 + 100000);
    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      orderNumber,
      status: method === 'cod' ? 'pending' : 'paid',
      totalAmount: total,
      couponCode: couponCode || undefined,
      shippingAddress: selectedAddress,
      createdAt: new Date().toISOString(),
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

    // Save in Database
    const dbOrders = mockDb.getOrders();
    dbOrders.push({
      id: newOrder.id,
      user_id: user.id,
      order_number: newOrder.orderNumber,
      status: newOrder.status,
      total_amount: newOrder.totalAmount,
      coupon_code: newOrder.couponCode,
      shipping_address_id: selectedAddress.id,
      tracking_number: '',
      courier_name: '',
      tracking_status: 'Order Placed',
      created_at: newOrder.createdAt,
      items: newOrder.items.map(i => ({
        id: i.id,
        product_id: i.productId,
        product_name: i.productName,
        image_url: i.imageUrl,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unit_price: i.unitPrice
      })) as any,
      payment: newOrder.payment as any
    });
    mockDb.saveOrders(dbOrders);

    // Sync state
    setOrders(prev => [newOrder, ...prev]);
    setAllOrders(mapDbOrders(dbOrders));
    
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

    // Update Product Stock Levels
    const products = mockDb.getProducts();
    cart.forEach(item => {
      const p = products.find(p => p.id === item.id);
      if (p) {
        const v = p.variants.find(v => v.size === item.size && v.color === item.color);
        if (v) {
          v.stock = Math.max(0, v.stock - item.quantity);
        }
      }
    });
    mockDb.saveProducts(products);

    clearCart();
    return orderNumber;
  };

  const updateOrderStatus = (
    orderId: string, 
    status: Order['status'], 
    courierName?: string, 
    trackingNumber?: string
  ) => {
    const dbOrders = mockDb.getOrders();
    const orderIndex = dbOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    dbOrders[orderIndex].status = status;
    
    if (courierName) dbOrders[orderIndex].courier_name = courierName;
    if (trackingNumber) dbOrders[orderIndex].tracking_number = trackingNumber;

    if (status === 'shipped') {
      dbOrders[orderIndex].tracking_status = 'In Transit';
    } else if (status === 'delivered') {
      dbOrders[orderIndex].tracking_status = 'Delivered';
    }

    mockDb.saveOrders(dbOrders);
    
    // Sync state
    const mappedOrders = mapDbOrders(dbOrders);
    setAllOrders(mappedOrders);
    if (user) {
      setOrders(mappedOrders.filter(o => o.userId === user.id));
      
      const updatedOrder = dbOrders[orderIndex];
      const profiles = mockDb.getProfiles();
      const orderUser = profiles.find(p => p.id === updatedOrder.user_id);
      const userEmail = orderUser?.email || user.email;
      const userPhone = updatedOrder.payment ? user.phone : '+91XXXXXXXXXX';

      if (status === 'shipped') {
        triggerShippingAutomation(
          userEmail,
          userPhone,
          updatedOrder.order_number,
          courierName || 'Shiprocket',
          trackingNumber || 'SR1029837'
        );
      } else if (status === 'delivered') {
        triggerDeliveryAutomation(userEmail, userPhone, updatedOrder.order_number);
      }
    }
    
    logAutomation('SYSTEM', `⚙️ Order Status Updated: #${dbOrders[orderIndex].order_number} marked as ${status.toUpperCase()}`);
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
