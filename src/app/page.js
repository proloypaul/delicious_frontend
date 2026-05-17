import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Store, Bike, ArrowRight, Star, Heart, MapPin, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Premium Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-md transform group-hover:rotate-12 transition-transform">
              D
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              delicious
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register/customer" 
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-md active:scale-95"
            >
              Order Now
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-transparent to-red-50/20" />
        <div className="max-w-7xl mx-auto px-6 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold tracking-wide uppercase">
              <Star className="w-3.5 h-3.5 fill-current" /> 5-Star Rated Food Delivery
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Hungry? Get your{' '}
              <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                favorite meals
              </span>{' '}
              delivered fast!
            </h1>
            
            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Delicious connects you to the best local restaurants, bakers, and kitchens. Order instantly or register as a partner to start earning!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link 
                href="/register/customer" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all group"
              >
                Sign Up to Order <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-sm active:scale-[0.98] transition-all"
              >
                Access Account
              </Link>
            </div>

            <div className="pt-4 flex justify-center lg:justify-start items-center gap-6 text-slate-400 text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-orange-500" /> Secure Checkout
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-orange-500" /> Real-time Tracking
              </div>
            </div>
          </div>

          {/* Graphics Showcase */}
          <div className="relative flex justify-center items-center">
            <div className="absolute w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-gradient-to-tr from-orange-300/20 to-red-300/30 blur-3xl -z-10" />
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 max-w-sm w-full space-y-6 transform hover:rotate-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Order Delivery Tracker</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-bold">On the way</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Spicy Ramen Noodle</h4>
                  <p className="text-xs text-slate-400">Merchant: Tokyo House</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Estimated Delivery Time:</span>
                  <span>25 mins</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                  DR
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">Dustin Rider</p>
                  <p className="text-[10px] text-slate-400">Your Delivery Hero</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Bike className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Options Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Join the Delicious Ecosystem
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            Whether you want to eat, sell, or deliver — we have the perfect dashboard tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Customer Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Food Lover</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Register as a customer to browse endless menus, get fast deliveries, and rate your favorite dishes.
                </p>
              </div>
            </div>
            <Link 
              href="/register/customer" 
              className="mt-8 inline-flex items-center justify-center w-full py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 text-sm font-bold transition-colors"
            >
              Register to Eat <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          {/* Seller Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Merchant Partner</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Own a kitchen or restaurant? Join Delicious to publish menu lists, manage customer reviews, and boost revenue.
                </p>
              </div>
            </div>
            <Link 
              href="/register/seller" 
              className="mt-8 inline-flex items-center justify-center w-full py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 text-sm font-bold transition-colors"
            >
              Become a Seller Partner <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          {/* Rider Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Bike className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Delivery Hero</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Work on your own terms. Register your vehicle, earn on every successful food drop-off, and track your wallet.
                </p>
              </div>
            </div>
            <Link 
              href="/register/rider" 
              className="mt-8 inline-flex items-center justify-center w-full py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 text-sm font-bold transition-colors"
            >
              Apply as a Rider <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-sm font-medium border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
