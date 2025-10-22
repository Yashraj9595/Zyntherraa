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

// Dashboard component
const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
    <p className="text-muted-foreground mt-2">Welcome to your admin dashboard</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground">Total Products</h3>
        <p className="text-3xl font-bold text-primary mt-2">142</p>
      </div>
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground">Total Orders</h3>
        <p className="text-3xl font-bold text-primary mt-2">24</p>
      </div>
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
        <p className="text-3xl font-bold text-primary mt-2">1,240</p>
      </div>
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground">Revenue</h3>
        <p className="text-3xl font-bold text-primary mt-2">₹1,24,500</p>
      </div>
    </div>
  </div>
);

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