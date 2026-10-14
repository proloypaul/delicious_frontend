'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllCoupons, createCoupon } from '@/services/couponApi';
import { Tag, Plus, ChevronLeft, ChevronRight, Check, X, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminCouponsTab({ showSuccess, showError }) {
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');

  // Fetch coupons (paginated)
  const { data: couponsResponse, isLoading, isError } = useQuery({
    queryKey: ['adminCoupons', page],
    queryFn: () => getAllCoupons(page, PAGE_SIZE),
    keepPreviousData: true,
  });

  const couponsPage = couponsResponse?.data;
  const coupons = couponsPage?.content || [];
  const totalPages = couponsPage?.totalPages || 0;
  const totalElements = couponsPage?.totalElements || 0;

  // Create coupon mutation
  const createMutation = useMutation({
    mutationFn: () => createCoupon(
      code.trim().toUpperCase(),
      parseFloat(discountAmount),
      parseFloat(minOrderAmount)
    ),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCoupons']);
      setShowForm(false);
      setCode('');
      setDiscountAmount('');
      setMinOrderAmount('');
      showSuccess('Coupon created successfully!');
    },
    onError: (err) => {
      showError(err?.response?.data?.message || 'Failed to create coupon.');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!code.trim()) return showError('Coupon code is required.');
    if (!discountAmount || parseFloat(discountAmount) <= 0) return showError('Discount amount must be greater than 0.');
    if (!minOrderAmount || parseFloat(minOrderAmount) < 0) return showError('Minimum order amount must be 0 or more.');
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-1">
            {totalElements} total coupon{totalElements !== 1 ? 's' : ''} in the system
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-400" /> Create New Promo Coupon
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Coupon Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE50"
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors uppercase"
              />
            </div>

            {/* Discount Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Discount Amount (BDT) *
              </label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="e.g. 50"
                min="1"
                step="0.01"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Min Order Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Min. Order Amount (BDT) *
              </label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="e.g. 200"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Submit */}
            <div className="sm:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
              >
                {createMutation.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupon List Table */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-xs font-bold uppercase tracking-widest">Loading coupons...</p>
        </div>
      ) : isError ? (
        <div className="py-16 flex flex-col items-center gap-3 text-rose-400">
          <AlertCircle className="w-8 h-8" />
          <p className="text-xs font-bold uppercase tracking-widest">Failed to load coupons</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-500 border border-dashed border-slate-700 rounded-2xl">
          <Tag className="w-10 h-10 text-slate-700" />
          <div className="text-center space-y-1">
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">No coupons yet</p>
            <p className="text-xs text-slate-600">Create your first promo coupon using the button above.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</th>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. Order</th>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires</th>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {coupons.map((coupon, idx) => {
                const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                const isActive = coupon.active && !isExpired;

                return (
                  <tr
                    key={coupon.id || idx}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                        <span className="font-black text-white text-sm tracking-widest uppercase">
                          {coupon.code}
                        </span>
                      </div>
                    </td>

                    {/* Discount Amount */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 text-xs font-black uppercase tracking-wide">
                        ৳ {Number(coupon.discountAmount).toLocaleString()} off
                      </span>
                    </td>

                    {/* Min Order */}
                    <td className="px-5 py-4 text-slate-300 font-bold text-xs">
                      Min. ৳{Number(coupon.minOrderAmount).toLocaleString()}
                    </td>

                    {/* Expiry */}
                    <td className="px-5 py-4">
                      {coupon.expiryDate ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${isExpired ? 'text-rose-400' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(coupon.expiryDate).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 font-bold">No expiry</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Active
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-900/30 border border-rose-700/30 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600/40 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                          <X className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 font-bold">
            Page {page + 1} of {totalPages} &nbsp;·&nbsp; {totalElements} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border text-xs font-black transition-all ${
                    pageNum === page
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
