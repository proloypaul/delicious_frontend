'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Bike, 
  MapPin, 
  Phone, 
  Mail, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  Truck,
  ShieldCheck,
  ToggleLeft,
  ToggleRight 
} from 'lucide-react';
import { getRiderById, getRiderOrders } from '@/services/riderApi';
import Loader from '@/components/ui/Loader';

export default function RiderProfileTab({ riderId, showSuccess, showError }) {
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Query rider profile from DB
  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['riderProfileDetails', riderId],
    queryFn: () => getRiderById(riderId),
    retry: false, // Don't retry infinitely if this is a fallback mock session
  });

  // Query rider orders to dynamically calculate lifetime earnings
  const { data: ordersResponse, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['riderActiveOrders', riderId],
    queryFn: () => getRiderOrders(riderId, { page: 1, size: 100 }),
  });

  const dbProfile = profileResponse?.data;
  const assignedOrders = ordersResponse?.data?.content || [];

  // Payout Statistics calculations
  const completedRuns = assignedOrders.filter(o => o.orderStatus === 'DELIVERED');
  const totalCompleted = completedRuns.length;
  const lifetimeEarnings = completedRuns.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const averagePayout = totalCompleted > 0 ? Math.round(lifetimeEarnings / totalCompleted) : 0;

  // Fallback mock rider profile if DB profile does not exist or fails to load
  const profile = dbProfile || {
    id: riderId,
    name: "Tariqul Islam (Delivery Hero)",
    email: "tariqul.rider@delicious.com",
    phone: "01788223344",
    vehicleType: "MOTORCYCLE",
    vehicleRegistrationNumber: "Dhaka-Metro-LA-55-9012"
  };

  const handleToggleDuty = () => {
    setIsOnDuty(!isOnDuty);
    showSuccess(`Duty status switched to ${!isOnDuty ? 'ONLINE' : 'OFFLINE'}.`);
  };

  if (isLoadingProfile || isLoadingOrders) {
    return (
      <div className="py-24 text-center">
        <Loader />
        <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest animate-pulse">Syncing rider metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner Cover card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {profile.name?.charAt(0).toUpperCase() || 'R'}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">{profile.name}</h3>
              <span className="px-2.5 py-0.5 border border-emerald-900/50 bg-emerald-950/45 text-emerald-400 text-[9px] font-black tracking-widest uppercase rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Approved Rider
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">Rider Partner ID: #{profile.id}</p>
          </div>
        </div>

        {/* Duty Toggle Action */}
        <button 
          onClick={handleToggleDuty}
          className={`flex items-center gap-3.5 px-5 py-3 rounded-2xl border transition-all duration-300 ${
            isOnDuty 
              ? 'bg-emerald-955/20 border-emerald-800 text-emerald-400' 
              : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}
        >
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-widest block">Rider Duty Status</span>
            <span className="text-[9px] font-bold uppercase mt-0.5 block">{isOnDuty ? 'Accepting runs' : 'Offline'}</span>
          </div>
          {isOnDuty ? (
            <ToggleRight className="w-8 h-8 text-emerald-400" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-slate-600" />
          )}
        </button>
      </div>

      {/* SECTION 2: Earning Payout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Earnings Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Earnings</h4>
            <div className="w-8 h-8 rounded-xl bg-orange-950/60 flex items-center justify-center text-orange-400">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{lifetimeEarnings.toLocaleString()} BDT</h3>
            <p className="text-[9px] text-slate-505 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> +100% payout unlocked
            </p>
          </div>
        </div>

        {/* Deliveries Completed Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Completed runs</h4>
            <div className="w-8 h-8 rounded-xl bg-emerald-955/65 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{totalCompleted} runs</h3>
            <p className="text-[9px] text-slate-505 font-bold uppercase tracking-wider mt-1.5">No deliveries pending</p>
          </div>
        </div>

        {/* Avg Payout Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Job Payout</h4>
            <div className="w-8 h-8 rounded-xl bg-blue-955/60 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{averagePayout.toLocaleString()} BDT</h3>
            <p className="text-[9px] text-slate-505 font-bold uppercase tracking-wider mt-1.5">Calculated across completions</p>
          </div>
        </div>

      </div>

      {/* SECTION 3: Detailed Bio and Vehicle registration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact and Bio Details */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-slate-850 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" /> Account bio Details
          </h4>
          
          <div className="space-y-4 text-xs font-semibold text-slate-350">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-505 block">Email address</span>
                <span className="text-slate-300 font-bold mt-0.5">{profile.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-505 block">Mobile contact</span>
                <span className="text-slate-300 font-bold mt-0.5">{profile.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Registration Sheet */}
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-slate-850 pb-3 flex items-center gap-2">
            <Bike className="w-4 h-4 text-orange-500" /> Vehicle registration
          </h4>
          
          <div className="space-y-4 text-xs font-semibold text-slate-350">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-505 block">Vehicle Category</span>
                <span className="text-slate-300 font-black uppercase mt-0.5">{profile.vehicleType || 'MOTORCYCLE'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-slate-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-505 block">License Plate number</span>
                <span className="text-slate-300 font-black uppercase mt-0.5 tracking-wider">{profile.vehicleRegistrationNumber || 'Dhaka-Metro-HA-12-3456'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
