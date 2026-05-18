'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChefHat, 
  Package, 
  Clock, 
  Check, 
  Plus, 
  Edit, 
  Trash2, 
  X 
} from 'lucide-react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '@/services/productApi';
import Loader from '@/components/ui/Loader';

export default function AdminProductsTab({ allCategoriesList, showSuccess, showError }) {
  const queryClient = useQueryClient();
  const [productsPage, setProductsPage] = useState(1);

  // Search & filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');

  // Modal States
  const [activeItem, setActiveItem] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form States
  const [productFormData, setProductFormData] = useState({
    foodName: '',
    description: '',
    price: '',
    makingTime: '',
    status: 'APPROVED',
    categoryId: '',
    image: '',
    sellerId: '1'
  });

  const [formErrors, setFormErrors] = useState({});

  // Products Query
  const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['adminProducts', productsPage],
    queryFn: () => getAllProducts({ page: productsPage, size: 100 }), // Load a larger list so we can filter dynamically in the client
    keepPreviousData: true,
  });

  // A. Products Mutations
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Product created successfully!');
        setIsAddOpen(false);
        queryClient.invalidateQueries(['adminProducts']);
      } else {
        showError(res.message || 'Failed to create product.');
      }
    },
    onError: (err) => showError(err.message || 'API Communication Error.')
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Product details updated successfully!');
        setIsEditOpen(false);
        queryClient.invalidateQueries(['adminProducts']);
      } else {
        showError(res.message || 'Failed to update product.');
      }
    },
    onError: (err) => showError(err.message || 'API Communication Error.')
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Product deleted successfully!');
        setIsDeleteOpen(false);
        queryClient.invalidateQueries(['adminProducts']);
      } else {
        showError(res.message || 'Failed to delete product.');
      }
    },
    onError: (err) => showError(err.message || 'Database deletion error.')
  });

  // Data Selectors
  const allProductsList = productsResponse?.data?.content || [];

  // Filtered Products list
  const filteredProducts = allProductsList.filter(p => {
    const matchesSearch = p.foodName.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory = !productCategoryFilter || p.categoryName === productCategoryFilter;
    const matchesStatus = !productStatusFilter || p.status === productStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setProductFormData({
      foodName: '',
      description: '',
      price: '',
      makingTime: '',
      status: 'APPROVED',
      categoryId: '',
      image: '',
      sellerId: '1'
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!productFormData.foodName.trim()) errors.foodName = 'Food title is required';
    if (!productFormData.price || Number(productFormData.price) <= 0) errors.price = 'Price must be greater than zero';
    if (!productFormData.makingTime || Number(productFormData.makingTime) < 1) errors.makingTime = 'Making time must be at least 1 min';
    if (!productFormData.categoryId) errors.categoryId = 'Cuisine category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      foodName: productFormData.foodName,
      description: productFormData.description,
      price: Number(productFormData.price),
      makingTime: Number(productFormData.makingTime),
      status: productFormData.status,
      sellerId: Number(productFormData.sellerId),
      categoryId: Number(productFormData.categoryId),
      image: productFormData.image || ''
    };
    createProductMutation.mutate(payload);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      foodName: productFormData.foodName,
      description: productFormData.description,
      price: Number(productFormData.price),
      makingTime: Number(productFormData.makingTime),
      status: productFormData.status,
      sellerId: Number(productFormData.sellerId),
      categoryId: Number(productFormData.categoryId),
      image: productFormData.image || ''
    };
    updateProductMutation.mutate({ id: activeItem.id, data: payload });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (item) => {
    setActiveItem(item);
    resetForm();
    setProductFormData({
      foodName: item.foodName || '',
      description: item.description || '',
      price: item.price || '',
      makingTime: item.makingTime || '',
      status: item.status || 'APPROVED',
      categoryId: item.categoryId || '',
      image: item.image || '',
      sellerId: item.sellerId || '1'
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (item) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };

  const handleProductApproveToggle = (product) => {
    const newStatus = product.status === 'APPROVED' ? 'PENDING' : 'APPROVED';
    const payload = {
      foodName: product.foodName,
      description: product.description,
      price: product.price,
      makingTime: product.makingTime,
      status: newStatus,
      sellerId: product.sellerId || 1,
      categoryId: product.categoryId,
      image: product.image || ''
    };
    updateProductMutation.mutate({ id: product.id, data: payload });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Subheader with Add Trigger */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-650 text-white font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.97] shadow-lg shadow-orange-500/10"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Product
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
            <Package className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inventory Items</p>
            <h4 className="text-2xl font-black mt-0.5">{allProductsList.length}</h4>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-405 flex items-center justify-center shrink-0 border border-yellow-500/20">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Reviews</p>
            <h4 className="text-2xl font-black mt-0.5">
              {allProductsList.filter(p => p.status === 'PENDING').length}
            </h4>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-450 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Check className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Catalog</p>
            <h4 className="text-2xl font-black mt-0.5">
              {allProductsList.filter(p => p.status === 'APPROVED').length}
            </h4>
          </div>
        </div>
      </div>

      {/* Catalog Filter Controls */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Search Catalogue</label>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Filter by food title..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filter by Cuisine Category</label>
          <select
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>All Categories</option>
            {allCategoriesList.map(c => (
              <option key={c.id} value={c.name} className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filter by Product Status</label>
          <select
            value={productStatusFilter}
            onChange={(e) => setProductStatusFilter(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>All Statuses</option>
            <option value="APPROVED" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>APPROVED</option>
            <option value="PENDING" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>PENDING</option>
          </select>
        </div>
      </div>

      {/* Inventory Listing */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800/60 bg-slate-900 flex items-center justify-between">
          <h3 className="font-black text-sm tracking-wide uppercase text-slate-350">Catalog Catalogue</h3>
          <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Matches: {filteredProducts.length} items
          </span>
        </div>

        {isLoadingProducts ? (
          <div className="py-24 text-center">
            <Loader />
            <p className="text-xs font-bold text-slate-505 mt-4 uppercase tracking-widest">Loading Master Catalogue...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center max-w-sm mx-auto space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
              <Package className="w-6.5 h-6.5" />
            </div>
            <div className="space-y-1">
              <h5 className="font-extrabold text-sm text-slate-300">No products matching filters</h5>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">Try modifying your text search query or category parameters.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="px-6 py-5 flex flex-col md:flex-row justify-between md:items-center gap-5 hover:bg-slate-900/60 transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-955 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={p.image && p.image.trim().startsWith('http') ? p.image : '/images/defaultImage.jpg'}
                      alt={p.foodName}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/images/defaultImage.jpg'; }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-white">{p.foodName}</h4>
                      <span className="px-2 py-0.5 bg-orange-955/40 text-orange-400 font-extrabold text-[8px] tracking-wide uppercase border border-orange-900/30 rounded">
                        {p.categoryName || 'General'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-md">
                      {p.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-505 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-650" /> {p.makingTime} mins prep
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                      <span>ID: #{p.id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                      <span className="text-slate-400">Seller ID: #{p.sellerId || 'System'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col lg:flex-row items-center gap-4 self-end md:self-center">
                  <div className="text-right pr-2">
                    <p className="text-[9px] font-black text-slate-505 uppercase tracking-widest">Pricing</p>
                    <span className="text-sm font-black text-slate-200">{(p.price || 0).toLocaleString()} BDT</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleProductApproveToggle(p)}
                      className={`px-3 py-1.5 text-[9px] font-black rounded-lg border uppercase tracking-wider transition-colors ${
                        p.status === 'APPROVED' 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 hover:bg-emerald-900/20' 
                          : 'bg-orange-950/40 text-orange-400 border-orange-900/60 hover:bg-orange-900/20'
                      }`}
                      title={p.status === 'APPROVED' ? 'Mark status as PENDING' : 'Mark status as APPROVED'}
                    >
                      {p.status}
                    </button>

                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 border border-slate-800 hover:border-orange-500 hover:text-orange-500 rounded-xl bg-slate-955 text-slate-400 shadow-sm transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openDeleteModal(p)}
                      className="p-2 border border-slate-800 hover:border-red-500 hover:text-red-550 rounded-xl bg-slate-955 text-slate-450 shadow-sm transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-lg font-black uppercase tracking-wide text-white">Add Food Offering</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Food Title / Name</label>
                <input
                  type="text"
                  value={productFormData.foodName}
                  onChange={(e) => setProductFormData({ ...productFormData, foodName: e.target.value })}
                  placeholder="e.g. Garlic Butter Grilled Lobster"
                  className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                    ${formErrors.foodName ? 'border-red-505' : 'border-slate-800 focus:border-orange-505'}`}
                />
                {formErrors.foodName && <p className="text-[10px] font-bold text-red-400">{formErrors.foodName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Selling Price (BDT)</label>
                  <input
                    type="number"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    placeholder="e.g. 1450"
                    className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                      ${formErrors.price ? 'border-red-505' : 'border-slate-800 focus:border-orange-505'}`}
                  />
                  {formErrors.price && <p className="text-[10px] font-bold text-red-400">{formErrors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={productFormData.makingTime}
                    onChange={(e) => setProductFormData({ ...productFormData, makingTime: e.target.value })}
                    placeholder="e.g. 20"
                    className={`block w-full px-4 py-3 bg-slate-955 border rounded-xl text-slate-200 font-semibold placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                      ${formErrors.makingTime ? 'border-red-505' : 'border-slate-800 focus:border-orange-505'}`}
                  />
                  {formErrors.makingTime && <p className="text-[10px] font-bold text-red-400">{formErrors.makingTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cuisine Class</label>
                  <select
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                    className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                      ${formErrors.categoryId ? 'border-red-505' : 'border-slate-800 focus:border-orange-505'}`}
                  >
                    <option value="" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Select Category</option>
                    {allCategoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id} className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.categoryId && <p className="text-[10px] font-bold text-red-400">{formErrors.categoryId}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Initial Review Status</label>
                  <select
                    value={productFormData.status}
                    onChange={(e) => setProductFormData({ ...productFormData, status: e.target.value })}
                    className="block w-full px-4 py-3 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/35 transition-all"
                  >
                    <option value="APPROVED" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>APPROVED</option>
                    <option value="PENDING" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>PENDING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Seller Association ID</label>
                  <input
                    type="number"
                    value={productFormData.sellerId}
                    onChange={(e) => setProductFormData({ ...productFormData, sellerId: e.target.value })}
                    placeholder="e.g. 1"
                    className="block w-full px-4 py-3 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Product Image URL</label>
                  <input
                    type="text"
                    value={productFormData.image}
                    onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="block w-full px-4 py-3 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detailed Description</label>
                <textarea
                  rows="3"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Ingredients, serving size, heat levels..."
                  className="block w-full px-4 py-3 bg-slate-955 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-350 rounded-xl font-black text-xs uppercase tracking-wider border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isLoading}
                  className="flex-1 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-650 rounded-xl font-black text-xs uppercase tracking-wider"
                >
                  Add Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-805 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-lg font-black uppercase tracking-wide text-white">Edit Meal Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Food Title / Name</label>
                <input
                  type="text"
                  value={productFormData.foodName}
                  onChange={(e) => setProductFormData({ ...productFormData, foodName: e.target.value })}
                  placeholder="e.g. Garlic Butter Grilled Lobster"
                  className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                    ${formErrors.foodName ? 'border-red-505' : 'border-slate-800 focus:border-orange-500'}`}
                />
                {formErrors.foodName && <p className="text-[10px] font-bold text-red-400">{formErrors.foodName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Selling Price (BDT)</label>
                  <input
                    type="number"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    placeholder="e.g. 1450"
                    className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                      ${formErrors.price ? 'border-red-505' : 'border-slate-800 focus:border-orange-555'}`}
                  />
                  {formErrors.price && <p className="text-[10px] font-bold text-red-400">{formErrors.price}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={productFormData.makingTime}
                    onChange={(e) => setProductFormData({ ...productFormData, makingTime: e.target.value })}
                    placeholder="e.g. 20"
                    className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                      ${formErrors.makingTime ? 'border-red-505' : 'border-slate-800 focus:border-orange-555'}`}
                  />
                  {formErrors.makingTime && <p className="text-[10px] font-bold text-red-400">{formErrors.makingTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cuisine Class</label>
                  <select
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                    className={`block w-full px-4 py-3 bg-slate-955 border rounded-xl text-slate-200 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/35 transition-all
                      ${formErrors.categoryId ? 'border-red-505' : 'border-slate-800 focus:border-orange-555'}`}
                  >
                    <option value="" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Select Category</option>
                    {allCategoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id} className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.categoryId && <p className="text-[10px] font-bold text-red-400">{formErrors.categoryId}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-450">Review Status</label>
                  <select
                    value={productFormData.status}
                    onChange={(e) => setProductFormData({ ...productFormData, status: e.target.value })}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/35 transition-all"
                  >
                    <option value="APPROVED" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>APPROVED</option>
                    <option value="PENDING" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>PENDING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Seller Association ID</label>
                  <input
                    type="number"
                    value={productFormData.sellerId}
                    onChange={(e) => setProductFormData({ ...productFormData, sellerId: e.target.value })}
                    placeholder="e.g. 1"
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Product Image URL</label>
                  <input
                    type="text"
                    value={productFormData.image}
                    onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Detailed Description</label>
                <textarea
                  rows="3"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Ingredients, serving size, heat levels..."
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-355 rounded-xl font-black text-xs uppercase tracking-wider border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isLoading}
                  className="flex-1 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-655 hover:to-red-650 rounded-xl font-black text-xs uppercase tracking-wider"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-805 rounded-3xl max-w-sm w-full shadow-2xl p-6 text-center space-y-5 text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-550 flex items-center justify-center border border-red-550/20 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black uppercase tracking-wide text-white">Confirm Removal</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Are you absolutely sure you want to permanently delete <span className="font-extrabold text-slate-200">{activeItem?.foodName}</span>? This action is irreversible.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-350 rounded-xl font-black text-xs uppercase tracking-wider border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteProductMutation.mutate(activeItem.id)}
                disabled={deleteProductMutation.isLoading}
                className="flex-1 py-3 text-white bg-gradient-to-r from-red-550 to-red-655 hover:from-red-600 hover:to-red-750 rounded-xl font-black text-xs uppercase tracking-wider"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
