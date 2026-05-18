'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LogOut, User } from 'lucide-react';
import CategorySection from '@/components/home/CategorySection';
import ProductSection from '@/components/home/ProductSection';
import { useCartStore } from '@/store/store';

export default function Home() {
  const router = useRouter();
  
  // State to drive filters and page increments
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);

  const [mounted, setMounted] = useState(false);
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  // Safely retrieve user session from localStorage
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
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

      {/* Main Layout containing only Category and Products sections */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* Category section with horizontal scrolling capsules */}
        <CategorySection
          activeCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        {/* Dynamic products list grid with page navigation controls */}
        <ProductSection
          categoryName={selectedCategory}
          page={page}
          onPageChange={setPage}
        />
      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-sm font-medium border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Delicious Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
