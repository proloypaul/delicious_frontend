'use client';

import React from 'react';
import Link from 'next/link';
import { ChefHat, Grid, ShoppingBag, ChevronRight } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, resetForm }) {
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
          <button
            onClick={() => { setActiveTab('products'); resetForm?.(); }}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <ChefHat className={`w-4 h-4 transition-transform ${activeTab === 'products' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Products catalog
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'products' ? 'rotate-90' : ''} transition-transform`} />
          </button>

          <button
            onClick={() => { setActiveTab('categories'); resetForm?.(); }}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Grid className={`w-4 h-4 transition-transform ${activeTab === 'categories' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Cuisines Groups
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'categories' ? 'rotate-90' : ''} transition-transform`} />
          </button>

          <button
            onClick={() => { setActiveTab('orders'); resetForm?.(); }}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className={`w-4 h-4 transition-transform ${activeTab === 'orders' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Order Workflow
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'orders' ? 'rotate-90' : ''} transition-transform`} />
          </button>
        </nav>
      </div>

      {/* Sidebar Footer Details */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-center md:text-left">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-relaxed">System Console</p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-[10px] font-black tracking-wider uppercase rounded-full mt-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Server: ONLINE
        </span>
      </div>
    </aside>
  );
}
