'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  Clock, 
  Check, 
  Eye, 
  MapPin, 
  Phone, 
  User, 
  AlertCircle,
  FileText,
  X 
} from 'lucide-react';
import { getAllOrders, getOrderById, updateOrderStatus } from '@/services/orderApi';
import Loader from '@/components/ui/Loader';

export default function AdminOrdersTab({ showSuccess, showError }) {
  const queryClient = useQueryClient();
  const [ordersPage, setOrdersPage] = useState(1);

  // Modal States
  const [activeItem, setActiveItem] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Orders Query
  const { data: ordersResponse, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['adminOrders', ordersPage],
    queryFn: () => getAllOrders({ page: ordersPage - 1, size: 50 }),
    keepPreviousData: true,
  });

  // Order Details Query
  const { data: orderDetailsResponse, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['adminOrderDetails', activeItem?.id],
    queryFn: () => getOrderById(activeItem.id),
    enabled: !!activeItem?.id,
  });

  // Orders Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Order status updated successfully!');
        queryClient.invalidateQueries(['adminOrders']);
        if (activeItem?.id) {
          queryClient.invalidateQueries(['adminOrderDetails', activeItem.id]);
        }
      } else {
        showError(res.message || 'Failed to update order status.');
      }
    },
    onError: (err) => showError(err.message || 'API Communication Error.')
  });

  // Data Selectors
  const allOrdersList = ordersResponse?.data?.content || [];
  const selectedOrder = orderDetailsResponse?.data;

  // Status mapping colors & visual timeline indexes
  const statusMilestones = [
    { key: 'PENDING', label: 'Placed' },
    { key: 'PROCESSING', label: 'Preparing' },
    { key: 'ACCEPTED_BY_RIDER', label: 'Assigned' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getMilestoneIndex = (status) => {
    return statusMilestones.findIndex(m => m.key === status);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-955/40 text-amber-400 border border-amber-900/40';
      case 'PROCESSING':
        return 'bg-blue-955/40 text-blue-400 border border-blue-900/40';
      case 'ACCEPTED_BY_RIDER':
        return 'bg-indigo-955/40 text-indigo-400 border border-indigo-900/40';
      case 'PICKED_UP':
        return 'bg-purple-955/40 text-purple-400 border border-purple-900/40';
      case 'DELIVERED':
        return 'bg-emerald-955/40 text-emerald-400 border border-emerald-900/40';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  const openInvoiceModal = (order) => {
    setActiveItem(order);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Order Flows</p>
            <h4 className="text-2xl font-black mt-0.5">{allOrdersList.length}</h4>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p>
            <h4 className="text-2xl font-black mt-0.5">
              {allOrdersList.filter(o => o.orderStatus !== 'DELIVERED').length}
            </h4>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-450 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Check className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Deliveries</p>
            <h4 className="text-2xl font-black mt-0.5">
              {allOrdersList.filter(o => o.orderStatus === 'DELIVERED').length}
            </h4>
          </div>
        </div>
      </div>

      {/* Orders stream table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800/60 bg-slate-900 flex items-center justify-between">
          <h3 className="font-black text-sm tracking-wide uppercase text-slate-350">Order Dispatch Streams</h3>
        </div>

        {isLoadingOrders ? (
          <div className="py-24 text-center">
            <Loader />
            <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Loading Order Streams...</p>
          </div>
        ) : allOrdersList.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-650 mx-auto">
              <ShoppingBag className="w-6.5 h-6.5" />
            </div>
            <h5 className="font-extrabold text-sm text-slate-355">No customer orders placed yet</h5>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850">
                  <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Order ID</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Customer Details</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-wider">Delivery Address</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Cost Price</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Current Status</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {allOrdersList.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-4.5 px-6 font-extrabold text-xs text-white">
                      #{order.id}
                    </td>

                    <td className="py-4.5 px-6">
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-slate-205">{order.customerPhone || 'Guest client'}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{order.paymentMethod || 'CASH'}</p>
                      </div>
                    </td>

                    <td className="py-4.5 px-6 max-w-xs truncate font-semibold text-xs text-slate-400">
                      {order.deliveryAddress || 'On-kitchen pickup'}
                    </td>

                    <td className="py-4.5 px-6 text-right font-black text-xs text-slate-200">
                      {(order.totalAmount || 0).toLocaleString()} BDT
                    </td>

                    <td className="py-4.5 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {/* Status Selectors */}
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateStatusMutation.mutate({ orderId: order.id, status: e.target.value })}
                          disabled={updateStatusMutation.isLoading}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] font-black text-slate-300 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                        >
                          {statusMilestones.map(milestone => (
                            <option key={milestone.key} value={milestone.key} className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                              {milestone.label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => openInvoiceModal(order)}
                          className="p-1.5 border border-slate-800 hover:border-orange-500 hover:text-orange-500 rounded-xl bg-slate-955 text-slate-400 transition-colors"
                          title="View Invoice Sheet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- INVOICE VIEW DETAIL MODAL --- */}
      {isInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-805 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 relative">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5.5 h-5.5 text-orange-500" />
                <h3 className="text-lg font-black uppercase tracking-wide text-white">Invoice Sheet #{activeItem?.id}</h3>
              </div>
              <button onClick={() => setIsInvoiceOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="py-24 text-center">
                <Loader />
                <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Loading invoice data...</p>
              </div>
            ) : !selectedOrder ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs flex flex-col items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <span>Could not retrieve order invoice details.</span>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visual Delivery Stepper Tracker Line */}
                <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450 text-center">Delivery Journey Tracker</h4>
                  
                  <div className="relative pt-2 pb-5 px-3">
                    {/* Background Progress Bar */}
                    <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-800 z-0"></div>
                    
                    {/* Active Progress Bar */}
                    <div 
                      className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 z-0 transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, (getMilestoneIndex(selectedOrder.orderStatus) / (statusMilestones.length - 1)) * 100)}%` 
                      }}
                    ></div>

                    {/* Timeline Milestones */}
                    <div className="relative flex justify-between z-10">
                      {statusMilestones.map((m, idx) => {
                        const isCurrent = selectedOrder.orderStatus === m.key;
                        const isPassed = getMilestoneIndex(selectedOrder.orderStatus) >= idx;
                        
                        return (
                          <div key={m.key} className="flex flex-col items-center gap-2 shrink-0">
                            <div 
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                                isCurrent
                                  ? 'bg-gradient-to-tr from-orange-500 to-red-500 text-white scale-110 ring-4 ring-orange-500/20'
                                  : isPassed
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-slate-800 text-slate-450 border border-slate-700'
                              }`}
                            >
                              {isPassed && !isCurrent ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wide ${
                              isCurrent ? 'text-orange-400 font-extrabold' : 'text-slate-500'
                            }`}>
                              {m.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Delivery Information Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Customer Information
                    </h4>
                    <div className="space-y-1 font-semibold text-xs text-slate-350">
                      <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-slate-600" /> {selectedOrder.customerPhone || 'Anonymous'}</p>
                      <p>Payment: <span className="text-slate-105 font-bold uppercase">{selectedOrder.paymentMethod || 'CASH ON DELIVERY'}</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> Destination address
                    </h4>
                    <p className="text-xs font-semibold text-slate-350 leading-relaxed">
                      {selectedOrder.deliveryAddress || 'On-Kitchen pick up requested'}
                    </p>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-slate-950 border-b border-slate-850">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-450">Purchased Items</h4>
                  </div>
                  
                  <div className="divide-y divide-slate-850">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 bg-slate-955 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={item.productImage && item.productImage.trim().startsWith('http') ? item.productImage : '/images/defaultImage.jpg'}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/images/defaultImage.jpg'; }}
                            />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-xs text-white">{item.productName}</h5>
                            <p className="text-[10px] text-slate-505 font-semibold mt-0.5">Quantity: {item.quantity} units</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-205">{((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString()} BDT</span>
                          <p className="text-[9px] text-slate-500 font-bold mt-0.5">{(item.unitPrice || 0).toLocaleString()} / unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Calculation breakdown sheet */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between text-xs font-semibold text-slate-450">
                    <span>Subtotal</span>
                    <span>{((selectedOrder.totalAmount || 0) - (selectedOrder.deliveryFee || 0)).toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-450">
                    <span>Coupon Discounts</span>
                    <span className="text-emerald-500">- 0 BDT</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-450">
                    <span>Delivery Fees</span>
                    <span>{(selectedOrder.deliveryFee || 0).toLocaleString()} BDT</span>
                  </div>
                  <div className="h-px bg-slate-850 my-2"></div>
                  <div className="flex justify-between text-sm font-black text-white">
                    <span>Final Amount</span>
                    <span className="text-orange-450">{(selectedOrder.totalAmount || 0).toLocaleString()} BDT</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
