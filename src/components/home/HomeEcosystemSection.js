'use client';

import React from 'react';

export default function HomeEcosystemSection() {
  return (
    <section className="space-y-10">
      <div className="text-center space-y-1.5 max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">How delicious Works</h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          An interactive food marketplace connecting local homes, kitchens, and delivery riders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Customer Ecosystem Column */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm hover:border-orange-500/20 transition-all text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-lg font-black mx-auto shadow-sm">
            1
          </div>
          <div className="space-y-1.5">
            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">For Customers</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Browse authentic home-style cooked food, customize choices, pay seamlessly, and track delivery live.
            </p>
          </div>
        </div>

        {/* Seller Ecosystem Column */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm hover:border-orange-500/20 transition-all text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-lg font-black mx-auto shadow-sm">
            2
          </div>
          <div className="space-y-1.5">
            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">For Partner Kitchens</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              List your family recipes, set preparation time, manage incoming orders, and deliver fresh food.
            </p>
          </div>
        </div>

        {/* Rider Ecosystem Column */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm hover:border-orange-500/20 transition-all text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-lg font-black mx-auto shadow-sm">
            3
          </div>
          <div className="space-y-1.5">
            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">For Delivery Riders</h4>
            <p className="text-xs text-slate-505 font-medium leading-relaxed">
              Log in anytime, accept dispatch offers from partner kitchens, follow optimized routes, and earn payout.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
