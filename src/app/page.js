'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, User } from 'lucide-react';
import CategorySection from '@/components/home/CategorySection';
import ProductSection from '@/components/home/ProductSection';
import HomeSellersSection from '@/components/home/HomeSellersSection';
import HomeRidersSection from '@/components/home/HomeRidersSection';
import HomeEcosystemSection from '@/components/home/HomeEcosystemSection';
import HomeFooter from '@/components/home/HomeFooter';
import { useCartStore } from '@/store/store';

export default function Home() {
  const router = useRouter();
  
  // State for products filter & paging
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);

  const [mounted, setMounted] = useState(false);
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

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

  // Category filter changes must reset pagination back to page 1
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    setPage(1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Sticky Premium Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-md transform group-hover:rotate-12 transition-transform">
              D
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              delicious
            </span>
          </Link>
          
          <nav className="flex items-center gap-4 sm:gap-6">
            {/* Shopping Cart Trigger */}
            <Link
              href="/checkout"
              className="relative w-10 h-10 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 flex items-center justify-center transition-all shadow-sm active:scale-95 group mr-1"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-extrabold text-orange-600 tracking-wider uppercase leading-none mt-0.5">
                    {user.role}
                  </span>
                </div>
                
                {/* Profile icon linking optionally to role dashboard */}
                <Link
                  href={
                    user.role === 'SELLER'
                      ? '/seller/dashboard'
                      : user.role === 'RIDER'
                      ? '/rider/dashboard'
                      : user.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : '/'
                  }
                  className="w-10 h-10 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 flex items-center justify-center transition-colors shadow-sm"
                  title="Dashboard"
                >
                  <User className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors py-2 px-3.5 rounded-xl hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register/customer" 
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-md active:scale-95"
                >
                  Join Delicious
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Layout containing Category, Products, Kitchens, Riders and Ecosystem sections */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-16 lg:space-y-24 flex-1">
        
        {/* Category filter and food products grid */}
        <section className="space-y-6">
          <CategorySection
            activeCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
          <ProductSection
            categoryName={selectedCategory}
            page={page}
            onPageChange={setPage}
          />
        </section>

        {/* Modular Partner Kitchens (Sellers) List */}
        <HomeSellersSection />

        {/* Modular Delivery Riders List */}
        <HomeRidersSection />

        {/* Modular Ecosystem Map */}
        <HomeEcosystemSection />

      </main>

      {/* Professional Modular Footer */}
      <HomeFooter />
    </div>
  );
}
