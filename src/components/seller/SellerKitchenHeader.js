'use client';

import React from 'react';
import { ChefHat, Plus } from 'lucide-react';

export default function SellerKitchenHeader({ sellerProfile, openAddModal }) {
  return (
    <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-orange-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-750">
      <div className="space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
            <ChefHat className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              {sellerProfile?.storeName || 'Your Store'}
            </h2>
            <p className="text-xs font-bold text-orange-400 tracking-wide uppercase">
              {sellerProfile?.cuisineType || 'Home Kitchen'} Cuisine
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300 max-w-xl leading-relaxed font-semibold">
          {sellerProfile?.description || 'Serve high-quality meals to your community through the Delicious Kitchen networks.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <button
          onClick={openAddModal}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-650 font-extrabold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>
    </div>
  );
}
