'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAllProducts } from '@/services/productApi';
import { Clock, Star, Store, Eye, ShoppingCart, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function ProductSection({ categoryName = 'All', page = 1, onPageChange }) {
  const router = useRouter();
  const pageSize = 8; // Fetch 8 products per page for a balanced grid

  // React Query fetching with compound key to automatically refresh on filter/page change
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', categoryName, page],
    queryFn: () => getAllProducts({ categoryName, page, size: pageSize }),
    keepPreviousData: true, // keeps layout stable during loading next page
  });

  // Extract from Spring Boot page data
  // Response structure: { success: true, message: "...", data: { content: [...], totalPages: 10, totalElements: 80 } }
  const productsList = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalElements = data?.data?.totalElements || 0;

  // Format pricing cleanly with BDT and proper spacing
  const formatPrice = (price) => {
    if (!price) return '0 BDT';
    return `${Number(price).toLocaleString()} BDT`;
  };

  // Safe image path check, fallback to public folder defaultImage
  const getProductImage = (imagePath) => {
    if (imagePath && imagePath.trim().startsWith('http')) {
      return imagePath;
    }
    return '/images/defaultImage.jpg';
  };

  // Skeleton Loader for Products
  if (isLoading) {
    return (
      <div className="w-full py-8 space-y-6">
        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(pageSize)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse space-y-4 pb-6">
              <div className="w-full h-48 bg-slate-200" />
              <div className="px-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 bg-slate-200 rounded-xl w-1/2" />
                  <div className="h-8 bg-slate-200 rounded-xl w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4 bg-red-50/50 border border-red-100 rounded-3xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Failed to load meals</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
          There was an error communicating with the Delicious backend service. Please check if the server is running.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (productsList.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4 bg-slate-50 border border-slate-100 rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">No delicious meals here yet</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
          There are no products listed under the "{categoryName}" category right now.
        </p>
        {categoryName !== 'All' && (
          <button
            onClick={() => onPageChange(1)} // Wait, reset pagination and categories
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            Show All Products
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full py-8 space-y-8">
      {/* Title & Count Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Popular {categoryName !== 'All' ? categoryName : 'Meals'}
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
            Found {totalElements} items matching filter
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productsList.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image section */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
              <img
                src={getProductImage(product.image)}
                alt={product.foodName}
                onError={(e) => {
                  e.target.src = '/images/defaultImage.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlaid badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-[10px] font-extrabold text-orange-600 shadow-sm uppercase tracking-wide">
                  {product.category?.name || 'Food'}
                </span>
                
                {product.price > 300 && (
                  <span className="px-2.5 py-1 bg-orange-600 text-white rounded-lg text-[10px] font-extrabold shadow-sm uppercase tracking-wide">
                    Popular
                  </span>
                )}
              </div>
            </div>

            {/* Content section */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
                  {product.foodName}
                </h3>
                
                {/* Store & prep details */}
                <div className="flex flex-col gap-1 text-slate-500 font-semibold text-xs">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-orange-500" />
                    <span className="truncate">{product.storeName || 'Delicious Kitchen'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prep Time: {product.makingTime || 15} mins</span>
                  </div>
                </div>
              </div>

              {/* Pricing, Rating, and Actions */}
              <div className="space-y-4 pt-3 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                  
                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>4.5</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-600 text-xs font-bold transition-all bg-white hover:bg-orange-50/20 active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  <button
                    onClick={() => {
                      // Trigger Add to Cart logic
                      alert(`${product.foodName} added to cart!`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs font-bold transition-all shadow-md hover:shadow-orange-500/10 active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-8 flex items-center justify-center gap-2 border-t border-slate-100">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90
              ${page === 1
                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 bg-white hover:border-orange-500 hover:text-orange-500 shadow-sm'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            const isActive = pageNumber === page;
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-90 shadow-sm
                  ${isActive
                    ? 'bg-gradient-to-tr from-orange-500 to-red-500 text-white border-transparent'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500'
                  }
                `}
              >
                {pageNumber}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90
              ${page === totalPages
                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 bg-white hover:border-orange-500 hover:text-orange-500 shadow-sm'
              }
            `}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
