'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/services/categoryApi';
import { LayoutGrid } from 'lucide-react';

export default function CategorySection({ activeCategory = 'All', onSelectCategory }) {
  // Fetch categories using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(0, 50), // fetch up to 50 categories, then slice
  });

  // Extract content from Spring Boot Page structure wrapped in ApiResponse
  // ApiResponse structure: { success: true, message: "...", data: { content: [...] } }
  const categoriesList = data?.data?.content || [];
  
  // Show ONLY the first 10 categories on the homepage as per requirements
  const displayCategories = categoriesList.slice(0, 10);

  // Fallback image handler
  const getCategoryImage = (imagePath) => {
    if (imagePath && imagePath.trim().startsWith('http')) {
      return imagePath;
    }
    if (imagePath && imagePath.trim() !== '') {
      return imagePath;
    }
    return '/images/categoryDefaultImage.jpg';
  };

  // Skeleton loading state
  if (isLoading) {
    return (
      <div className="w-full py-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Loading Categories...</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-24 sm:w-28 animate-pulse space-y-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-200 rounded-3xl" />
              <div className="h-4 bg-slate-200 rounded-md w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State with fallback default button
  if (isError) {
    return (
      <div className="w-full py-4 px-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-sm font-medium text-red-800">
          Failed to fetch categories. You can still browse all products!
        </p>
        <button
          onClick={() => onSelectCategory('All')}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all"
        >
          Reset Filter
        </button>
      </div>
    );
  }

  return (
    <div className="w-full py-8 border-b border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            What's on your mind?
          </h2>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Choose a category to filter your favorite meals
          </p>
        </div>
        
        {/* All Categories Button */}
        {activeCategory !== 'All' && (
          <button
            onClick={() => onSelectCategory('All')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> All Categories
          </button>
        )}
      </div>

      {/* Swipeable Container on Mobile, Grid on Desktop */}
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6 xl:grid-cols-11 lg:overflow-x-visible lg:pb-0">
        
        {/* "All" Category Option */}
        <div
          onClick={() => onSelectCategory('All')}
          className="flex-shrink-0 cursor-pointer group flex flex-col items-center gap-3 text-center"
        >
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-md border-2
            ${activeCategory === 'All'
              ? 'bg-gradient-to-tr from-orange-500 to-red-500 text-white border-transparent scale-105 shadow-orange-500/20'
              : 'bg-white text-slate-600 border-slate-100 hover:border-orange-200 group-hover:scale-105 group-hover:shadow-lg'
            }
          `}>
            <LayoutGrid className="w-8 h-8" />
          </div>
          <span className={`text-xs sm:text-sm font-bold tracking-tight transition-colors duration-200
            ${activeCategory === 'All' ? 'text-orange-600' : 'text-slate-600 group-hover:text-orange-500'}
          `}>
            All
          </span>
        </div>

        {/* Dynamic categories fetched from server */}
        {displayCategories.map((category) => {
          const isSelected = activeCategory === category.name;
          return (
            <div
              key={category.id}
              onClick={() => onSelectCategory(category.name)}
              className="flex-shrink-0 cursor-pointer group flex flex-col items-center gap-3 text-center"
            >
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden transition-all duration-300 shadow-md border-2 relative
                ${isSelected
                  ? 'border-orange-500 ring-4 ring-orange-500/10 scale-105'
                  : 'border-slate-100 group-hover:border-orange-200 group-hover:scale-105 group-hover:shadow-lg'
                }
              `}>
                <img
                  src={getCategoryImage(category.image)}
                  alt={category.name}
                  onError={(e) => {
                    e.target.src = '/images/categoryDefaultImage.jpg';
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Gradient Overlay for active card text visibility if text is inside, or just for styling */}
                {isSelected && (
                  <div className="absolute inset-0 bg-orange-500/10 mix-blend-multiply" />
                )}
              </div>
              <span className={`text-xs sm:text-sm font-bold tracking-tight max-w-[80px] sm:max-w-[96px] truncate transition-colors duration-200
                ${isSelected ? 'text-orange-600 font-extrabold' : 'text-slate-600 group-hover:text-orange-500'}
              `}>
                {category.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
