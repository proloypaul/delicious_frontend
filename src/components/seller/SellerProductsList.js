'use client';

import React from 'react';
import { Package, Clock, Tag, Edit, Trash2 } from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function SellerProductsList({
  products,
  totalElements,
  isLoadingProducts,
  openAddModal,
  openEditModal,
  openDeleteModal,
  page,
  totalPages,
  setPage
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" />
          Manage Inventory
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          Showing {products.length} of {totalElements} products
        </span>
      </div>

      {isLoadingProducts ? (
        <div className="py-24 text-center">
          <Loader />
          <p className="text-sm font-semibold text-slate-400 mt-4">Loading your kitchen catalogue...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center max-w-sm mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-800 text-sm">No food items added yet</h4>
            <p className="text-xs text-slate-400">Start adding delicious meals to your kitchen and take orders!</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Add Your First Meal
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {products.map((product) => (
            <div
              key={product.id}
              className="px-6 py-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/30 transition-colors"
            >
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-150 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <img
                    src={product.image && product.image.trim().startsWith('http') ? product.image : '/images/defaultImage.jpg'}
                    alt={product.foodName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/defaultImage.jpg'; }}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-slate-900 text-sm">{product.foodName}</h4>
                    <span className="px-2 py-0.5 bg-orange-50 text-orange-700 font-extrabold text-[9px] rounded uppercase tracking-wide border border-orange-100">
                      {product.categoryName || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-550 font-semibold leading-relaxed max-w-md line-clamp-1">
                    {product.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-350" /> {product.makingTime} mins
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-355" /> ID: #{product.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col md:flex-row items-center gap-4 self-end sm:self-center">
                <div className="text-right sm:pr-4">
                  <p className="text-xs font-black text-slate-450 uppercase tracking-wide">Price</p>
                  <span className="text-base font-black text-slate-950 block">{(product.price || 0).toLocaleString()} BDT</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${
                    product.status === 'APPROVED' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                      : 'bg-slate-50 text-slate-505 border-slate-200'
                  }`}>
                    {product.status}
                  </span>
                  
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 border border-slate-150 hover:border-orange-500 hover:text-orange-600 rounded-xl bg-white text-slate-500 shadow-sm transition-all"
                    title="Edit meal details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openDeleteModal(product)}
                    className="p-2 border border-slate-150 hover:border-red-500 hover:text-red-650 rounded-xl bg-white text-slate-400 shadow-sm transition-all"
                    title="Remove product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoadingProducts && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-2 bg-slate-50/50">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-extrabold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
