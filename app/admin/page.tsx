'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, Order } from '@/components/StoreContext';
import { mockDb, isSupabaseConfigured, supabase, fetchSupabaseProducts, createSupabaseProduct, deleteSupabaseProduct, toggleSupabaseProductVisibility } from '@/lib/supabase';
import { 
  ShieldAlert, LayoutDashboard, Plus, Trash2, Edit3, ClipboardList, 
  Tag, Download, ArrowLeftRight, Check, X, ShieldCheck, DollarSign,
  UploadCloud, Loader2, Eye, EyeOff
} from 'lucide-react';
import { formatPrice } from '@/products';
import { logAutomation } from '@/lib/email';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, allOrders, updateOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders'>('stats');

  // DB States
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Product Creator Form States
  const [pName, setPName] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState<number | string>(3999);
  const [pMrp, setPMrp] = useState<number | string>(4999);
  const [pBadge, setPBadge] = useState('NEW DROP');
  const [pCategory, setPCategory] = useState('tops');
  const [pGender, setPGender] = useState('men');
  const [pSizes, setPSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [pColors, setPColors] = useState<string[]>(['Black']);
  const [pStock, setPStock] = useState(20);
  const [pImageInput, setPImageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Drag & drop file handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    setUploading(true);

    const convertToBase64 = (f: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as string);
          else reject(new Error('Failed to read file'));
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(f);
      });
    };

    try {
      if (isSupabaseConfigured) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.warn('Supabase storage upload error:', uploadError.message);
          // Fallback to data URL encoding so product creation can continue seamlessly
          const dataUrl = await convertToBase64(file);
          setPImageInput(dataUrl);
          logAutomation('SYSTEM', `⚠️ Storage Engine: Supabase Storage upload error (${uploadError.message}). Applied local data URL fallback.`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        setPImageInput(urlData.publicUrl);
        logAutomation('SYSTEM', `🛡️ Storage Engine: Uploaded "${file.name}" to Supabase bucket.`);
      } else {
        // Fallback for local demo mode when Supabase is offline/not configured
        const dataUrl = await convertToBase64(file);
        setPImageInput(dataUrl);
        logAutomation('SYSTEM', `🛡️ Storage Engine: Created local data preview for "${file.name}".`);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      try {
        const dataUrl = await convertToBase64(file);
        setPImageInput(dataUrl);
        logAutomation('SYSTEM', `⚠️ Storage Engine: Applied fallback image data URL.`);
      } catch (fallbackErr) {
        alert(`Upload failed: ${err.message || err}`);
      }
    } finally {
      setUploading(false);
    }
  };
  
  // Tracking edit states for Orders
  const [editingOrderId, setEditingOrderId] = useState('');
  const [courierName, setCourierName] = useState('Shiprocket');
  const [trackingNumber, setTrackingNumber] = useState('SR' + Math.floor(Math.random() * 9000000 + 1000000));
  const [formError, setFormError] = useState('');

  // Access validation
  useEffect(() => {
    if (!user) {
      router.push('/auth?redirect=admin');
      return;
    }
    
    const loadDatabaseData = async () => {
      const prods = await fetchSupabaseProducts();
      setProducts(prods);
    };

    loadDatabaseData();
    setCoupons(mockDb.getCoupons());
  }, [user, router]);

  if (!user) return null;

  // Security guard check
  if (user.role !== 'admin') {
    return (
      <div className="flex-grow flex items-center justify-center p-6 bg-vortx-black">
        <div className="w-full max-w-md bg-vortx-dark border border-red-500/25 p-8 text-center glassmorphism rounded space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="font-syne text-sm font-bold tracking-widest text-vortx-white uppercase">RESTRICTED ACCESS</h3>
          <p className="text-xs text-vortx-gray leading-relaxed">
            Your current warrior profile role does not hold administrator permissions. Only <span className="font-mono text-vortx-white">admin@vortx.fit</span> holds admin authority.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-vortx-white text-vortx-black font-syne text-[10px] font-bold tracking-widest hover:bg-vortx-white/95 transition"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  // --- STATS TAB LOGIC ---
  const totalSales = allOrders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const pendingSales = allOrders
    .filter(o => o.status === 'pending')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // --- PRODUCTS CRUD LOGIC ---
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!pName || !pDescription) {
      setFormError('All required fields must be completed.');
      return;
    }

    if (pName.trim().length < 3) {
      setFormError('Product name must be at least 3 characters.');
      return;
    }

    if (pDescription.trim().length < 10) {
      setFormError('Description must be at least 10 characters.');
      return;
    }

    if (!pImageInput) {
      setFormError('Please upload an image or enter a direct image URL.');
      return;
    }

    const priceNum = Number(pPrice);
    const mrpNum = Number(pMrp);

    if (isNaN(priceNum) || priceNum <= 0 || isNaN(mrpNum) || mrpNum <= 0) {
      setFormError('Price and MRP must be valid numbers greater than zero.');
      return;
    }

    if (priceNum > mrpNum) {
      setFormError('Standard Price cannot be higher than Maximum Retail Price (MRP).');
      return;
    }

    const slug = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const discount = mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

    // Create variants mapping
    const variantsList = pSizes.flatMap(size => 
      pColors.map(color => ({
        size,
        color,
        stock: pStock,
        sku: `VX-${pName.substring(0, 3).toUpperCase()}-${size}-${color.substring(0, 3).toUpperCase()}`
      }))
    );

    try {
      setUploading(true);
      await createSupabaseProduct({
        name: pName,
        slug,
        description: pDescription,
        price: priceNum,
        mrp: mrpNum,
        discount_percent: discount,
        badge: pBadge,
        category: pCategory,
        gender: pGender,
        is_in_stock: pStock > 0,
        pre_order_available: pBadge === 'NEW DROP' || pBadge === 'LIMITED',
        pre_order_date: pBadge === 'NEW DROP' || pBadge === 'LIMITED' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        images: [pImageInput],
        variants: variantsList
      });

      const refreshedProds = await fetchSupabaseProducts();
      setProducts(refreshedProds);

      logAutomation('SYSTEM', `🛡️ Supabase CRUD: Product "${pName}" successfully created.`);

      // Reset Form
      setPName('');
      setPDescription('');
      setPPrice(3999);
      setPMrp(4999);
      setPBadge('NEW DROP');
      setPImageInput('');
      alert('Product created live in Supabase database!');
    } catch (err: any) {
      console.error('Error creating product in Supabase:', err);
      setFormError(`Failed to save product to database: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVisibility = async (p: any) => {
    try {
      const newStatus = await toggleSupabaseProductVisibility(p.id, p.is_in_stock);
      setProducts(products.map(item => item.id === p.id ? { ...item, is_in_stock: newStatus } : item));
      logAutomation('SYSTEM', `🛡️ Admin Visibility Toggle: Product "${p.name}" set to ${newStatus ? 'VISIBLE (ON STOREFRONT)' : 'HIDDEN (DRAFT MODE)'}.`);
    } catch (err) {
      alert('Failed to update product visibility.');
    }
  };

  const handleDeleteProduct = async (p: any) => {
    if (!confirm(`PERMANENT DELETE WARNING: Are you sure you want to permanently delete "${p.name}" from your live database?\n\nTip: You can use the Eye button (Visibility Toggle) to hide this product from your storefront without losing database records.`)) return;
    try {
      await deleteSupabaseProduct(p.id);
      const refreshedProds = await fetchSupabaseProducts();
      setProducts(refreshedProds);
      logAutomation('SYSTEM', `🛡️ Admin CRUD: Product "${p.name}" deleted from database.`);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete product from database.');
    }
  };

  // --- ORDERS EXPORT TO CSV LOGIC ---
  const handleExportOrdersToCSV = () => {
    if (allOrders.length === 0) {
      alert('No orders in database to export');
      return;
    }

    const headers = ['Order Number', 'Date', 'Customer Email', 'Items Count', 'Total Amount', 'Status', 'Payment Method'];
    const rows = allOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      o.userId || 'Guest',
      o.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
      o.totalAmount,
      o.status,
      o.payment?.method || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VORTX_Orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAutomation('SYSTEM', `🛡️ Export Engine: Dispatched CSV database download containing ${allOrders.length} orders.`);
  };

  const handleUpdateShipping = (orderId: string) => {
    if (!courierName.trim()) {
      alert('Courier Name is required.');
      return;
    }
    if (!trackingNumber.trim()) {
      alert('Tracking Number is required.');
      return;
    }
    updateOrderStatus(orderId, 'shipped', courierName, trackingNumber);
    setEditingOrderId('');
    // generate new random tracking for next edit
    setTrackingNumber('SR' + Math.floor(Math.random() * 9000000 + 1000000));
  };

  return (
    <div className="py-12 bg-vortx-black min-h-screen text-vortx-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="border-b border-vortx-white/10 pb-8 mb-10 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-vortx-white" />
          <div>
            <h1 className="font-syne text-3xl font-extrabold tracking-wide uppercase">ADMIN CONTROL PANEL</h1>
            <p className="text-[10px] text-vortx-gray uppercase font-semibold font-mono tracking-widest mt-1">SECURED DEMO INTERFACE</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-4 border-b border-vortx-white/10 mb-8 font-syne text-xs font-bold tracking-widest overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-3 px-4 transition ${
              activeTab === 'stats' ? 'border-b-2 border-vortx-white text-vortx-white' : 'text-vortx-gray hover:text-vortx-white'
            }`}
          >
            <span className="flex items-center gap-1.5"><LayoutDashboard className="w-3.5 h-3.5" /> OVERVIEW STATS</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 transition ${
              activeTab === 'products' ? 'border-b-2 border-vortx-white text-vortx-white' : 'text-vortx-gray hover:text-vortx-white'
            }`}
          >
            <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> MANAGE PRODUCTS</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 transition ${
              activeTab === 'orders' ? 'border-b-2 border-vortx-white text-vortx-white' : 'text-vortx-gray hover:text-vortx-white'
            }`}
          >
            <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> MANAGE ORDERS</span>
          </button>
        </div>

        {/* ==========================================
            TAB 1: STATS OVERVIEW
            ========================================== */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism flex flex-col justify-between">
                <div className="flex justify-between items-center text-vortx-gray text-[10px] uppercase font-bold">
                  <span>TOTAL SALES</span>
                  <DollarSign className="w-4 h-4 text-vortx-white" />
                </div>
                <span className="font-mono text-xl font-bold mt-4 text-vortx-white">{formatPrice(totalSales)}</span>
              </div>
              <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism flex flex-col justify-between">
                <div className="flex justify-between items-center text-vortx-gray text-[10px] uppercase font-bold">
                  <span>PENDING CASH ON DEL.</span>
                  <ArrowLeftRight className="w-4 h-4 text-vortx-white" />
                </div>
                <span className="font-mono text-xl font-bold mt-4 text-vortx-white">{formatPrice(pendingSales)}</span>
              </div>
              <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism flex flex-col justify-between">
                <div className="flex justify-between items-center text-vortx-gray text-[10px] uppercase font-bold">
                  <span>FULFILLED ORDERS</span>
                  <Check className="w-4 h-4 text-vortx-white" />
                </div>
                <span className="font-mono text-xl font-bold mt-4 text-vortx-white">
                  {allOrders.filter(o => o.status === 'delivered').length} / {allOrders.length}
                </span>
              </div>
              <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism flex flex-col justify-between">
                <div className="flex justify-between items-center text-vortx-gray text-[10px] uppercase font-bold">
                  <span>ACTIVE DISCOUNT COUPONS</span>
                  <Tag className="w-4 h-4 text-vortx-white" />
                </div>
                <span className="font-mono text-xl font-bold mt-4 text-vortx-white">{coupons.length} CODES</span>
              </div>
            </div>

            {/* Dashboard Quick Summary */}
            <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-4">
              <h3 className="font-syne text-xs font-bold tracking-widest uppercase border-b border-vortx-white/10 pb-3">SYSTEM BACKEND SUMMARY</h3>
              <p className="text-xs text-vortx-gray leading-relaxed font-medium">
                The database is syncing correctly with PostgreSQL schemas. Seed records matches the pre-defined product lines. You can populate products in the Manage Products tab or fulfillment statuses in the Manage Orders tab. To test emails or tracking updates, toggle the live notifications log in the bottom right corner.
              </p>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 2: PRODUCTS MANAGER (CRUD)
            ========================================== */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Block: Add Product Form (5/12) */}
            <div className="lg:col-span-5">
              <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-4">
                <h3 className="font-syne text-xs font-bold tracking-widest uppercase border-b border-vortx-white/10 pb-3">ADD NEW PRODUCT</h3>
                
                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1">PRODUCT NAME</label>
                    <input 
                      type="text" 
                      value={pName}
                      onChange={(e) => {
                        setPName(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="E.g. Tactical Compression Vest"
                      className="w-full bg-vortx-black border border-vortx-white/20 px-3 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1">DESCRIPTION</label>
                    <textarea 
                      rows={3}
                      value={pDescription}
                      onChange={(e) => {
                        setPDescription(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="Detailed warrior specifications"
                      className="w-full bg-vortx-black border border-vortx-white/20 px-3 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1">PRICE (INR)</label>
                      <input 
                        type="number" 
                        value={pPrice}
                        onChange={(e) => setPPrice(Number(e.target.value))}
                        className="w-full bg-vortx-black border border-vortx-white/20 px-3 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1">MRP (INR)</label>
                      <input 
                        type="number" 
                        value={pMrp}
                        onChange={(e) => setPMrp(Number(e.target.value))}
                        className="w-full bg-vortx-black border border-vortx-white/20 px-3 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1">CATEGORY</label>
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full bg-vortx-black border border-vortx-white/20 px-2 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-syne font-bold tracking-wider"
                      >
                        <option value="tops">TOPS</option>
                        <option value="bottoms">BOTTOMS</option>
                        <option value="outerwear">OUTERWEAR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1">GENDER</label>
                      <select
                        value={pGender}
                        onChange={(e) => setPGender(e.target.value)}
                        className="w-full bg-vortx-black border border-vortx-white/20 px-2 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-syne font-bold tracking-wider"
                      >
                        <option value="men">MEN</option>
                        <option value="women">WOMEN</option>
                        <option value="unisex">UNISEX</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1">DROP BADGE</label>
                      <select
                        value={pBadge}
                        onChange={(e) => setPBadge(e.target.value)}
                        className="w-full bg-vortx-black border border-vortx-white/20 px-2 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-syne font-bold tracking-wider"
                      >
                        <option value="NEW DROP">NEW DROP</option>
                        <option value="BESTSELLER">BESTSELLER</option>
                        <option value="SALE">SALE</option>
                        <option value="LIMITED">LIMITED</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1 font-mono">VARIANT STOCK PER COMBINATION</label>
                    <input 
                      type="number" 
                      value={pStock}
                      onChange={(e) => setPStock(Number(e.target.value))}
                      className="w-full bg-vortx-black border border-vortx-white/20 px-3 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono"
                      required
                    />
                  </div>

                  {/* Drag-and-drop Image Upload Zone */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1 font-mono">
                      PRODUCT IMAGE
                    </label>
                    
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded p-6 flex flex-col items-center justify-center transition-all min-h-[160px] cursor-pointer ${
                        dragActive 
                          ? 'border-vortx-white bg-vortx-white/10' 
                          : 'border-vortx-white/20 bg-vortx-black/30 hover:border-vortx-white/40'
                      }`}
                    >
                      <input 
                        type="file"
                        id="image-file-input"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2 text-center text-vortx-gray text-xs font-mono">
                          <Loader2 className="w-8 h-8 animate-spin text-vortx-white" />
                          <span className="uppercase tracking-wider">UPLOADING IMAGE...</span>
                        </div>
                      ) : pImageInput ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="relative group w-20 h-24 border border-vortx-white/20 rounded overflow-hidden bg-vortx-black">
                            <img 
                              src={pImageInput} 
                              alt="Upload preview" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPImageInput('');
                              }}
                              className="absolute top-1 right-1 p-1 rounded bg-black/80 hover:bg-black text-red-500 border border-red-500/30 transition shadow-lg"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[10px] text-vortx-gray font-mono text-center uppercase tracking-wider">
                            IMAGE LOADED SUCCESSFULLY
                          </span>
                          <button
                            type="button"
                            onClick={() => document.getElementById('image-file-input')?.click()}
                            className="px-3 py-1.5 border border-vortx-white/20 hover:border-vortx-white text-[9px] font-syne font-bold tracking-widest text-vortx-white uppercase transition"
                          >
                            CHANGE IMAGE
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('image-file-input')?.click()}
                          className="flex flex-col items-center gap-2 text-center text-vortx-gray hover:text-vortx-white transition w-full h-full py-4"
                        >
                          <UploadCloud className="w-8 h-8 mb-1" />
                          <p className="font-syne font-bold text-[10px] tracking-wider uppercase">
                            DRAG & DROP IMAGE HERE
                          </p>
                          <p className="text-[8px] font-mono uppercase tracking-widest text-vortx-gray/60">
                            OR CLICK TO BROWSE FILE
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fallback Paste URL Trigger */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setShowManualUrl(!showManualUrl)}
                        className="text-[9px] font-syne font-bold tracking-widest text-vortx-gray hover:text-vortx-white uppercase transition"
                      >
                        {showManualUrl ? '[-] HIDE DIRECT URL OPTION' : '[+] PASTE DIRECT IMAGE URL'}
                      </button>
                    </div>

                    {showManualUrl && (
                      <div className="mt-1 transition-all">
                        <label className="block text-[8px] font-syne font-bold tracking-wider text-vortx-gray uppercase mb-1 font-mono">SUPABASE STORAGE IMAGE LINK / URL</label>
                        <input 
                          type="text" 
                          value={pImageInput}
                          onChange={(e) => setPImageInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full bg-vortx-black border border-vortx-white/20 px-3 py-2 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/20"
                        />
                      </div>
                    )}
                  </div>

                  {formError && (
                    <p className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded text-center">
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-vortx-white text-vortx-black font-syne text-[10px] font-bold tracking-widest hover:bg-vortx-white/95 transition uppercase"
                  >
                    CREATE PRODUCT RECORD
                  </button>
                </form>

              </div>
            </div>

            {/* Right Block: Product Catalog lists (7/12) */}
            <div className="lg:col-span-7">
              <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-4">
                <h3 className="font-syne text-xs font-bold tracking-widest uppercase border-b border-vortx-white/10 pb-3">
                  PRODUCTS CATALOG ({products.length})
                </h3>
                
                <div className="max-h-[500px] overflow-y-auto space-y-3">
                  {products.map((p) => {
                    const totalStk = p.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
                    return (
                      <div key={p.id} className={`p-3 bg-vortx-black/40 border rounded flex justify-between items-center gap-4 text-xs transition ${p.is_in_stock ? 'border-vortx-white/10' : 'border-amber-500/30 bg-amber-500/5'}`}>
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]} alt={p.name} className="w-10 h-12 object-cover border border-vortx-white/10 rounded" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-syne font-bold text-vortx-white uppercase">{p.name}</h4>
                              {p.is_in_stock ? (
                                <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded uppercase">
                                  VISIBLE ON STORE
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase">
                                  HIDDEN (DRAFT)
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-vortx-gray mt-0.5 font-mono uppercase">
                              CAT: {p.category || 'Tops'} | PRICE: {formatPrice(p.price)} | STOCK: {totalStk} UNITS
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Visibility Toggle (Show / Hide on Storefront) */}
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(p)}
                            className={`p-2 border rounded transition flex items-center gap-1 text-[10px] font-mono font-bold ${
                              p.is_in_stock 
                                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' 
                                : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                            }`}
                            title={p.is_in_stock ? 'Click to HIDE from Storefront' : 'Click to SHOW on Storefront'}
                          >
                            {p.is_in_stock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{p.is_in_stock ? 'HIDE' : 'SHOW'}</span>
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-2 border border-vortx-white/10 hover:border-red-500/40 text-vortx-gray hover:text-red-500 rounded transition"
                            title="Permanently Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 3: ORDERS MANAGER
            ========================================== */}
        {activeTab === 'orders' && (
          <div className="p-6 border border-vortx-white/10 bg-vortx-dark/30 rounded glassmorphism space-y-6">
            <div className="flex justify-between items-center border-b border-vortx-white/10 pb-4">
              <h3 className="font-syne text-xs font-bold tracking-widest uppercase">CUSTOMER FULFILLMENT BOARD ({allOrders.length})</h3>
              <button
                onClick={handleExportOrdersToCSV}
                className="flex items-center gap-1.5 px-4 py-2 border border-vortx-white text-vortx-white font-syne text-[10px] font-bold tracking-widest hover:bg-vortx-white hover:text-vortx-black transition uppercase"
              >
                <Download className="w-3.5 h-3.5" /> EXPORT TO CSV
              </button>
            </div>

            {allOrders.length === 0 ? (
              <p className="text-xs text-vortx-gray italic text-center py-8">No client orders in database.</p>
            ) : (
              <div className="space-y-4">
                {allOrders.map((ord) => (
                  <div key={ord.id} className="p-4 bg-vortx-black/40 border border-vortx-white/10 rounded flex flex-col md:flex-row justify-between gap-6 text-xs">
                    
                    {/* Details block */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-vortx-white text-sm">{ord.orderNumber}</span>
                        <span className="font-mono text-vortx-gray text-[10px]">{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-vortx-gray text-[11px] font-mono">
                        DELIVERY: {ord.shippingAddress.addressLine1}, {ord.shippingAddress.city} - {ord.shippingAddress.postalCode}
                      </p>
                      <p className="text-vortx-gray text-[11px] font-mono">
                        ITEMS: {ord.items.map(i => `${i.productName} (${i.size}/${i.color}) x${i.quantity}`).join(', ')}
                      </p>
                      <div className="flex items-center gap-3 font-mono text-[10px]">
                        <span className="text-vortx-white font-bold">TOTAL: {formatPrice(ord.totalAmount)}</span>
                        <span>|</span>
                        <span className="text-vortx-gray">METHOD: {ord.payment?.method.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Status updater Controls block */}
                    <div className="flex flex-col justify-between items-end gap-3 min-w-[200px]">
                      
                      {/* Status selectors */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-vortx-gray font-bold uppercase">STATUS:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                          className="bg-vortx-black border border-vortx-white/20 px-2 py-1 text-[10px] font-bold text-vortx-white focus:outline-none focus:border-vortx-white font-syne"
                        >
                          <option value="pending">PENDING</option>
                          <option value="paid">PAID</option>
                          <option value="shipped">SHIPPED</option>
                          <option value="delivered">DELIVERED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </div>

                      {/* Shiprocket details modifier */}
                      {editingOrderId === ord.id ? (
                        <div className="p-3 bg-vortx-black border border-vortx-white/10 rounded space-y-2 text-[10px] w-full">
                          <div>
                            <label className="block text-[8px] text-vortx-gray uppercase mb-0.5">Courier Name</label>
                            <input 
                              type="text" 
                              value={courierName}
                              onChange={(e) => setCourierName(e.target.value)}
                              className="w-full bg-vortx-dark border border-vortx-white/25 px-2 py-1 text-vortx-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-vortx-gray uppercase mb-0.5">Tracking Number</label>
                            <input 
                              type="text" 
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              className="w-full bg-vortx-dark border border-vortx-white/25 px-2 py-1 text-vortx-white font-mono"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateShipping(ord.id)}
                              className="flex-1 py-1 bg-vortx-white text-vortx-black font-bold uppercase font-syne text-[8px]"
                            >
                              SAVE
                            </button>
                            <button
                              onClick={() => setEditingOrderId('')}
                              className="px-2 border border-vortx-white/20 hover:bg-vortx-white/10 text-vortx-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          {ord.status === 'shipped' || ord.status === 'delivered' ? (
                            <div className="text-[10px] font-mono text-vortx-gray">
                              <p className="uppercase">Courier: {ord.courierName || 'Shiprocket'}</p>
                              <p>ID: {ord.trackingNumber}</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingOrderId(ord.id);
                                if (ord.courierName) setCourierName(ord.courierName);
                                if (ord.trackingNumber) setTrackingNumber(ord.trackingNumber);
                              }}
                              className="text-[9px] border border-vortx-white/30 text-vortx-white hover:bg-vortx-white hover:text-vortx-black px-2.5 py-1.5 transition font-syne font-bold tracking-widest uppercase"
                            >
                              ASSIGN COURIER (SHIPROCKET)
                            </button>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
