'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, CreditCard, MapPin, Phone, User, CheckCircle, Ticket, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/store';
import { createOrder } from '@/services/orderApi';
import { getCustomerProfile } from '@/services/customerApi';
import Loader from '@/components/ui/Loader';
import Notification from '@/components/shared/Notification';

export default function CheckoutPage() {
  const router = useRouter();
  
  // Zustand Cart Store hooks
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const totalItems = useCartStore((state) => state.getTotalItems());

  // Local component states
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // stores order response
  const [notification, setNotification] = useState(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Form details
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Fetch customer profile details if logged in
        if (parsedUser.role === 'CUSTOMER') {
          fetchCustomerProfile(parsedUser.id);
        }
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
  }, []);

  const fetchCustomerProfile = async (userId) => {
    setLoadingProfile(true);
    try {
      const response = await getCustomerProfile(userId);
      if (response && response.data) {
        setFormData({
          phone: response.data.phone || '',
          address: response.data.address || '',
          notes: '',
        });
      }
    } catch (err) {
      console.error('Error fetching customer profile', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'DELICIOUS50') {
      if (totalPrice < 150) {
        setNotification({
          type: 'error',
          message: 'Min order amount for DELICIOUS50 coupon is 150 BDT.',
        });
        return;
      }
      setDiscountAmount(50);
      setCouponApplied(true);
      setNotification({
        type: 'success',
        message: 'Promo coupon DELICIOUS50 applied! Saved 50 BDT.',
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Invalid coupon code. Try "DELICIOUS50".',
      });
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Contact number is required';
    } else if (formData.phone.length < 10) {
      tempErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address.trim()) {
      tempErrors.address = 'Delivery address is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        phone: formData.phone,
        address: formData.address,
        discount: discountAmount,
        items: cartItems.map((item) => ({
          productId: Number(item.id),
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(user.id, orderPayload);
      if (response && response.success) {
        setOrderSuccess(response.data);
        clearCart(); // clear state
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Failed to place order.',
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to place order. Server communication error.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  // Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-400 to-green-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/25">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order Placed!</h2>
            <p className="text-sm font-semibold text-orange-600">Order ID: #{orderSuccess.id}</p>
            <p className="text-sm text-slate-500">
              Your order has been received by our delicious kitchens and is being prepared with top culinary care.
            </p>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 space-y-3.5 text-xs font-semibold text-slate-600">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 uppercase tracking-wide">Status</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md font-bold uppercase tracking-wider text-[9px]">
                {orderSuccess.orderStatus}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400 uppercase tracking-wide">Amount Paid</span>
              <span className="font-extrabold text-slate-800 text-sm">{(orderSuccess.totalAmount || 0).toLocaleString()} BDT</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 uppercase tracking-wide">Delivery Address</span>
              <p className="font-bold text-slate-800 text-sm leading-relaxed">{orderSuccess.address}</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-extrabold text-sm transition-all shadow-md active:scale-95"
          >
            Back to Kitchens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Toast alerts */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in-right">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-md transform group-hover:rotate-12 transition-transform">
              D
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              delicious
            </span>
          </Link>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors py-2 px-4 rounded-xl hover:bg-slate-50 border border-slate-150"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {cartItems.length === 0 ? (
          <div className="max-w-md w-full mx-auto py-16 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your shopping cart is empty</h2>
              <p className="text-sm text-slate-400">Add fresh meals from our kitchens to get started!</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl text-sm transition-all shadow-md active:scale-95"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items & Delivery Details */}
            <div className="lg:col-span-7 space-y-8">
              {/* Order Items Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Your Order Menu ({totalItems} items)
                </h3>
                
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0 items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                          <img
                            src={item.image && item.image.trim().startsWith('http') ? item.image : '/images/defaultImage.jpg'}
                            alt={item.foodName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/images/defaultImage.jpg'; }}
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-sm leading-tight line-clamp-1">{item.foodName}</h4>
                          <p className="text-xs font-semibold text-slate-400">{item.storeName || 'Delicious Kitchen'}</p>
                          <span className="text-xs font-black text-slate-900 block">{item.price.toLocaleString()} BDT</span>
                        </div>
                      </div>

                      {/* Quantity & Trash actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-1 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Delivery Details
                </h3>

                {!user ? (
                  <div className="bg-orange-50/55 rounded-2xl p-5 border border-orange-100 flex items-start gap-4 text-orange-800">
                    <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                    <div className="space-y-3 flex-1">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">Sign in to check out</h4>
                        <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                          Logging in enables delivery tracking, automated address pre-filling, and promotional discounts!
                        </p>
                      </div>
                      <Link
                        href="/login?redirect=/checkout"
                        className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95"
                      >
                        Sign In Now
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="space-y-5">
                    {/* User profile prefilled indicator */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold text-slate-500">
                      <div className="w-8 h-8 rounded-xl bg-orange-100/50 flex items-center justify-center text-orange-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-800 font-extrabold">Logged in as {user.name}</p>
                        <p className="text-[10px] text-slate-400">Details are synced with your customer account profile.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Phone Contact */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                          Contact Phone Number
                        </label>
                        <div className="relative rounded-2xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Phone className="h-4 w-4 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            name="phone"
                            placeholder="e.g. 01712345678"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={loadingProfile}
                            className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all text-sm
                              ${errors.phone ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-100 focus:border-orange-500'}`}
                          />
                        </div>
                        {errors.phone && <p className="text-[11px] font-bold text-red-500">{errors.phone}</p>}
                      </div>
                      
                      {/* Name placeholder (Read only) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                          Delivery Customer
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          disabled
                          className="block w-full px-4 py-3 bg-slate-100 border border-slate-150 rounded-2xl text-slate-500 font-semibold cursor-not-allowed text-sm"
                        />
                      </div>
                    </div>

                    {/* Address Text Area */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                        Full Delivery Address
                      </label>
                      <textarea
                        name="address"
                        rows="3"
                        placeholder="House / Apartment no, Street Name, Area / City"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={loadingProfile}
                        className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all text-sm
                          ${errors.address ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-100 focus:border-orange-500'}`}
                      />
                      {errors.address && <p className="text-[11px] font-bold text-red-500">{errors.address}</p>}
                    </div>

                    {/* Rider Notes */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                        Rider Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        name="notes"
                        placeholder="Leave at reception, call when outside, etc."
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={loadingProfile}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-semibold placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all text-sm"
                      />
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Payment & Grand Total Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  Order Summary
                </h3>

                {/* Coupon Code Slot */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wide">
                    Have a promo coupon?
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Ticket className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Try 'DELICIOUS50'"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied}
                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-extrabold placeholder-slate-400 uppercase tracking-wide focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || !couponCode.trim()}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:bg-slate-100 disabled:text-slate-350 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-[10px] font-black text-emerald-600 tracking-wide uppercase">
                      Promo code Applied successfully!
                    </p>
                  )}
                </div>

                {/* Subtotals & Calculations */}
                <div className="border-t border-slate-100 pt-6 space-y-3.5 text-sm font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-extrabold text-slate-800">{totalPrice.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-extrabold text-emerald-600 uppercase tracking-wide text-xs">FREE</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Promo Discount</span>
                      <span className="font-extrabold">-{discountAmount.toLocaleString()} BDT</span>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-slate-800">
                    <div>
                      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Total Amount</p>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        {Math.max(0, totalPrice - discountAmount).toLocaleString()} BDT
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black border border-amber-250 uppercase tracking-wider">
                        Cash on Delivery
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  type="submit"
                  disabled={isSubmitting || !user}
                  onClick={handleSubmitOrder}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-extrabold text-base transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] disabled:from-slate-100 disabled:to-slate-150 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    'Processing Order...'
                  ) : !user ? (
                    'Sign In to Checkout'
                  ) : (
                    <>Place Order & Deliver</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
