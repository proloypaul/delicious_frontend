'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/services/categoryApi';
import Loader from '@/components/ui/Loader';
import Notification from '@/components/shared/Notification';

// Import modular sub-components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminCategoriesTab from '@/components/admin/AdminCategoriesTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('adminActiveTab');
      if (savedTab) {
        setActiveTab(savedTab);
        localStorage.removeItem('adminActiveTab');
      }
    }
  }, []);

  // Fetch all categories once at root to map categories for selection list
  const { data: categoriesResponse, isLoading: isLoadingAllCategories } = useQuery({
    queryKey: ['adminAllCategoriesOptions'],
    queryFn: () => getAllCategories(0, 100),
  });

  const allCategoriesList = categoriesResponse?.data?.content || [];

  const showSuccess = (msg) => {
    setNotification({ type: 'success', message: msg });
  };

  const showError = (msg) => {
    setNotification({ type: 'error', message: msg });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Dynamic Active Notification Overlay Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in-right">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Modular Side Navigation Console */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Console Operations */}
      <main className="flex-1 py-8 px-6 sm:px-10 overflow-y-auto z-10 space-y-8">
        
        {/* Dynamic Section Title Header */}
        <div className="flex flex-col gap-1 border-b border-slate-905 pb-5">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
            {activeTab === 'products' && 'Product Management'}
            {activeTab === 'categories' && 'Cuisine Category Setup'}
            {activeTab === 'orders' && 'Order Dispatch Desk'}
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
            {activeTab === 'products' && 'Track kitchen menu items, configure prices, and toggle approvals.'}
            {activeTab === 'categories' && 'Configure custom cuisine groupings and manage presentation visuals.'}
            {activeTab === 'orders' && 'Process customer orders, update rider updates, and review invoices.'}
          </p>
        </div>

        {/* Tab content screens */}
        {isLoadingAllCategories ? (
          <div className="py-24 text-center">
            <Loader />
            <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Warming administrative console...</p>
          </div>
        ) : (
          <>
            {activeTab === 'products' && (
              <AdminProductsTab 
                allCategoriesList={allCategoriesList} 
                showSuccess={showSuccess} 
                showError={showError} 
              />
            )}

            {activeTab === 'categories' && (
              <AdminCategoriesTab 
                showSuccess={showSuccess} 
                showError={showError} 
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrdersTab 
                showSuccess={showSuccess} 
                showError={showError} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
