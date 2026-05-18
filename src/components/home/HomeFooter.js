'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function HomeFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm font-medium border-t border-slate-800 mt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
        
        {/* Column 1: Brand details */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-lg shadow-md transform group-hover:rotate-12 transition-transform">
              D
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              delicious
            </span>
          </Link>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed uppercase tracking-wider">
            Empowering local home kitchens and delivering fresh, healthy meals with love.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-[10px] font-black tracking-wider uppercase rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> GPS Server Online
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white">Ecosystem</h4>
          <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">Home catalog</Link>
            <Link href="/checkout" className="hover:text-white transition-colors">Shopping Cart</Link>
            <Link href="/login" className="hover:text-white transition-colors">Partner Sign In</Link>
          </div>
        </div>

        {/* Column 3: Partner Programs */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white">Join delicious</h4>
          <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <Link href="/register/seller" className="hover:text-white transition-colors">Register Home Kitchen</Link>
            <Link href="/register/rider" className="hover:text-white transition-colors">Apply as Delivery Rider</Link>
            <Link href="/register/customer" className="hover:text-white transition-colors">Create Customer Account</Link>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white">Contact & Support</h4>
          <div className="space-y-2.5 text-xs text-slate-500 font-semibold">
            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" /> Dhaka, Bangladesh</p>
            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" /> +880 1712-345678</p>
            <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" /> support@delicious.com</p>
          </div>
        </div>

      </div>

      {/* Footer Bottom copyright bar */}
      <div className="border-t border-slate-800/60 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-slate-600">
          <p>© {new Date().getFullYear()} delicious Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
