'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Store, MapPin, Phone, Clock, Star, ChefHat, ShoppingBag, ShoppingCart } from 'lucide-react';
import { getSellerProfile, getSellerProducts } from '@/services/sellerApi';
import Loader from '@/components/ui/Loader';
import { useCartStore } from '@/store/store';
import Notification from '@/components/shared/Notification';
import HomeFooter from '@/components/home/HomeFooter';

export default function SellerDetailsPage({ params }) {
  const router = useRouter();
  
  // Safe Next.js unwrapping of URL params
  const resolvedParams = React.use(params);
  const sellerUserId = resolvedParams?.id;

  const [productsPage, setProductsPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState(null);

  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const addItem = useCartStore((state) => state.addItem);

  // Safely retrieve user session from localStorage
  const [user, setUser] = useState(null);
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user session', e);
        }
      }
    }
  }, []);

  // 1. Fetch Seller Profile Info
  const { data: profileResponse, isLoading: isLoadingProfile, isError: isProfileError } = useQuery({
    queryKey: ['sellerProfile', sellerUserId],
    queryFn: () => getSellerProfile(sellerUserId),
    enabled: !!sellerUserId,
  });

  const seller = profileResponse?.data;

  // 2. Fetch Seller's specific products (Paging index starts at 0 on backend, mapped from 1)
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['sellerProducts', sellerUserId, productsPage],
    queryFn: () => getSellerProducts(sellerUserId, productsPage - 1, 8), // 8 per page
    enabled: !!sellerUserId,
    keepPreviousData: true,
  });

  const productsList = productsResponse?.data?.content || [];
  const productsTotalPages = productsResponse?.data?.totalPages || 1;

  // Safe Fallback Product Image
  const getProductImage = (imagePath) => {
    if (imagePath && imagePath.trim().startsWith('http')) {
      return imagePath;
    }
    return '/images/defaultImage.jpg';
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    setNotification({
      type: 'success',
      message: `Successfully added ${product.foodName} to your cart!`,
    });
  };

  if (!mounted) return null;

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader />
          <p className="text-sm font-bold text-slate-500">Opening kitchen doors...</p>
        </div>
      </div>
    );
  }

  if (isProfileError || !seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Kitchen profile not found</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
          This seller profile does not exist or may have been suspended.
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-sm font-bold shadow-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in-right">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Sticky Premium Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-md transform group-hover:rotate-12 transition-transform">
              D
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              delicious
            </span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link
              href="/checkout"
              className="relative w-10 h-10 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 flex items-center justify-center transition-all shadow-sm group mr-1"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors py-2 px-4 rounded-xl hover:bg-slate-50 border border-slate-150"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Menu
            </button>
          </nav>
        </div>
      </header>

      {/* Main Page Showcase */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12 flex-1">
        
        {/* Banner Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
              <Store className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight truncate">
                {seller.storeName || 'Partner Kitchen'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed uppercase tracking-wide max-w-xl line-clamp-2">
                {seller.description || 'Exquisite home-cooked delicacies prepared under absolute sanitization protocols.'}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {seller.address || 'Dhaka, Bangladesh'}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {seller.phone || 'Contact Private'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center self-stretch md:self-auto justify-center">
            <div className="px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Menu Size</span>
              <span className="text-lg font-black text-slate-800 tracking-tight">{productsList.length} items</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rating</span>
              <span className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.8</span>
            </div>
          </div>
        </div>

        {/* Menu Listings Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" /> Kitchen Catalog
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Browse all gourmet products made exclusively by this kitchen.</p>
            </div>

            {/* Pagination triggers */}
            {productsTotalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                  disabled={productsPage === 1}
                  className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
                  Page {productsPage} of {productsTotalPages}
                </span>
                <button
                  onClick={() => setProductsPage((p) => Math.min(productsTotalPages, p + 1))}
                  disabled={productsPage === productsTotalPages}
                  className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <span className="transform rotate-180 block"><ArrowLeft className="w-4 h-4" /></span>
                </button>
              </div>
            )}
          </div>

          {/* Product Items Display Grid */}
          {isLoadingProducts ? (
            <div className="py-16 text-center"><Loader /></div>
          ) : productsList.length === 0 ? (
            <div className="py-20 bg-white border border-slate-100 rounded-3xl text-center p-8 text-slate-400 font-bold uppercase tracking-widest text-xs">
              No products found from this kitchen.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsList.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo details container click navigates to product details */}
                  <Link href={`/products/${product.id}`} className="block relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer">
                    <img
                      src={getProductImage(product.image)}
                      alt={product.foodName}
                      onError={(e) => {
                        e.target.src = '/images/defaultImage.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[9px] font-black text-orange-600 tracking-wider uppercase rounded-full shadow-sm">
                      <Clock className="w-3 h-3 text-orange-500" /> {product.makingTime || 15} MINS
                    </span>
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <Link href={`/products/${product.id}`} className="block group-hover:text-orange-600 transition-colors">
                        <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate uppercase tracking-tight">
                          {product.foodName}
                        </h4>
                      </Link>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-2 min-h-[32px]">
                        {product.description || 'No detailed recipe description is listed.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-sm font-black text-slate-900 tracking-tight">
                        {Number(product.price).toLocaleString()} BDT
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 flex items-center justify-center transition-colors shadow-sm active:scale-95"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Professional Dark Footer */}
      <HomeFooter />
    </div>
  );
}
