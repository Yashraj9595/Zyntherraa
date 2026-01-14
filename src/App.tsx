import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/user/HomePage';
import ShopPage from './pages/user/ShopPage';
import CartPage from './pages/user/CartPage';
import ProductsCollection from './pages/user/ProductsCollection';
import ProductDetailPage from './pages/user/ProductDetailPage';
import AdminRouter from './pages/admin/AdminRouter';
import AdminLayout from './pages/admin/AdminLayout';
import { CacheManager } from './components/CacheManager';
import { getHealth } from './utils/api';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Login from './pages/auth/Login';

function App() {
  const [backendOk, setBackendOk] = useState<boolean | null>(null)

  useEffect(() => {
    getHealth()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false))
  }, [])

  return (
    <Router>
      <CacheManager appVersion="1.0.1" showNotification={true} />
      {backendOk === false && (
        <div className="w-full text-center text-sm text-white bg-red-600 py-1">Backend unreachable. Check server at /api/health.</div>
      )}
      <Routes>
        <Route path="/login" element={<AuthProvider><Login /></AuthProvider>} />
        <Route path="/admin/*" element={
          <AuthProvider>
            <ProtectedRoute role="admin">
              <AdminLayout><AdminRouter /></AdminLayout>
            </ProtectedRoute>
          </AuthProvider>
        } />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/collections" element={<ProductsCollection />} />
              <Route path="/category/:category" element={<ProductsCollection />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/men" element={<ShopPage />} />
              <Route path="/women" element={<ShopPage />} />
              <Route path="/kids" element={<ShopPage />} />
              <Route path="/sale" element={<ShopPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Wishlist - Coming Soon</h1></div>} />
              <Route path="/account" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Account - Coming Soon</h1></div>} />
              <Route path="/blog" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Blog - Coming Soon</h1></div>} />
              <Route path="/terms" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Terms & Conditions - Coming Soon</h1></div>} />
              <Route path="/returns" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Returns & Exchanges - Coming Soon</h1></div>} />
              <Route path="/offers" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Offers - Coming Soon</h1></div>} />
              <Route path="/customization" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Customization - Coming Soon</h1></div>} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;