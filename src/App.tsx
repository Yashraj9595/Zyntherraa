import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/user/HomePage';
import ShopPage from './pages/user/ShopPage';
import CartPage from './pages/user/CartPage';
import ProductsCollection from './pages/user/ProductsCollection';
import AdminRouter from './pages/admin/AdminRouter';
import AdminLayout from './pages/admin/AdminLayout';
import { CacheManager } from './components/CacheManager';
import ProductDetails from "./pages/user/ProductDetails";

function App() {
  return (
    <Router>
      <CacheManager appVersion="1.0.1" showNotification={true} />
      <Routes>
        <Route path="/admin/*" element={<AdminLayout><AdminRouter /></AdminLayout>} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/collections" element={<ProductsCollection />} />
              <Route path="/category/:category" element={<ProductsCollection />} />
              <Route path="/men" element={<ShopPage />} />
              <Route path="/women" element={<ShopPage />} />
              <Route path="/kids" element={<ShopPage />} />
              <Route path="/sale" element={<ShopPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<div className="min-h-screen flex items-center justify-center bottom-nav-safe"><h1 className="text-2xl">Wishlist - Coming Soon</h1></div>} />
              <Route path="/account" element={<div className="min-h-screen flex items-center justify-center bottom-nav-safe"><h1 className="text-2xl">Account - Coming Soon</h1></div>} />
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
    </Router>
  );
}

export default App;