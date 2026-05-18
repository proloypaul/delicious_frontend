'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, Plus, Edit, Trash2, LogOut, Package, Star, Clock, ToggleLeft, ToggleRight, X, ChefHat, Tag, AlertCircle } from 'lucide-react';
import { getSellerProducts, getSellerProfile } from '@/services/sellerApi';
import { getAllCategories } from '@/services/categoryApi';
import { createProduct, updateProduct, deleteProduct } from '@/services/productApi';
import Loader from '@/components/ui/Loader';
import Notification from '@/components/shared/Notification';

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
          // If not a seller, kick to landing
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
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery({
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
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
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-450 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95 border border-slate-100 bg-slate-50/50"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Profile Card Header Banner */}
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-orange-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-750">
          <div className="space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <ChefHat className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {sellerProfile?.storeName || 'Your Store'}
                </h2>
                <p className="text-xs font-bold text-orange-400 tracking-wide uppercase">
                  {sellerProfile?.cuisineType || 'Home Kitchen'} Cuisine
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed font-semibold">
              {sellerProfile?.description || 'Serve high-quality meals to your community through the Delicious Kitchen networks.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={openAddModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-extrabold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Food Item
            </button>
          </div>
        </div>

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

        {/* Inventory Section */}
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
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-150 overflow-hidden flex-shrink-0">
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
                          <Tag className="w-3.5 h-3.5 text-slate-350" /> ID: #{product.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col md:flex-row items-center gap-4 self-end sm:self-center">
                    <div className="text-right sm:pr-4">
                      <p className="text-xs font-black text-slate-450 uppercase tracking-wide">Price</p>
                      <span className="text-base font-black text-slate-950 block">{product.price.toLocaleString()} BDT</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider ${
                        product.status === 'APPROVED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                          : 'bg-slate-50 text-slate-500 border-slate-205'
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
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-2 bg-slate-50/50">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs font-extrabold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-up">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Food Meal</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Food Title / Name</label>
                <input
                  type="text"
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleInputChange}
                  placeholder="e.g. Traditional Spicy Mutton Kacchi Biryani"
                  className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                    ${formErrors.foodName ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                />
                {formErrors.foodName && <p className="text-[10px] font-bold text-red-500">{formErrors.foodName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Selling Price (BDT)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 240"
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                      ${formErrors.price ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                  />
                  {formErrors.price && <p className="text-[10px] font-bold text-red-500">{formErrors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Making Prep Time (minutes)</label>
                  <input
                    type="number"
                    name="makingTime"
                    value={formData.makingTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 25"
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                      ${formErrors.makingTime ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                  />
                  {formErrors.makingTime && <p className="text-[10px] font-bold text-red-500">{formErrors.makingTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-455 uppercase tracking-wide">Cuisine Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                      ${formErrors.categoryId ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                  >
                    <option value="">Select Cuisine Type</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && <p className="text-[10px] font-bold text-red-500">{formErrors.categoryId}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Food Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/... or leave blank"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Food Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe details, ingredients, servings sizes, heat scale level, etc."
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
                />
              </div>

              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] border border-slate-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isLoading}
                  className="flex-1 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl font-extrabold text-sm transition-all shadow-md active:scale-[0.98]"
                >
                  {createProductMutation.isLoading ? 'Adding Item...' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-up">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Meal Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-455 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Food Title / Name</label>
                <input
                  type="text"
                  name="foodName"
                  value={formData.foodName}
                  onChange={handleInputChange}
                  placeholder="e.g. Traditional Spicy Mutton Kacchi Biryani"
                  className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                    ${formErrors.foodName ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                />
                {formErrors.foodName && <p className="text-[10px] font-bold text-red-500">{formErrors.foodName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Selling Price (BDT)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 240"
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                      ${formErrors.price ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                  />
                  {formErrors.price && <p className="text-[10px] font-bold text-red-500">{formErrors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-455 uppercase tracking-wide">Making Prep Time (minutes)</label>
                  <input
                    type="number"
                    name="makingTime"
                    value={formData.makingTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 25"
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                      ${formErrors.makingTime ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                  />
                  {formErrors.makingTime && <p className="text-[10px] font-bold text-red-500">{formErrors.makingTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Cuisine Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
                      ${formErrors.categoryId ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-150 focus:border-orange-500'}`}
                  >
                    <option value="">Select Cuisine Type</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && <p className="text-[10px] font-bold text-red-500">{formErrors.categoryId}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Active Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Food Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://images.unsplash.com/... or leave blank"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Food Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe details, ingredients, servings sizes, heat scale level, etc."
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold placeholder-slate-400 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
                />
              </div>

              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] border border-slate-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isLoading}
                  className="flex-1 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl font-extrabold text-sm transition-all shadow-md active:scale-[0.98]"
                >
                  {updateProductMutation.isLoading ? 'Saving Changes...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-100 shadow-2xl p-6 text-center space-y-5 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Delete Food Meal?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
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
