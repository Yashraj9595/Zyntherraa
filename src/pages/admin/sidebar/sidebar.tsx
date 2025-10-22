"use client";

import { LayoutDashboard, Package, Tag, ShoppingCart, Users, Boxes, BarChart3, Home, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
}

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "home", label: "Home Page", icon: Home, path: "/admin/home" },
    { id: "products", label: "Products", icon: Package, path: "/admin/products" },
    { id: "categories", label: "Categories", icon: Tag, path: "/admin/categories" },
    { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { id: "customers", label: "Customers", icon: Users, path: "/admin/customers" },
    { id: "inventory", label: "Inventory", icon: Boxes, path: "/admin/inventory" },
    { id: "reports", label: "Reports", icon: BarChart3, path: "/admin/reports" },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border flex-shrink-0">
        <h1 className="text-2xl font-bold text-sidebar-foreground">Admin</h1>
        <p className="text-sm text-sidebar-foreground/60">Indian Clothing Store</p>
      </div>

      {/* Navigation - This will scroll if needed and take available space */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                console.log("Sidebar clicked:", item.id, "navigating to:", item.path);
                navigate(item.path);
                if (setCurrentPage) {
                  setCurrentPage(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings - Fixed at the bottom */}
      <div className="p-4 border-t border-sidebar-border flex-shrink-0">
        <button 
          onClick={() => {
            navigate("/admin/settings");
            if (setCurrentPage) {
              setCurrentPage("settings");
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            (location.pathname === "/admin/settings" || currentPage === "settings")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}