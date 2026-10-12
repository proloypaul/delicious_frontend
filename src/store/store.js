import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        // In backend product representation, id can be numeric or string, let's cast to string or compare carefully.
        const existingItemIndex = currentItems.findIndex(item => String(item.id) === String(product.id));
        
        if (existingItemIndex > -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, { ...product, quantity }] });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => String(item.id) !== String(productId)) });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(item =>
            String(item.id) === String(productId) ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (Number(item.price) || 0) * item.quantity, 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'delicious-cart',
    }
  )
);

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      /**
       * Store the authenticated user object.
       * Zustand persist middleware automatically synchronizes to localStorage.
       */
      setUser: (user) => set({ user }),

      /**
       * Store the JWT token returned from login/register.
       */
      setToken: (token) => set({ token }),

      /**
       * Clear authentication session and invalidate cookies on backend and frontend.
       */
      logout: async () => {
        if (typeof window !== 'undefined') {
          try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9080/api/v1';
            await fetch(`${apiBase}/auth/logout`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
          } catch (e) {
            // ignore network errors on logout
          }

          document.cookie = 'delicious_token=; path=/; max-age=0';
          document.cookie = 'delicious_role=; path=/; max-age=0';
          document.cookie = 'delicious_refresh_token=; path=/; max-age=0';
        }
        set({ user: null, token: null });
      },
    }),
    {
      name: 'delicious-auth',
    }
  )
);

export const useAdminStore = create(
  persist(
    (set) => ({
      activeTab: 'products',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'delicious-admin-tab',
    }
  )
);
