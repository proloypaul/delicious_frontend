'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Store, ChevronLeft, ChevronRight, ChefHat, MapPin, Phone } from 'lucide-react';
import { getAllSellers } from '@/services/sellerApi';
import Loader from '@/components/ui/Loader';

export default function HomeSellersSection() {
  const [sellersPage, setSellersPage] = useState(1);

  // Fetch partner kitchens (Sellers) paginated
  const { data: sellersResponse, isLoading: isLoadingSellers } = useQuery({
    queryKey: ['homeSellers', sellersPage],
    queryFn: () => getAllSellers({ page: sellersPage, size: 4 }), // 4 per page
    keepPreviousData: true,
  });

  const sellersList = sellersResponse?.data?.content || [];
  const sellersTotalPages = sellersResponse?.data?.totalPages || 1;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-orange-500" /> Featured Partner Kitchens
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Authentic, home-cooked food prepared by passionate home cooks in your locality.
          </p>
        </div>

        {/* Pagination Controls */}
        {sellersTotalPages > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setSellersPage((p) => Math.max(1, p - 1))}
              disabled={sellersPage === 1}
              className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
              Page {sellersPage} of {sellersTotalPages}
            </span>
            <button
              onClick={() => setSellersPage((p) => Math.min(sellersTotalPages, p + 1))}
              disabled={sellersPage === sellersTotalPages}
              className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isLoadingSellers ? (
        <div className="py-12 text-center"><Loader /></div>
      ) : sellersList.length === 0 ? (
        <div className="py-12 bg-white border border-slate-100 rounded-3xl text-center p-8 text-slate-400 font-semibold uppercase text-xs">
          No registered kitchen partners found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sellersList.map((seller) => (
            <div 
              key={seller.userId}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                <img 
                  src="/images/restaurantDefaultImage.jpg"
                  alt={seller.storeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[9px] font-black text-orange-600 tracking-wider uppercase rounded-full shadow-sm">
                  <ChefHat className="w-3 h-3 text-orange-500" /> Kitchen
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors text-sm truncate uppercase tracking-tight">
                    {seller.storeName || 'Partner Kitchen'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 min-h-[32px]">
                    {seller.description || 'Passionate chef preparing exquisite family recipes and healthy home-style cooked cuisine.'}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-50 pt-3 text-[11px] text-slate-600 font-semibold">
                  <p className="flex items-center gap-2 text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {seller.address || 'Dhaka, Bangladesh'}
                  </p>
                  <p className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {seller.phone || 'Contact Private'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
