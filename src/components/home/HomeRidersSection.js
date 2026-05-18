'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bike, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllRiders } from '@/services/riderApi';
import Loader from '@/components/ui/Loader';

export default function HomeRidersSection() {
  const [ridersPage, setRidersPage] = useState(1);

  // Fetch delivery heroes (Riders) paginated
  const { data: ridersResponse, isLoading: isLoadingRiders } = useQuery({
    queryKey: ['homeRiders', ridersPage],
    queryFn: () => getAllRiders({ page: ridersPage, size: 4 }), // 4 per page
    keepPreviousData: true,
  });

  const ridersList = ridersResponse?.data?.content || [];
  const ridersTotalPages = ridersResponse?.data?.totalPages || 1;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Bike className="w-6 h-6 text-orange-500 animate-bounce" /> Our Delivery Heroes
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Our active dispatch riders bringing warm, delicious home food right to your doorstep.
          </p>
        </div>

        {/* Pagination Controls */}
        {ridersTotalPages > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setRidersPage((p) => Math.max(1, p - 1))}
              disabled={ridersPage === 1}
              className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-55 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
              Page {ridersPage} of {ridersTotalPages}
            </span>
            <button
              onClick={() => setRidersPage((p) => Math.min(ridersTotalPages, p + 1))}
              disabled={ridersPage === ridersTotalPages}
              className="w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-55 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isLoadingRiders ? (
        <div className="py-12 text-center"><Loader /></div>
      ) : ridersList.length === 0 ? (
        <div className="py-12 bg-white border border-slate-100 rounded-3xl text-center p-8 text-slate-400 font-semibold uppercase text-xs">
          No registered delivery heroes found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ridersList.map((rider, index) => (
            <div 
              key={index}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col space-y-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src="/images/riderDefaultImage.jpg"
                    alt={rider.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-sm truncate uppercase tracking-tight">{rider.name}</h4>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider rounded-md mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> GPS Active
                  </span>
                </div>
              </div>

              <div className="h-px bg-slate-50"></div>

              <div className="space-y-2 text-[11px] text-slate-605 font-semibold">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 uppercase text-[9px] font-black tracking-wider">Transport</span>
                  <span className="text-slate-800 font-black uppercase">{rider.vehicleType || 'MOTORCYCLE'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 uppercase text-[9px] font-black tracking-wider">Reg Number</span>
                  <span className="text-slate-800 font-bold tracking-wide uppercase truncate max-w-[140px]">{rider.vehicleRegistrationNumber || 'Dhaka Metro'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
