'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Bike, FileText } from 'lucide-react';
import AuthCard from '@/components/ui/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Notification from '@/components/shared/Notification';
import { registerRider } from '@/services/authApi';

export default function RiderRegisterPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
    vehicleRegistrationNumber: '',
  });

  // Validation State
  const [errors, setErrors] = useState({});

  // Toast Alert Notification State
  const [notification, setNotification] = useState(null);

  // Form Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Perform client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Please select a vehicle type';
    }

    if (!formData.vehicleRegistrationNumber.trim()) {
      newErrors.vehicleRegistrationNumber = 'Vehicle registration number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // React Query Mutation for API Call
  const mutation = useMutation({
    mutationFn: registerRider,
    onSuccess: (data) => {
      setNotification({
        type: 'success',
        message: 'Rider registered successfully! Welcome to the squad! Redirecting...',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        vehicleType: '',
        vehicleRegistrationNumber: '',
      });
      // Redirect to login page after 2.5 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message || 'Rider registration failed. Please try again.',
      });
    },
  });

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...submitData } = formData;
      mutation.mutate(submitData);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[90vh]">
      {/* Toast Alert Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in-right">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      <AuthCard
        title="Become a Delivery Hero"
        subtitle="Deliver meals, make smiles, and earn on your own terms"
        footerText="Already have an account?"
        footerLinkText="Log in here"
        footerLinkHref="/login"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="name"
            placeholder="Dustin Rider"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={mutation.isPending}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="rider@example.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={mutation.isPending}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="017XXXXXXXX"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={mutation.isPending}
            required
          />

          {/* Styled Select Dropdown for Vehicle Type */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Vehicle Type
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Bike className="h-5 w-5" />
              </div>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                disabled={mutation.isPending}
                className={`block w-full rounded-xl border bg-white py-3 pl-11 pr-10 appearance-none transition-all duration-200 outline-none text-sm
                  ${errors.vehicleType 
                    ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                    : 'border-slate-200 text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
                  }
                  ${!formData.vehicleType ? 'text-slate-400' : 'text-slate-900'}
                `}
                required
              >
                <option value="" disabled>Select vehicle type</option>
                <option value="MOTORBIKE">Motorbike / Motorcycle</option>
                <option value="BICYCLE">Bicycle</option>
                <option value="SCOOTER">E-Scooter / Scooter</option>
                <option value="CAR">Car / Micro</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.vehicleType && (
              <p className="mt-1.5 text-xs font-medium text-red-600 animate-slide-down">
                {errors.vehicleType}
              </p>
            )}
          </div>

          <Input
            label="Vehicle Registration Number"
            name="vehicleRegistrationNumber"
            placeholder="Dhaka Metro-LA-XX-XXXX"
            icon={FileText}
            value={formData.vehicleRegistrationNumber}
            onChange={handleChange}
            error={errors.vehicleRegistrationNumber}
            disabled={mutation.isPending}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={mutation.isPending}
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={mutation.isPending}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={mutation.isPending}
          >
            Apply as Rider
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-xs text-slate-500">
          <span className="font-semibold">Looking for other options?</span>
          <div className="flex justify-center gap-4 text-orange-600 font-bold">
            <Link href="/register/customer" className="hover:underline">Register as Customer</Link>
            <span>•</span>
            <Link href="/register/seller" className="hover:underline">Become a Seller Partner</Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

import Link from 'next/link';
