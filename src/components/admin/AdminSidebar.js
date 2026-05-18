'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChefHat, Grid, ShoppingBag, Store, Bike, ChevronRight } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, resetForm }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (tab) => {
    if (pathname !== '/admin/dashboard') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminActiveTab', tab);
      }
      router.push('/admin/dashboard');
    } else {
      setActiveTab?.(tab);
      resetForm?.();
    }
  };

  const isMainDashboard = pathname === '/admin/dashboard';
  const isSellersRoute = pathname === '/admin/dashboard/sellers';
  const isRidersRoute = pathname === '/admin/dashboard/riders';

  return (
    <aside className="w-full md:w-80 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between py-8 px-6 shadow-2xl relative z-20">
      <div className="space-y-10">
        {/* Dashboard Header Logo */}
        <Link href="/" className="flex items-center gap-3.5 group px-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:rotate-12 transition-all">
            D
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              delicious
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Admin Control Room
            </span>
          </div>
        </Link>

        {/* Sidebar Routes */}
        <nav className="space-y-2">
          {/* Main Dashboard Products Tab */}
          <button
            onClick={() => handleTabClick('products')}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              isMainDashboard && activeTab === 'products'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <ChefHat className={`w-4 h-4 transition-transform ${isMainDashboard && activeTab === 'products' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Products catalog
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${isMainDashboard && activeTab === 'products' ? 'rotate-90' : ''} transition-transform`} />
          </button>

          {/* Main Dashboard Categories Tab */}
          <button
            onClick={() => handleTabClick('categories')}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              isMainDashboard && activeTab === 'categories'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Grid className={`w-4 h-4 transition-transform ${isMainDashboard && activeTab === 'categories' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Cuisines Groups
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${isMainDashboard && activeTab === 'categories' ? 'rotate-90' : ''} transition-transform`} />
          </button>

          {/* Main Dashboard Orders Tab */}
          <button
            onClick={() => handleTabClick('orders')}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              isMainDashboard && activeTab === 'orders'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className={`w-4 h-4 transition-transform ${isMainDashboard && activeTab === 'orders' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Order Workflow
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${isMainDashboard && activeTab === 'orders' ? 'rotate-90' : ''} transition-transform`} />
          </button>

          {/* Route: Seller Management */}
          <Link
            href="/admin/dashboard/sellers"
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              isSellersRoute
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Store className={`w-4 h-4 transition-transform ${isSellersRoute ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Sellers Registry
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${isSellersRoute ? 'rotate-90' : ''} transition-transform`} />
          </Link>

          {/* Route: Rider Management */}
          <Link
            href="/admin/dashboard/riders"
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              isRidersRoute
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Bike className={`w-4 h-4 transition-transform ${isRidersRoute ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Riders Registry
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${isRidersRoute ? 'rotate-90' : ''} transition-transform`} />
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer Details */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-center md:text-left">
        <p className="text-xs font-black text-slate-505 uppercase tracking-widest leading-relaxed">System Console</p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-[10px] font-black tracking-wider uppercase rounded-full mt-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Server: ONLINE
        </span>
      </div>
    </aside>
  );
}
