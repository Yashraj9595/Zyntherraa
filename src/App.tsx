import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AuthRoute from './components/AuthRoute';
import AdminRoute from './components/AdminRoute';
import CookieConsentPopup from './components/CookieConsentPopup';
import { CacheManager } from './components/CacheManager';

// Lazy load components for code splitting
const HomePage = lazy(() => import('./pages/user/HomePage'));
const ShopPage = lazy(() => import('./pages/user/ShopPage'));
const CartPage = lazy(() => import('./pages/user/CartPage'));
const ProductsCollection = lazy(() => import('./pages/user/ProductsCollection'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/user/OrderConfirmationPage'));
const ProductDetails = lazy(() => import('./pages/user/ProductDetails'));
const AdminRouter = lazy(() => import('./pages/admin/AdminRouter'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/auth/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyOTPPage = lazy(() => import('./pages/auth/VerifyOTPPage'));
const VerifyResetOTPPage = lazy(() => import('./pages/auth/VerifyResetOTPPage'));
const WishlistPage = lazy(() => import('./pages/user/WishlistPage'));
const OrderHistoryPage = lazy(() => import('./pages/user/OrderHistoryPage'));
const AddressManagementPage = lazy(() => import('./pages/user/AddressManagementPage'));
const AccountSettingsPage = lazy(() => import('./pages/user/AccountSettingsPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <WishlistProvider>
      <Router>
        <CacheManager appVersion="1.0.3" showNotification={true} />
        <CookieConsentPopup />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/verify-reset-otp" element={<VerifyResetOTPPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin/*" element={
              <AdminRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminLayout><AdminRouter /></AdminLayout>
                </Suspense>
              </AdminRoute>
            } />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/collections" element={<ProductsCollection />} />
                <Route path="/all-products" element={<ProductsCollection />} />
                <Route path="/category/:category" element={<ProductsCollection />} />
                <Route path="/men" element={<ShopPage />} />
                <Route path="/women" element={<ShopPage />} />
                <Route path="/kids" element={<ShopPage />} />
                <Route path="/sale" element={<ShopPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={
                  <AuthRoute>
                    <CheckoutPage />
                  </AuthRoute>
                } />
                <Route path="/order-confirmation/:id" element={
                  <AuthRoute>
                    <OrderConfirmationPage />
                  </AuthRoute>
                } />
                <Route path="/account" element={
                  <AuthRoute>
                    <ProfilePage />
                  </AuthRoute>
                } />
                <Route path="/account/settings" element={
                  <AuthRoute>
                    <AccountSettingsPage />
                  </AuthRoute>
                } />
                <Route path="/orders" element={
                  <AuthRoute>
                    <OrderHistoryPage />
                  </AuthRoute>
                } />
                <Route path="/addresses" element={
                  <AuthRoute>
                    <AddressManagementPage />
                  </AuthRoute>
                } />
                <Route path="/wishlist" element={
                  <AuthRoute>
                    <WishlistPage />
                  </AuthRoute>
                } />
                <Route path="/blog" element={<div className="min-h-screen flex items-center justify-center bottom-nav-safe"><h1 className="text-2xl">Blog - Coming Soon</h1></div>} />
                <Route path="/terms" element={<div className="min-h-screen flex items-center justify-center bottom-nav-safe"><h1 className="text-2xl">Terms & Conditions - Coming Soon</h1></div>} />
                <Route path="/returns" element={<div className="min-h-screen flex items-center justify-center bottom-nav-safe"><h1 className="text-2xl">Returns & Exchanges - Coming Soon</h1></div>} />
                <Route path="/offers" element={<div className="min-h-screen flex items-center justify-center bottom-nav-safe"><h1 className="text-2xl">Offers - Coming Soon</h1></div>} />
                <Route path="/customization" element={<div className="min-h-screen flex items-center justify-center bottom-nav-safe"><h1 className="text-2xl">Customization - Coming Soon</h1></div>} />
                <Route path="/product/:id" element={<ProductDetails />} />
              </Routes>
            </Layout>
          } />
          </Routes>
        </Suspense>
      </Router>
      </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;