import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/admin/AdminPage';
import AdminLayout from './pages/admin/AdminLayout';
import ProductsCollection from './pages/ProductsCollection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout><AdminPage /></AdminLayout>} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/blog" element={<ShopPage />} />
              <Route path="/women" element={<ShopPage />} />
              <Route path="/category" element={<ShopPage />} />
              <Route path="/sale" element={<ShopPage />} />
              <Route path="/customization" element={<ShopPage />} />
              <Route path="/terms" element={<ShopPage />} />
              <Route path="/offers" element={<ShopPage />} />
              <Route path="/returns" element={<ShopPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/collections" element={<ProductsCollection />} />
              <Route path="/category/:category" element={<ProductsCollection />} />
              <Route path="/wishlist" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Wishlist - Coming Soon</h1></div>} />
              <Route path="/account" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Account - Coming Soon</h1></div>} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;