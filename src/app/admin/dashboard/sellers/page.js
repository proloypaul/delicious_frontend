'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, ShieldCheck, ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { getAllSellers } from '@/services/sellerApi';
import { updateUserStatus } from '@/services/userApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Loader from '@/components/ui/Loader';
import Notification from '@/components/shared/Notification';

export default function AdminSellersPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sellersPage, setSellersPage] = useState(1);
  const [notification, setNotification] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch registered sellers
  const { data: sellersResponse, isLoading: isLoadingSellers, refetch } = useQuery({
    queryKey: ['adminSellersRegistry', sellersPage],
    queryFn: () => getAllSellers({ page: sellersPage, size: 20 }),
    keepPreviousData: true,
  });

  // Action mutation to approve or suspend a seller
  const statusMutation = useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries(['adminSellersRegistry']);
      setNotification({
        type: 'success',
        message: `Successfully set seller status to ${variables.status}!`,
      });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update seller status.',
      });
    },
  });

  const sellersList = sellersResponse?.data?.content || [];
  const sellersTotalPages = sellersResponse?.data?.totalPages || 1;

  // Real-time client-side filter
  const filteredSellers = sellersList.filter((seller) => {
    const q = searchQuery.toLowerCase();
    return (
      seller.storeName?.toLowerCase().includes(q) ||
      seller.description?.toLowerCase().includes(q) ||
      seller.address?.toLowerCase().includes(q) ||
      seller.phone?.toLowerCase().includes(q)
    );
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Notification Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in-right">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <AdminSidebar activeTab="sellers" />

      {/* Main Console Area */}
      <main className="flex-1 py-8 px-6 sm:px-10 overflow-y-auto z-10 space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col gap-1 border-b border-slate-900 pb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-orange-500" /> Sellers Registry Control
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
            Audit register home kitchens, verify business profiles, and manage live credentials.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by store name, address or contact details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors uppercase tracking-wider"
            />
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-3 border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {/* Sellers Listing Grid */}
        {isLoadingSellers ? (
          <div className="py-24 text-center">
            <Loader />
            <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Querying seller profiles...</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="py-20 bg-slate-900/20 border border-slate-900 rounded-3xl text-center p-8 text-slate-500 font-bold uppercase tracking-widest text-xs">
            No registered partner kitchens matched your search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => {
              const isActive = seller.status === 'ACTIVE';
              return (
                <div 
                  key={seller.userId}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-slate-700/80 transition-colors group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                          <Store className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-white text-sm truncate uppercase tracking-tight">
                            {seller.storeName || 'Partner Kitchen'}
                          </h4>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md mt-1 ${
                            isActive
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                              : 'bg-red-950/60 text-red-400 border border-red-900/50'
                          }`}>
                            {isActive ? 'ACTIVE CREDENTIALS' : 'SUSPENDED/INACTIVE'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed uppercase tracking-wider min-h-[32px] line-clamp-2">
                      {seller.description || 'No store description available.'}
                    </p>

                    <div className="border-t border-slate-850 pt-4 space-y-2 text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                      <p className="truncate"><span className="text-slate-600">Address:</span> {seller.address || 'Dhaka, Bangladesh'}</p>
                      <p><span className="text-slate-600">Phone Contact:</span> {seller.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-slate-850 pt-4">
                    <button
                      onClick={() => statusMutation.mutate({ userId: seller.userId, status: 'ACTIVE' })}
                      disabled={isActive || statusMutation.isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-900/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ShieldCheck className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ userId: seller.userId, status: 'INACTIVE' })}
                      disabled={!isActive || statusMutation.isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ShieldAlert className="w-4 h-4" /> Suspend
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
