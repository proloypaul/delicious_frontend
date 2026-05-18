'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, Bike, MapPin, Phone, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { getAllOrders } from '@/services/orderApi';
import { updateDeliveryStatus } from '@/services/riderApi';
import Loader from '@/components/ui/Loader';

export default function RiderJobsTab({ riderId, showSuccess, showError }) {
  const queryClient = useQueryClient();

  // Query all system orders
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['systemAvailableOrders'],
    queryFn: () => getAllOrders({ page: 1, size: 100 }),
    refetchInterval: 5000, // Refresh every 5 seconds to catch new jobs
  });

  const allOrders = ordersResponse?.data?.content || [];

  // Filter orders that are ready for delivery (PENDING or PROCESSING) and have NO rider assigned
  const availableJobs = allOrders.filter(
    (order) => 
      (order.orderStatus === 'PROCESSING' || order.orderStatus === 'PENDING') && 
      (!order.rider || !order.rider.id)
  );

  // Claim Order Mutation
  const claimMutation = useMutation({
    mutationFn: ({ orderId }) => updateDeliveryStatus(orderId, 'ACCEPTED_BY_RIDER', riderId),
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Delivery accepted! Order is now in your active deliveries sheet.');
        queryClient.invalidateQueries(['systemAvailableOrders']);
        queryClient.invalidateQueries(['riderActiveOrders', riderId]);
      } else {
        showError(res.message || 'Failed to claim delivery job.');
      }
    },
    onError: (err) => {
      showError(err.message || 'API Communication Error. Could not claim delivery.');
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader />
        <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest animate-pulse">Scanning available dispatch requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Statistics Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
            <Compass className="w-5 h-5 text-orange-500 animate-spin" /> Available Jobs Pool
          </h3>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Grab outstanding kitchen prepared orders before other delivery riders claim them.
          </p>
        </div>
        <div className="bg-slate-950/60 border border-slate-850 px-5 py-3.5 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-orange-950/60 flex items-center justify-center text-orange-400 font-black text-lg">
            {availableJobs.length}
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Offers</h4>
            <p className="text-[9px] text-slate-505 font-bold uppercase mt-0.5">Updated just now</p>
          </div>
        </div>
      </div>

      {/* Available Jobs list */}
      {availableJobs.length === 0 ? (
        <div className="py-20 bg-slate-900/50 border border-slate-850 rounded-3xl text-center flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-850 flex items-center justify-center text-slate-650">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h4 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider">No Available Orders</h4>
            <p className="text-xs text-slate-505 font-medium leading-relaxed">
              Kitchens are currently preparing orders. Keep this page open; new pickup invitations will flash here in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableJobs.map((order) => {
            const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;
            return (
              <div 
                key={order.id} 
                className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-3xl p-6 space-y-5 transition-all duration-300 shadow-sm relative group overflow-hidden"
              >
                {/* Background soft light effect on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-orange-500/10 transition-all"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 text-slate-400 border border-slate-850 text-[9px] font-black tracking-widest uppercase rounded-lg">
                      Order #{order.id}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-450" /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-orange-400">{(order.totalAmount || 0).toLocaleString()} BDT</span>
                    <p className="text-[9px] text-slate-505 font-bold uppercase mt-0.5">Total payout</p>
                  </div>
                </div>

                <div className="h-px bg-slate-850"></div>

                {/* Delivery Logistics */}
                <div className="space-y-3">
                  <div className="flex gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Deliver To</span>
                      <p className="text-slate-300 font-semibold leading-relaxed mt-0.5">{order.address || 'Address Not Found'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Recipient Phone</span>
                      <p className="text-slate-300 font-bold mt-0.5">{order.phone || 'No Phone Number'}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-850"></div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Package details</span>
                    <p className="text-xs text-white font-extrabold mt-0.5">{itemCount} items inside</p>
                  </div>

                  <button
                    onClick={() => claimMutation.mutate({ orderId: order.id })}
                    disabled={claimMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-5 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-slate-800 disabled:to-slate-850 disabled:text-slate-500 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 active:scale-[0.98]"
                  >
                    <Bike className="w-3.5 h-3.5 animate-bounce" />
                    {claimMutation.isPending && claimMutation.variables?.orderId === order.id ? 'Claiming...' : 'Accept Job'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
