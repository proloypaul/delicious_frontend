'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import AuthCard from '@/components/ui/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Notification from '@/components/shared/Notification';
import { loginUser } from '@/services/authApi';

export default function LoginPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Validation State
  const [errors, setErrors] = useState({});

  // Toast Notification State
  const [notification, setNotification] = useState(null);

  // Form Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side validations
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // React Query Mutation for API Call
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // Spring Boot backend returns ApiResponse<AuthResponse>
      // structure: { success: true, message: "...", data: { id, name, role, ... } }
      const authData = response?.data;
      
      if (!authData) {
        setNotification({
          type: 'error',
          message: 'Malformed response from server. Missing user data.',
        });
        return;
      }

      setNotification({
        type: 'success',
        message: `Welcome back, ${authData.name}! Logging you in...`,
      });

      // Save token and user details to localStorage
      // Fallback to a mockup token since backend JWT is not fully initialized
      const token = authData.token || 'mock-jwt-token-string';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authData));

      // Redirect user dynamically based on their role
      setTimeout(() => {
        const role = authData.role;
        if (role === 'CUSTOMER') {
          router.push('/');
        } else if (role === 'SELLER') {
          router.push('/seller/dashboard'); // standard seller panel route
        } else if (role === 'RIDER') {
          router.push('/rider/dashboard');  // standard rider panel route
        } else if (role === 'ADMIN') {
          router.push('/admin/dashboard');  // standard admin panel route
        } else {
          router.push('/');
        }
      }, 1500);
    },
    onError: (error) => {
      setNotification({
        type: 'error',
        message: error.message || 'Login failed. Invalid email or password.',
      });
    },
  });

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate(formData);
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
        title="Log In to Delicious"
        subtitle="Manage your orders, store, or deliveries"
        footerText="New to Delicious?"
        footerLinkText="Create account here"
        footerLinkHref="/register/customer"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="yourname@example.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={mutation.isPending}
            required
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-orange-600 hover:text-orange-500 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
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
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={mutation.isPending}
          >
            <LogIn className="w-4 h-4 mr-2" /> Log In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Partner registration:
          </p>
          <div className="mt-2.5 flex justify-center gap-4 text-xs font-bold text-orange-600">
            <Link href="/register/seller" className="hover:underline">Seller Portal</Link>
            <span>•</span>
            <Link href="/register/rider" className="hover:underline">Rider Portal</Link>
          </div>
        </div>
      </AuthCard>
    </div>
  );
}

import Link from 'next/link';
