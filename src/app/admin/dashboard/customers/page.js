'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, ShieldCheck, ShieldAlert, Search, RefreshCw, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllCustomers } from '@/services/customerApi';
import { updateUserStatus } from '@/services/userApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Loader from '@/components/ui/Loader';
import Notification from '@/components/shared/Notification';

export default function AdminCustomersPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customersPage, setCustomersPage] = useState(1);
  const [notification, setNotification] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch registered customers
  const { data: customersResponse, isLoading: isLoadingCustomers, refetch } = useQuery({
    queryKey: ['adminCustomersRegistry', customersPage],
    queryFn: () => getAllCustomers({ page: customersPage, size: 20 }),
    keepPreviousData: true,
  });

  // Action mutation to approve or suspend a customer
  const statusMutation = useMutation({
    mutationFn: ({ userId, status }) => updateUserStatus(userId, status),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries(['adminCustomersRegistry']);
      setNotification({
        type: 'success',
        message: `Successfully set customer status to ${variables.status}!`,
      });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to update customer status.',
      });
    },
  });

  const customersList = customersResponse?.data?.content || [];
  const customersTotalPages = customersResponse?.data?.totalPages || 1;

  // Real-time client-side filter
  const filteredCustomers = customersList.filter((customer) => {
    const q = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(q) ||
      customer.email?.toLowerCase().includes(q) ||
      customer.phone?.toLowerCase().includes(q) ||
      customer.address?.toLowerCase().includes(q)
    );
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= customersTotalPages) {
      setCustomersPage(newPage);
    }
  };

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
      <AdminSidebar activeTab="customers" />

      {/* Main Console Area */}
      <main className="flex-1 py-8 px-6 sm:px-10 overflow-y-auto z-10 space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col gap-1 border-b border-slate-900 pb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> Customers Registry Control
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
            Audit registered gourmet food customers, track user access credentials, and manage system login status.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by customer name, email, phone or address..."
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

        {/* Customers Listing Grid */}
        {isLoadingCustomers ? (
          <div className="py-24 text-center">
            <Loader />
            <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Querying customer registry...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 bg-slate-900/20 border border-slate-900 rounded-3xl text-center p-8 text-slate-500 font-bold uppercase tracking-widest text-xs">
            No registered customers matched your search criteria.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCustomers.map((customer, index) => {
                const isActive = customer.status === 'ACTIVE';
                const initial = customer.name ? customer.name.charAt(0).toUpperCase() : 'C';
                
                return (
                  <div 
                    key={index}
                    className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-slate-700/80 transition-colors group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-orange-500 font-black text-lg shrink-0 uppercase shadow-md">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-white text-sm truncate uppercase tracking-tight">
                              {customer.name || 'Gourmet Customer'}
                            </h4>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md mt-1 ${
                              isActive
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50'
                                : 'bg-red-950/60 text-red-400 border border-red-900/50'
                            }`}>
                              {isActive ? 'ACTIVE' : 'SUSPENDED'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-850 pt-4 space-y-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                        <p className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-500 font-black">Email:</span> 
                          <span className="text-slate-300 font-bold">{customer.email || 'N/A'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-500 font-black">Phone:</span> 
                          <span className="text-slate-300 font-bold">{customer.phone || 'N/A'}</span>
                        </p>
                        <p className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-500 font-black">Address:</span> 
                          <span className="text-slate-300 font-bold">{customer.address || 'Dhaka, Bangladesh'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 border-t border-slate-850 pt-4">
                      <button
                        onClick={() => statusMutation.mutate({ userId: customer.userId, status: 'ACTIVE' })}
                        disabled={isActive || statusMutation.isLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-900/50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ShieldCheck className="w-4 h-4" /> Activate
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ userId: customer.userId, status: 'INACTIVE' })}
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

            {/* Pagination Controls */}
            {customersTotalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <button
                  onClick={() => handlePageChange(customersPage - 1)}
                  disabled={customersPage === 1}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Page {customersPage} of {customersTotalPages}
                </span>
                <button
                  onClick={() => handlePageChange(customersPage + 1)}
                  disabled={customersPage === customersTotalPages}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
