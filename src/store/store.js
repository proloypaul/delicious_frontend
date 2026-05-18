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
      
      setUser: (user) => {
        if (typeof window !== 'undefined') {
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            localStorage.removeItem('user');
          }
        }
        set({ user });
      },
      
      setToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
        }
        set({ token });
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({ user: null, token: null });
      },
    }),
    {
      name: 'delicious-auth',
    }
  )
);
