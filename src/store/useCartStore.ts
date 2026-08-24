import { create } from 'zustand';
import type { Product, ProductVariation } from '../types';

/**
 * Zustand cart store.
 *
 * Handles:
 *  - items: cart items with product, variation, quantity
 *  - add(): add a product to the cart (deduplicates by product+variation)
 *  - remove(): remove an item by product + variation ID
 *  - updateQuantity(): change quantity (removes if qty drops to 0)
 *  - clear(): empty the cart
 *  - subtotal: derived total (no tax/shipping)
 *  - count: derived total unit count
 *
 * NOT persisted — cart starts empty on every page load.
 */

export interface CartItem {
  productId: string;
  product: Product;
  variation?: ProductVariation;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  add: (product: Product, variation?: ProductVariation, quantity?: number) => void;
  remove: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, variationId: string | undefined, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Derived getters
  getSubtotal: () => number;
  getCount: () => number;
  isInCart: (productId: string, variationId?: string) => boolean;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,

  add: (product, variation, quantity = 1) => {
    const activeVar = variation || (product.variations && product.variations.length > 0 ? product.variations[0] : undefined);
    set((state) => {
      const existingIdx = state.items.findIndex(
        (item) => item.productId === product.id && (activeVar ? item.variation?.id === activeVar.id : !item.variation)
      );
      if (existingIdx !== -1) {
        // Already in cart — increment quantity
        const newItems = [...state.items];
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: newItems[existingIdx].quantity + quantity,
        };
        return { items: newItems };
      }
      // New item
      return {
        items: [...state.items, { productId: product.id, product, variation: activeVar, quantity }],
      };
    });
  },

  remove: (productId, variationId) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.productId === productId && (variationId ? item.variation?.id === variationId : !item.variation))
      ),
    }));
  },

  updateQuantity: (productId, variationId, qty) => {
    if (qty <= 0) {
      get().remove(productId, variationId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId && (variationId ? item.variation?.id === variationId : !item.variation)
          ? { ...item, quantity: qty }
          : item
      ),
    }));
  },

  clear: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => {
      const price = item.variation ? item.variation.price : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  },

  getCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  isInCart: (productId, variationId) => {
    return get().items.some(
      (item) => item.productId === productId && (variationId ? item.variation?.id === variationId : !item.variation)
    );
  },
    }));
