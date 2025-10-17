"use client";

import { useState } from "react";
import Sidebar from "./sidebar/sidebar";
import ProductsPage from "./products-page/products-page";
import OrdersPage from "./orders-page/OrdersPage";

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "products":
        return <ProductsPage />;
      case "orders":
        return <OrdersPage />;
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