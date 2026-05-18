'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bike, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  ShoppingBag, 
  Check,
  FileText,
  X 
} from 'lucide-react';
import { getRiderOrders, updateDeliveryStatus } from '@/services/riderApi';
import { getOrderById } from '@/services/orderApi';
import Loader from '@/components/ui/Loader';

export default function RiderActiveTab({ riderId, showSuccess, showError }) {
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Fetch orders assigned to this rider
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['riderActiveOrders', riderId],
    queryFn: () => getRiderOrders(riderId, { page: 1, size: 50 }),
  });

  // Detailed single order fetch for modal
  const { data: orderDetailsResponse, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['riderOrderDetails', activeItem?.id],
    queryFn: () => getOrderById(activeItem.id),
    enabled: !!activeItem?.id,
  });

  const assignedOrders = ordersResponse?.data?.content || [];
  const selectedOrder = orderDetailsResponse?.data;

  // Filter orders into Active Routing Sheet and Completed Delivery log
  const activeDeliveries = assignedOrders.filter(
    (order) => order.orderStatus === 'ACCEPTED_BY_RIDER' || order.orderStatus === 'PICKED_UP'
  );

  const completedDeliveries = assignedOrders.filter(
    (order) => order.orderStatus === 'DELIVERED'
  );

  // Status Stepper mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateDeliveryStatus(orderId, status, riderId),
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Delivery status updated successfully!');
        queryClient.invalidateQueries(['riderActiveOrders', riderId]);
        if (activeItem?.id) {
          queryClient.invalidateQueries(['riderOrderDetails', activeItem.id]);
        }
      } else {
        showError(res.message || 'Failed to update delivery status.');
      }
    },
    onError: (err) => showError(err.message || 'API Communication Error.')
  });

  const handleUpdateStatus = (orderId, currentStatus) => {
    let nextStatus = 'DELIVERED';
    if (currentStatus === 'ACCEPTED_BY_RIDER') {
      nextStatus = 'PICKED_UP';
    }
    updateStatusMutation.mutate({ orderId, status: nextStatus });
  };

  const openInvoiceModal = (order) => {
    setActiveItem(order);
    setIsInvoiceOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader />
        <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest animate-pulse">Loading assigned routing lists...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* SECTION 1: Active Routing Sheet */}
      <div className="space-y-6">
        <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Bike className="w-4.5 h-4.5 text-orange-500" /> Active routing Sheet ({activeDeliveries.length})
          </h3>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">In Transit</span>
        </div>

        {activeDeliveries.length === 0 ? (
          <div className="py-16 bg-slate-905 border border-slate-850/80 rounded-3xl text-center p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-850 flex items-center justify-center text-slate-600 mx-auto">
              <Bike className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-extrabold text-sm text-slate-350 uppercase tracking-wider">No Active Deliveries</h4>
              <p className="text-xs text-slate-505 font-medium leading-relaxed">
                You have no active runs. Head to the <span className="text-orange-500 font-bold">"Available Jobs"</span> tab to accept pending jobs and start earning.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeDeliveries.map((order) => {
              const currentStep = getMilestoneIndex(order.orderStatus);
              return (
                <div 
                  key={order.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm transition-all hover:border-slate-750"
                >
                  {/* Top line */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-950 text-slate-400 border border-slate-850 text-[9px] font-black tracking-widest uppercase rounded-lg">
                          Order #{order.id}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded-lg border ${
                          order.orderStatus === 'ACCEPTED_BY_RIDER' 
                            ? 'bg-indigo-955/40 text-indigo-400 border-indigo-900/40' 
                            : 'bg-purple-955/40 text-purple-400 border-purple-900/40'
                        }`}>
                          {order.orderStatus === 'ACCEPTED_BY_RIDER' ? 'Claimed' : 'In Transit'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-505 font-bold uppercase tracking-wider mt-2.5">
                        Accepted at: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openInvoiceModal(order)}
                        className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Invoice
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, order.orderStatus)}
                        disabled={updateStatusMutation.isPending}
                        className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all active:scale-[0.98] shadow-md shadow-orange-505/10 flex items-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {order.orderStatus === 'ACCEPTED_BY_RIDER' ? 'Mark Picked Up' : 'Mark Delivered'}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-850"></div>

                  {/* Horizontal Stepper Progress Indicator */}
                  <div className="py-4">
                    <div className="relative">
                      {/* Timeline bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                        style={{ width: `${(Math.max(0, currentStep) / (statusMilestones.length - 1)) * 100}%` }}
                      ></div>

                      {/* Stepper nodes */}
                      <div className="relative z-10 flex justify-between">
                        {statusMilestones.map((milestone, idx) => {
                          const isCompleted = idx <= currentStep;
                          const isActive = idx === currentStep;

                          return (
                            <div key={milestone.key} className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 border-transparent text-white' 
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                              } ${isActive ? 'ring-4 ring-orange-500/20 scale-110' : ''}`}>
                                {isCompleted ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                                ) : (
                                  <span className="text-[10px] font-black">{idx + 1}</span>
                                )}
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-wider mt-2.5 transition-colors ${
                                isCompleted ? 'text-slate-350' : 'text-slate-505'
                              }`}>
                                {milestone.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-850"></div>

                  {/* Recipient breakdown grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Deliver To</span>
                      <p className="text-slate-300 font-semibold leading-relaxed">{order.address || 'Address Not Found'}</p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Customer contact</span>
                      <p className="text-slate-300 font-bold flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" /> {order.phone || 'No Contact Number'}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Completed Delivery Log */}
      <div className="space-y-6">
        <div className="border-b border-slate-850 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" /> Completed Runs ({completedDeliveries.length})
          </h3>
        </div>

        {completedDeliveries.length === 0 ? (
          <div className="py-12 bg-slate-900/20 border border-slate-855 border-dashed rounded-3xl text-center p-8 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Completed deliveries will be listed here.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-405">
                    <th className="py-4.5 px-6">Order ID</th>
                    <th className="py-4.5 px-6">Recipient Info</th>
                    <th className="py-4.5 px-6">Delivery Address</th>
                    <th className="py-4.5 px-6 text-center">Payout</th>
                    <th className="py-4.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 font-semibold text-xs text-slate-350">
                  {completedDeliveries.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-955/35 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-white">#{order.id}</span>
                        <p className="text-[9px] text-slate-505 uppercase mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col font-bold text-slate-300">
                          <span>{order.customer?.name || 'Customer'}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{order.phone || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate" title={order.address}>
                        {order.address || 'Kitchen Pick Up'}
                      </td>
                      <td className="py-4 px-6 text-center font-black text-emerald-400">
                        +{(order.totalAmount || 0).toLocaleString()} BDT
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openInvoiceModal(order)}
                          className="inline-flex p-2 hover:bg-slate-850 hover:text-white rounded-xl text-slate-400 transition-all border border-slate-800 hover:border-slate-700"
                          title="View Invoice Sheet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detailed Breakdown Modal Overlay */}
      {isInvoiceOpen && activeItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-up">
            
            {/* Modal Header Logo */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Order Delivery Sheet
                </h3>
              </div>
              <button 
                onClick={() => { setIsInvoiceOpen(false); setActiveItem(null); }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="py-16 text-center">
                <Loader />
                <p className="text-[10px] font-bold text-slate-500 mt-3 uppercase tracking-widest">Opening invoice safe...</p>
              </div>
            ) : !selectedOrder ? (
              <div className="py-12 text-center text-xs font-bold text-red-400 uppercase tracking-widest">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                Failed to open invoice sheet data.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Stepper overview */}
                <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-450">Active Status Milestone</h4>
                    <p className="text-sm font-black text-white mt-1 uppercase tracking-wider">{selectedOrder.orderStatus}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-[9px] font-black tracking-wider uppercase border rounded-lg ${
                    selectedOrder.orderStatus === 'DELIVERED' 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' 
                      : 'bg-orange-950/40 text-orange-400 border-orange-900/50 animate-pulse'
                  }`}>
                    {selectedOrder.orderStatus === 'DELIVERED' ? 'Delivery Completed' : 'In Transit Workflow'}
                  </span>
                </div>

                {/* Delivery Information Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Customer Information
                    </h4>
                    <div className="space-y-1 font-semibold text-xs text-slate-350">
                      <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-slate-605" /> {selectedOrder.customerPhone || 'Anonymous'}</p>
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
                <div className="bg-slate-955 border border-slate-850 rounded-2xl p-4.5 space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between text-xs font-semibold text-slate-455">
                    <span>Subtotal</span>
                    <span>{((selectedOrder.totalAmount || 0) - (selectedOrder.deliveryFee || 0)).toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-455">
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
