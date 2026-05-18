'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function SellerProductModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
  formErrors,
  setFormErrors,
  categories,
  isLoading,
  isEdit
}) {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-up">
        <div className="flex justify-between items-center pb-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-405 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">Food Title / Name</label>
            <input
              type="text"
              name="foodName"
              value={formData.foodName}
              onChange={handleInputChange}
              placeholder="e.g. Traditional Spicy Mutton Kacchi Biryani"
              className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-404 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
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
                className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-404 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
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
                className={`block w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-800 font-semibold placeholder-slate-404 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all
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
                <option value="" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>Select Cuisine Type</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formErrors.categoryId && <p className="text-[10px] font-bold text-red-500">{formErrors.categoryId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-450 uppercase tracking-wide">{isEdit ? 'Active Status' : 'Initial Status'}</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
              >
                <option value="PENDING" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>PENDING</option>
                <option value="APPROVED" className="text-black bg-white" style={{ color: '#000000', backgroundColor: '#ffffff' }}>APPROVED</option>
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
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold placeholder-slate-404 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
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
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-semibold placeholder-slate-404 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25 transition-all"
            />
          </div>

          <div className="flex gap-3.5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 hover:bg-slate-105 text-slate-600 rounded-2xl font-extrabold text-sm transition-all active:scale-[0.98] border border-slate-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-2xl font-extrabold text-sm transition-all shadow-md active:scale-[0.98]"
            >
              {isLoading ? 'Processing...' : isEdit ? 'Save Updates' : 'Add to Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
