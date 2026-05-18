'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Grid, 
  Plus, 
  Edit, 
  Trash2, 
  X 
} from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/services/categoryApi';
import Loader from '@/components/ui/Loader';

export default function AdminCategoriesTab({ showSuccess, showError }) {
  const queryClient = useQueryClient();
  const [categoriesPage, setCategoriesPage] = useState(1);

  // Modal States
  const [activeItem, setActiveItem] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form States
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    image: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Categories Query
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['adminCategories', categoriesPage],
    queryFn: () => getAllCategories(categoriesPage - 1, 100),
    keepPreviousData: true,
  });

  // Categories Mutations
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Category created successfully!');
        setIsAddOpen(false);
        queryClient.invalidateQueries(['adminCategories']);
      } else {
        showError(res.message || 'Failed to create category.');
      }
    },
    onError: (err) => showError(err.message || 'API Communication Error.')
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Category details updated successfully!');
        setIsEditOpen(false);
        queryClient.invalidateQueries(['adminCategories']);
      } else {
        showError(res.message || 'Failed to update category.');
      }
    },
    onError: (err) => showError(err.message || 'API Communication Error.')
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (res) => {
      if (res.success) {
        showSuccess('Category deleted successfully!');
        setIsDeleteOpen(false);
        queryClient.invalidateQueries(['adminCategories']);
      } else {
        showError(res.message || 'Failed to delete category.');
      }
    },
    onError: (err) => showError(err.message || 'Database link error.')
  });

  // Data Selectors
  const allCategoriesList = categoriesResponse?.data?.content || [];

  const resetForm = () => {
    setCategoryFormData({
      name: '',
      image: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!categoryFormData.name.trim()) errors.name = 'Category name is required';
    if (!categoryFormData.image.trim()) errors.image = 'Thumbnail URL is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    createCategoryMutation.mutate(categoryFormData);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    updateCategoryMutation.mutate({ id: activeItem.id, data: categoryFormData });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (item) => {
    setActiveItem(item);
    resetForm();
    setCategoryFormData({
      name: item.name || '',
      image: item.image || ''
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (item) => {
    setActiveItem(item);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Tab Subheader with Add Trigger */}
      <div className="flex justify-end">
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-655 hover:to-red-650 text-white font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.97] shadow-lg shadow-orange-500/10"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Category
        </button>
      </div>

      {/* Category total metric card */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-md flex items-center gap-4 max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
          <Grid className="w-5.5 h-5.5" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cuisine Classes</p>
          <h4 className="text-2xl font-black mt-0.5">{allCategoriesList.length}</h4>
        </div>
      </div>

      {/* Grid listing */}
      {isLoadingCategories ? (
        <div className="py-24 text-center">
          <Loader />
          <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Loading Cuisines...</p>
        </div>
      ) : allCategoriesList.length === 0 ? (
        <div className="py-24 text-center max-w-sm mx-auto space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-650 mx-auto">
            <Grid className="w-6.5 h-6.5" />
          </div>
          <h5 className="font-extrabold text-sm text-slate-350">No cuisines created yet</h5>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCategoriesList.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between group hover:border-slate-700/60 transition-colors"
            >
              <div className="h-44 w-full bg-slate-955 overflow-hidden relative border-b border-slate-850">
                <img
                  src={cat.image && cat.image.trim().startsWith('http') ? cat.image : '/images/defaultImage.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = '/images/defaultImage.jpg'; }}
                />
                <div className="absolute top-4 left-4 px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-black rounded-lg">
                  ID: #{cat.id}
                </div>
              </div>

              <div className="p-5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-sm text-white tracking-wide uppercase">{cat.name}</h4>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 border border-slate-800 hover:border-orange-500 hover:text-orange-500 rounded-xl bg-slate-955 text-slate-400 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(cat)}
                    className="p-2 border border-slate-800 hover:border-red-500 hover:text-red-500 rounded-xl bg-slate-955 text-slate-450 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-805 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-lg font-black uppercase tracking-wide text-white">Add Cuisine Category</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-405">Cuisine Name</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g. Seafood, Italian Pasta"
                  className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold placeholder-slate-655 text-xs focus:outline-none focus:border-orange-500
                    ${formErrors.name ? 'border-red-500' : 'border-slate-800'}`}
                />
                {formErrors.name && <p className="text-[10px] font-bold text-red-400">{formErrors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-405">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className={`block w-full px-4 py-3 bg-slate-955 border rounded-xl text-slate-200 font-semibold placeholder-slate-655 text-xs focus:outline-none focus:border-orange-500
                    ${formErrors.image ? 'border-red-505' : 'border-slate-800'}`}
                />
                {formErrors.image && <p className="text-[10px] font-bold text-red-400">{formErrors.image}</p>}
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
                  disabled={createCategoryMutation.isLoading}
                  className="flex-1 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-650 rounded-xl font-black text-xs uppercase tracking-wider shadow-md"
                >
                  Add Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CATEGORY MODAL --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-805 rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-lg font-black uppercase tracking-wide text-white">Edit Cuisine Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Cuisine Name</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="e.g. Seafood, Italian Pasta"
                  className={`block w-full px-4 py-3 bg-slate-950 border rounded-xl text-slate-200 font-semibold placeholder-slate-655 text-xs focus:outline-none focus:border-orange-500
                    ${formErrors.name ? 'border-red-500' : 'border-slate-800'}`}
                />
                {formErrors.name && <p className="text-[10px] font-bold text-red-400">{formErrors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-455">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={categoryFormData.image}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className={`block w-full px-4 py-3 bg-slate-955 border rounded-xl text-slate-200 font-semibold placeholder-slate-655 text-xs focus:outline-none focus:border-orange-500
                    ${formErrors.image ? 'border-red-500' : 'border-slate-800'}`}
                />
                {formErrors.image && <p className="text-[10px] font-bold text-red-400">{formErrors.image}</p>}
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
                  disabled={updateCategoryMutation.isLoading}
                  className="flex-1 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-655 hover:to-red-650 rounded-xl font-black text-xs uppercase tracking-wider shadow-md"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-805 rounded-3xl max-w-sm w-full shadow-2xl p-6 text-center space-y-5 text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-550 flex items-center justify-center border border-red-555/20 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black uppercase tracking-wide text-white">Confirm Removal</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Are you absolutely sure you want to permanently delete <span className="font-extrabold text-slate-200">{activeItem?.name}</span>? This action is irreversible.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-755 text-slate-350 rounded-xl font-black text-xs uppercase tracking-wider border border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteCategoryMutation.mutate(activeItem.id)}
                disabled={deleteCategoryMutation.isLoading}
                className="flex-1 py-3 text-white bg-gradient-to-r from-red-550 to-red-650 hover:from-red-600 hover:to-red-750 rounded-xl font-black text-xs uppercase tracking-wider shadow-md"
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
