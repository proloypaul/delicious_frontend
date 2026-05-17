'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock } from 'lucide-react';
import AuthCard from '@/components/ui/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Notification from '@/components/shared/Notification';
import { registerCustomer } from '@/services/authApi';

export default function CustomerRegisterPage() {
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
    mutationFn: registerCustomer,
    onSuccess: (data) => {
      setNotification({
        type: 'success',
        message: 'Account created successfully! Redirecting you to login...',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message || 'Registration failed. Please check your credentials.',
      });
    },
  });

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Exclude confirmPassword from request payload
      const { confirmPassword, ...submitData } = formData;
      mutation.mutate(submitData);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[90vh]">
      {/* Toast alert at top-right of the screen */}
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
        title="Create Customer Account"
        subtitle="Sign up to order delicious food from local favorites"
        footerText="Already have an account?"
        footerLinkText="Log in here"
        footerLinkHref="/login"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
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
            placeholder="john@example.com"
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
            Sign Up
          </Button>
        </form>
        
        <div className="mt-6 flex flex-col gap-2 text-center text-xs text-slate-500">
          <span className="font-semibold">Register for partner programs:</span>
          <div className="flex justify-center gap-4 text-orange-600 font-bold">
            <Link href="/register/seller" className="hover:underline">Become a Seller Partner</Link>
            <span>•</span>
            <Link href="/register/rider" className="hover:underline">Become a Delivery Hero</Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

// Add a standard lightweight wrapper for Link so that next/link can be imported seamlessly
import Link from 'next/link';
