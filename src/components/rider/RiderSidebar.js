'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bike, Compass, User, LogOut, ChevronRight } from 'lucide-react';

export default function RiderSidebar({ activeTab, setActiveTab }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="w-full md:w-80 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between py-8 px-6 shadow-2xl relative z-20">
      <div className="space-y-10">
        {/* Dashboard Header Logo */}
        <Link href="/" className="flex items-center gap-3.5 group px-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-2xl shadow-lg transform group-hover:rotate-12 transition-all">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              delicious
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
              Rider Dispatch desk
            </span>
          </div>
        </Link>

        {/* Sidebar Routes */}
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              activeTab === 'jobs'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Compass className={`w-4 h-4 transition-transform ${activeTab === 'jobs' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              Available Jobs
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'jobs' ? 'rotate-90' : ''} transition-transform`} />
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <Bike className={`w-4 h-4 transition-transform ${activeTab === 'active' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              My Deliveries
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'active' ? 'rotate-90' : ''} transition-transform`} />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-extrabold tracking-wide uppercase transition-all duration-300 group ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="flex items-center gap-3">
              <User className={`w-4 h-4 transition-transform ${activeTab === 'profile' ? 'scale-110' : 'group-hover:translate-x-0.5'}`} />
              My Profile
            </span>
            <ChevronRight className={`w-4 h-4 opacity-50 ${activeTab === 'profile' ? 'rotate-90' : ''} transition-transform`} />
          </button>
        </nav>
      </div>

      {/* Sidebar Footer Details */}
      <div className="space-y-4 mt-8 pt-6 border-t border-slate-800">
        <div className="flex flex-col">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-relaxed">Duty console</p>
          <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 text-[10px] font-black tracking-wider uppercase rounded-full mt-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            GPS: ONLINE
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-5 border border-slate-800 hover:border-red-800/40 hover:bg-red-950/20 text-slate-405 hover:text-red-400 rounded-2xl text-xs font-extrabold uppercase transition-all duration-300"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout Account
        </button>
      </div>
    </aside>
  );
}
