'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById, getAllProducts } from '@/services/productApi';
import { createReview, getReviewsByProduct } from '@/services/reviewApi';
import { ArrowLeft, Clock, Star, Store, Plus, Minus, ShoppingBag, ShoppingCart, Heart, Tag, ChevronRight, MessageSquare, Send, Award, ThumbsUp } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { useCartStore } from '@/store/store';
import Notification from '@/components/shared/Notification';

export default function ProductDetailsPage({ params }) {
  const router = useRouter();
  
  // Safe Next.js 15 Promise params unwrapping
  const resolvedParams = React.use(params);
  const productId = resolvedParams?.id;

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const [notification, setNotification] = useState(null);

  // Reviews integration states
  const [user, setUser] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMessage, setReviewMessage] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Fetch product reviews
  const { data: reviewsResponse, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: () => getReviewsByProduct(productId),
    enabled: !!productId,
  });

  const reviewsList = reviewsResponse?.data || [];
  
  const totalReviewsCount = reviewsList.length;
  const averageRating = totalReviewsCount > 0
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / totalReviewsCount).toFixed(1)
    : '4.8';

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (payload) => createReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['productReviews', productId]);
      setReviewMessage('');
      setReviewRating(5);
      setNotification({
        type: 'success',
        message: 'Thank you! Your gourmet review has been published.',
      });
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to publish review.',
      });
    },
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      setNotification({
        type: 'error',
        message: 'Please login to submit a review.',
      });
      return;
    }
    if (!reviewMessage.trim()) {
      setNotification({
        type: 'error',
        message: 'Review message cannot be empty.',
      });
      return;
    }
    submitReviewMutation.mutate({
      rating: reviewRating,
      message: reviewMessage,
      productId: Number(productId),
      customerId: user.id,
    });
  };

  // 1. Fetch Main Product Details
  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  const product = productData?.data;
  const categoryName = product?.category?.name || '';

  // 2. Fetch Related Products dynamically under the same category
  const { data: relatedData, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['relatedProducts', categoryName, productId],
    queryFn: () => getAllProducts({ categoryName, page: 1, size: 5 }),
    enabled: !!categoryName,
  });

  // Filter out the current product from related list
  const relatedProducts = (relatedData?.data?.content || [])
    .filter((item) => String(item.id) !== String(productId))
    .slice(0, 4);

  // Safe Fallback Food Image
  const getProductImage = (imagePath) => {
    if (imagePath && imagePath.trim().startsWith('http')) {
      return imagePath;
    }
    return '/images/defaultImage.jpg';
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(20, prev + 1));
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setNotification({
      type: 'success',
      message: `Successfully added ${quantity}x ${product?.foodName} to your cart!`,
    });
  };

  // Loading Indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader />
          <p className="text-sm font-bold text-slate-500">Preparing meal details...</p>
        </div>
      </div>
    );
  }

  // Error/Not found state
  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
          <ArrowLeft className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Meal details not found</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
          This product is currently unavailable or the server connection was lost.
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-sm font-bold shadow-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Menu
        </button>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in-right">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
      {/* Sticky Premium Navbar */}
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
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </button>
        </div>
      </header>

      {/* Main Details Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-500">{product.category?.name || 'Category'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-orange-600 truncate max-w-[150px]">{product.foodName}</span>
        </div>

        {/* Dynamic Two-Column Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Food Media Showcase */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm relative space-y-6">
            <div className="relative h-[280px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-50">
              <img
                src={getProductImage(product.image)}
                alt={product.foodName}
                onError={(e) => {
                  e.target.src = '/images/defaultImage.jpg';
                }}
                className="w-full h-full object-cover"
              />
              
              {/* Overlaid Float Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl text-xs font-black text-orange-600 shadow-sm uppercase tracking-wide">
                  <Tag className="w-3.5 h-3.5" /> {product.category?.name || 'Fresh'}
                </span>
              </div>

              {/* Wishlist Interactive Badge */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-90 transition-all"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            
            {/* Quick specifications banner */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Preparation</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-slate-800 font-extrabold text-sm sm:text-base">
                  <Clock className="w-4 h-4 text-orange-500" /> {product.makingTime || 15} mins
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Rating</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-slate-800 font-extrabold text-sm sm:text-base">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {averageRating} / 5.0
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Delivery</p>
                <p className="mt-1 text-slate-800 font-extrabold text-xs sm:text-sm">Fast Drop</p>
              </div>
            </div>
          </div>

          {/* Column 2: Information & Purchase Options */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              
              {/* Headings */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {product.foodName}
                </h1>
                
                {/* Store mapping details */}
                <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <Store className="w-4 h-4" />
                  </div>
                  <span>Kitchen: <strong className="text-slate-700">{product.storeName || 'Delicious Kitchen Hub'}</strong></span>
                </div>
              </div>

              {/* Description box */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Description</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {product.description || 'No detailed description available for this delicious recipe. Prepared using premium ingredients under strict hygiene standards.'}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Price per unit</p>
                    <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                      {Number(product.price).toLocaleString()} BDT
                    </span>
                  </div>
                  
                  {/* Quantity adjustment capsules */}
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mr-1 mb-1">Quantity</p>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-1.5 shadow-sm">
                      <button
                        onClick={handleDecrement}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center transition-all active:scale-90"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-black text-slate-800 w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500 flex items-center justify-center transition-all active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtotal block */}
                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100/50 flex justify-between items-center text-sm font-bold text-orange-800">
                  <span>Subtotal Amount:</span>
                  <span className="text-base font-extrabold">{totalPrice.toLocaleString()} BDT</span>
                </div>

                {/* Purchase Triggers */}
                <button
                  onClick={handleAddToCart}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-extrabold text-base transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Shopping Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gourmet Reviews System Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-10 border-t border-slate-200">
          
          {/* Left Column: Customer Review Cards */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-500 animate-pulse" /> Customer Reviews ({totalReviewsCount})
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Real ratings and feedback shared by our verified diners.</p>
              </div>

              {/* Quick Overall Average Rating */}
              <div className="flex items-center gap-2 bg-orange-50/50 border border-orange-100 rounded-2xl px-4 py-2 shrink-0 self-start sm:self-auto">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-spin-slow" />
                <span className="text-sm font-black text-slate-800">{averageRating}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">/ 5.0</span>
              </div>
            </div>

            {/* List of Reviews */}
            {isLoadingReviews ? (
              <div className="py-12 text-center"><Loader /></div>
            ) : reviewsList.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                No gourmet reviews posted for this meal yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((review, i) => {
                  const ratingStars = Array.from({ length: 5 }, (_, index) => index < review.rating);
                  const reviewerName = review.customerName || 'Verified Diner';
                  const initial = reviewerName.charAt(0).toUpperCase();
                  
                  return (
                    <div 
                      key={review.id || i}
                      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex gap-4 items-start hover:border-slate-200 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm uppercase">
                        {initial}
                      </div>
                      
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <h5 className="font-extrabold text-slate-800 text-sm truncate uppercase tracking-tight">
                            {reviewerName}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">
                            Verified Customer
                          </span>
                        </div>

                        {/* Stars displaying rating */}
                        <div className="flex items-center gap-0.5">
                          {ratingStars.map((filled, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3.5 h-3.5 ${filled ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed font-semibold uppercase tracking-wide">
                          {review.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Write a Review Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" /> Share Your Opinion
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Your review will help kitchens and riders optimize meal drop services.</p>
              </div>

              {/* Login gate check */}
              {!user ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-4">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                    Please log in with a customer account to publish your meal feedback and rate this chef!
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95"
                  >
                    Log In Now
                  </button>
                </div>
              ) : user.role !== 'CUSTOMER' ? (
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 text-center text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Only customers are authorized to submit meal reviews.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rating stars</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform active:scale-90"
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              star <= reviewRating 
                                ? 'text-amber-500 fill-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]' 
                                : 'text-slate-200'
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider ml-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {reviewRating === 5 ? 'Excellent' : reviewRating === 4 ? 'Very Good' : reviewRating === 3 ? 'Good' : reviewRating === 2 ? 'Fair' : 'Poor'}
                      </span>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Your feedback</label>
                    <textarea
                      rows={4}
                      value={reviewMessage}
                      onChange={(e) => setReviewMessage(e.target.value)}
                      placeholder="Write your review here... How was the taste, presentation, and preparation time?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                      maxLength={1000}
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submitReviewMutation.isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4" /> Submit Gourmet Review
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Dynamic Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-slate-200">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                More from {categoryName || 'this category'}
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                You might also enjoy these fresh recipes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setQuantity(1);
                    router.push(`/products/${item.id}`);
                  }}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getProductImage(item.image)}
                      alt={item.foodName}
                      onError={(e) => {
                        e.target.src = '/images/defaultImage.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate group-hover:text-orange-600 transition-colors">
                      {item.foodName}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        {Number(item.price).toLocaleString()} BDT
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>4.5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-sm font-medium border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
