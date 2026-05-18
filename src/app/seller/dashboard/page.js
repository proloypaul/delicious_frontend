'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, LogOut, Package, ToggleRight, Trash2 } from 'lucide-react';
import { getSellerProducts, getSellerProfile } from '@/services/sellerApi';
import { getAllCategories } from '@/services/categoryApi';
import { createProduct, updateProduct, deleteProduct } from '@/services/productApi';
import Loader from '@/components/ui/Loader';
import Notification from '@/components/shared/Notification';

// Import modular sub-components
import SellerKitchenHeader from '@/components/seller/SellerKitchenHeader';
import SellerProductsList from '@/components/seller/SellerProductsList';
import SellerProductModal from '@/components/seller/SellerProductModal';

export default function SellerDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Authentication & session variables
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  // Notifications
  const [notification, setNotification] = useState(null);

  // Pagination & metrics
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Active product being edited or deleted
  const [activeProduct, setActiveProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    price: '',
    makingTime: '',
    status: 'PENDING',
    categoryId: '',
    image: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    // Authentication Check
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'SELLER') {
          router.push('/');
        } else {
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Failed to parse user session', e);
        router.push('/login');
      }
    } else {
      router.push('/login?redirect=/seller/dashboard');
    }
  }, []);

  // 1. Fetch Seller Kitchen Profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['sellerProfile', user?.id],
    queryFn: () => getSellerProfile(user.id),
    enabled: !!user?.id,
  });

  // 2. Fetch Seller's Products (Spring Boot Pageable is 0-indexed)
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['sellerProducts', user?.id, page],
    queryFn: () => getSellerProducts(user.id, page - 1, pageSize),
    enabled: !!user?.id,
    keepPreviousData: true,
  });

  // 3. Fetch All Available Categories for mapping select dropdowns
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(0, 100),
    enabled: !!user?.id,
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (response) => {
      if (response.success) {
        setNotification({
          type: 'success',
          message: 'Product added successfully!',
        });
        setIsAddModalOpen(false);
        resetForm();
        queryClient.invalidateQueries(['sellerProducts']);
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Failed to add product.',
        });
      }
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to communicate with API server.',
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (response) => {
      if (response.success) {
        setNotification({
          type: 'success',
          message: 'Product details updated successfully!',
        });
        setIsEditModalOpen(false);
        setActiveProduct(null);
        resetForm();
        queryClient.invalidateQueries(['sellerProducts']);
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Failed to update product details.',
        });
      }
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to communicate with API server.',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (response) => {
      if (response.success) {
        setNotification({
          type: 'success',
          message: 'Product deleted successfully!',
        });
        setIsDeleteOpen(false);
        setActiveProduct(null);
        queryClient.invalidateQueries(['sellerProducts']);
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Failed to delete product.',
        });
      }
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete product. Database link exists.',
      });
    },
  });

  const sellerProfile = profileData?.data;
  const productsPage = productsData?.data;
  const products = productsPage?.content || [];
  const totalPages = productsPage?.totalPages || 0;
  const totalElements = productsPage?.totalElements || 0;
  const categories = categoriesData?.data?.content || [];

  // Form utilities
  const resetForm = () => {
    setFormData({
      foodName: '',
      description: '',
      price: '',
      makingTime: '',
      status: 'PENDING',
      categoryId: '',
      image: '',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.foodName.trim()) errors.foodName = 'Food name is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Price must be greater than zero';
    if (!formData.makingTime || Number(formData.makingTime) < 1) errors.makingTime = 'Making time must be at least 1 minute';
    if (!formData.categoryId) errors.categoryId = 'Food category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const payload = {
      foodName: formData.foodName,
      description: formData.description,
      price: Number(formData.price),
      makingTime: Number(formData.makingTime),
      status: formData.status,
      sellerId: user.id,
      categoryId: Number(formData.categoryId),
      image: formData.image || '',
    };
    createProductMutation.mutate(payload);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      foodName: formData.foodName,
      description: formData.description,
      price: Number(formData.price),
      makingTime: Number(formData.makingTime),
      status: formData.status,
      sellerId: user.id,
      categoryId: Number(formData.categoryId),
      image: formData.image || '',
    };
    updateProductMutation.mutate({ id: activeProduct.id, data: payload });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setActiveProduct(product);
    setFormData({
      foodName: product.foodName || '',
      description: product.description || '',
      price: product.price || '',
      makingTime: product.makingTime || '',
      status: product.status || 'PENDING',
      categoryId: product.categoryId || '',
      image: product.image || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product) => {
    setActiveProduct(product);
    setIsDeleteOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!mounted || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
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

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-xl shadow-md transform group-hover:rotate-12 transition-transform">
                D
              </div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-red-655 bg-clip-text text-transparent">
                delicious
              </span>
            </Link>
            <span className="hidden sm:inline px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Seller Hub
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-slate-900 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] font-extrabold text-orange-600 tracking-wider uppercase">
                {sellerProfile?.storeName || 'Delicious Kitchen'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-red-505 hover:bg-red-50 transition-all active:scale-95 border border-slate-100 bg-slate-50/50"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        
        {/* Profile Card Header Banner */}
        <SellerKitchenHeader 
          sellerProfile={sellerProfile} 
          openAddModal={openAddModal} 
        />

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Menu Items</p>
              <h4 className="text-2xl font-black text-slate-900 mt-0.5">{totalElements}</h4>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ToggleRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Offerings</p>
              <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                {products.filter(p => p.status === 'APPROVED').length}
              </h4>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kitchen Status</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider mt-1.5 border border-emerald-250">
                {sellerProfile?.status || 'APPROVED'}
              </span>
            </div>
          </div>
        </div>

        {/* Modular Products List & Pagination */}
        <SellerProductsList 
          products={products}
          totalElements={totalElements}
          isLoadingProducts={isLoadingProducts}
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          openDeleteModal={openDeleteModal}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      </main>

      {/* --- ADD / EDIT PRODUCT MODALS --- */}
      <SellerProductModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        title="Add Food Offering"
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        categories={categories}
        isLoading={createProductMutation.isLoading}
        isEdit={false}
      />

      <SellerProductModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit Meal Details"
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        categories={categories}
        isLoading={updateProductMutation.isLoading}
        isEdit={true}
      />

      {/* --- CONFIRM DELETE MODAL --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-100 shadow-2xl p-6 text-center space-y-5 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Delete Food Meal?</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Are you absolutely sure you want to remove <span className="font-extrabold text-slate-800">{activeProduct?.foodName}</span> from your kitchen menu? This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-extrabold text-sm transition-all border border-slate-150"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteProductMutation.mutate(activeProduct.id)}
                disabled={deleteProductMutation.isLoading}
                className="flex-1 py-3 text-white bg-gradient-to-r from-red-550 to-red-650 hover:from-red-600 hover:to-red-750 rounded-2xl font-extrabold text-sm transition-all shadow-md"
              >
                {deleteProductMutation.isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
