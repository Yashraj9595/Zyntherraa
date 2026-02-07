import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './sidebar/sidebar';
import ProductsPage from './products-page/products-page';
import OrdersPage from './orders-page/OrdersPage';
import CategoriesPage from './categories-page/CategoriesPage';
import HomePageManagement from './HomePageManagement';
import UsersPage from './UsersPage/UsersPage';
import SettingsPage from './settings-page';
import InventoryPage from './inventory/InventoryPage';
import ReportsPage from './reports/ReportsPage';
import Dashboard from './dashboard/Dashboard';

export default function AdminRouter() {
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-auto ml-64">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<HomePageManagement />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/customers" element={<UsersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}