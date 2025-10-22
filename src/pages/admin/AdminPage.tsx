"use client";

import { useState } from "react";
import Sidebar from "./sidebar/sidebar";
import ProductsPage from "./products-page/products-page";
import OrdersPage from "./orders-page/OrdersPage";
import CategoriesPage from "./categories-page/CategoriesPage";
import SettingsPage from "./settings-page";

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "products":
        return <ProductsPage />;
      case "orders":
        return <OrdersPage />;
      case "categories":
        console.log("Rendering Categories Page");
        return <CategoriesPage />;
      case "analytics":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-2">View detailed analytics and insights</p>
            <div className="mt-6 p-6 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      case "home":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground">Home Page Management</h1>
            <p className="text-muted-foreground mt-2">Manage your website's home page content</p>
            <div className="mt-6 p-6 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Home page management coming soon...</p>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-2">Manage customer accounts and information</p>
            <div className="mt-6 p-6 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Customer management coming soon...</p>
            </div>
          </div>
        );
      case "inventory":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-2">Track and manage product inventory</p>
            <div className="mt-6 p-6 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Inventory management coming soon...</p>
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-2">Generate and view business reports</p>
            <div className="mt-6 p-6 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Reports dashboard coming soon...</p>
            </div>
          </div>
        );
      case "settings":
        return <SettingsPage />;
      case "dashboard":
      default:
        return (
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
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}