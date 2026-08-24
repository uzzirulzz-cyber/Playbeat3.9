import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NotificationToast } from './components/common/NotificationToast';
import { CartDrawer } from './components/common/CartDrawer';
import { WishlistDrawer } from './components/common/WishlistDrawer';
import { AuthModal } from './components/common/AuthModal';
import { WhatsAppModal } from './components/common/WhatsAppModal';
import { HeroSection } from './components/storefront/HeroSection';
import { CategoryGrid } from './components/storefront/CategoryGrid';
import { TrendingSection } from './components/storefront/TrendingSection';
import { VideoStreamingSection } from './components/storefront/VideoStreamingSection';
import { SmartProjectorShowcase } from './components/storefront/SmartProjectorShowcase';
import { FlashDealsSection } from './components/storefront/FlashDealsSection';
import { FAQSection } from './components/storefront/FAQSection';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { CustomerPortalModal } from './components/storefront/CustomerPortalModal';
import { ProjectorComparisonModal } from './components/storefront/ProjectorComparisonModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginGate } from './components/admin/AdminLoginGate';
import { useAuthStore } from './store/useAuthStore';

/**
 * Check if the current URL path is /admin.
 * Supports /admin, /admin/, /admin?anything, /admin#anything
 */
function isAdminUrl(): boolean {
  const path = window.location.pathname.replace(/\/+$/, ''); // strip trailing slashes
  return path === '/admin' || path.endsWith('/admin');
}

const AppContent: React.FC = () => {
  const { activeView, setActiveView, currentUser, setCurrentUser } = useStore();

  // Check if the current user is an authenticated admin
  const ADMIN_ROLES = ['super_admin', 'admin', 'product_manager', 'order_manager', 'finance_manager', 'support_agent', 'content_manager', 'marketing_manager', 'read_only'];
  const isAdminAuthenticated = currentUser && currentUser.id !== 'guest' && ADMIN_ROLES.includes(currentUser.role);

  // ── Clean up stale localStorage from previous persist middleware ───
  // The Zustand auth + cart stores no longer use persist, but old keys
  // from previous versions may still be in the browser. Remove them so
  // no profile or session data is auto-loaded on app start.
  useEffect(() => {
    try {
      localStorage.removeItem('playbeat-auth');
      localStorage.removeItem('playbeat-cart');
    } catch {
      // Ignore errors (private mode, etc.)
    }
    fetch('/api/auth/me')
      .then(async response => response.ok ? response.json() : null)
      .then(data => {
        if (data?.success && data.user) {
          useAuthStore.setState({ currentUser: data.user, isAuthenticated: true });
          setCurrentUser(data.user);
        }
      })
      .catch(() => { /* Anonymous visitors have no session to hydrate. */ });
  }, []);

  // ── URL-based routing ──────────────────────────────────────
  // On mount, check if the URL is /admin and switch to admin view.
  // Also listen for popstate (browser back/forward) so navigation works.
  useEffect(() => {
    // Set initial view based on URL
    if (isAdminUrl() && activeView !== 'admin') {
      setActiveView('admin');
    }

    // Listen for browser back/forward
    const handlePopState = () => {
      if (isAdminUrl()) {
        setActiveView('admin');
      } else {
        setActiveView('store');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When activeView changes, update the URL to match
  useEffect(() => {
    const currentPath = window.location.pathname.replace(/\/+$/, '');
    const shouldBeAdmin = activeView === 'admin';
    const urlIsAdmin = currentPath === '/admin' || currentPath.endsWith('/admin');

    if (shouldBeAdmin && !urlIsAdmin) {
      // Switching TO admin — push /admin to the URL
      window.history.pushState({ view: 'admin' }, '', '/admin');
    } else if (!shouldBeAdmin && urlIsAdmin) {
      // Switching TO storefront — push / to the URL
      window.history.pushState({ view: 'store' }, '', '/');
    }
  }, [activeView]);

  return (
    <div className="min-h-screen pb-bg-premium text-[var(--pb-silver)] selection:bg-[var(--pb-red)] selection:text-white font-sans antialiased">
      {/* Dynamic Global Toast Notifications */}
      <NotificationToast />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <WishlistDrawer />
      <AuthModal />
      <WhatsAppModal />
      <ProductDetailModal />
      <CheckoutModal />
      <CustomerPortalModal />
      <ProjectorComparisonModal />

      {activeView === 'admin' ? (
        /* ADMIN VIEW — password protected */
        isAdminAuthenticated ? (
          <AdminLayout />
        ) : (
          <AdminLoginGate />
        )
      ) : (
        /* STOREFRONT VIEW — default landing page */
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <HeroSection />
            <CategoryGrid />
            <VideoStreamingSection />
            <TrendingSection />
            <SmartProjectorShowcase />
            <FlashDealsSection />
            <FAQSection />
          </main>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
