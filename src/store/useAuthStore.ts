import { create } from 'zustand';
import type { User } from '../types';

/**
 * Zustand authentication store.
 *
 * Handles:
 *  - currentUser: the logged-in user (or null)
 *  - token: session token from the API
 *  - isAuthenticated: derived boolean
 *  - login(): POST /api/auth/login with email + password
 *  - signup(): POST /api/auth/signup (always creates customer role)
 *  - logout(): clears the session
 *  - updateProfile(): updates local user state after profile changes
 *
 * NOT persisted — the store starts empty on every page load.
 * No user profile (including super admin) is auto-loaded.
 * Users must explicitly sign in each time they open the app.
 *
 * SECURITY:
 *  - Passwords are NEVER stored in this store.
 *  - The token is an opaque string, not a JWT (for this demo).
 *  - The passwordHash field is never included in the stored user.
 *  - No session data is written to localStorage.
 */

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        set({
          currentUser: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }
      set({ isLoading: false, error: data.error || 'Login failed' });
      return { success: false, error: data.error };
    } catch {
      set({ isLoading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.success) {
        set({
          currentUser: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }
      set({ isLoading: false, error: data.error || 'Signup failed' });
      return { success: false, error: data.error };
    } catch {
      set({ isLoading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  logout: () => {
    set({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: (updates) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    }));
  },

  clearError: () => set({ error: null }),
}));
