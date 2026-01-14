import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { categoryApi } from "../../utils/api";

interface Category {
  _id: string;
  name: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll() as { categories: Category[] };
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      
      {/* Top Bar */}
    <div className="bg-black text-white text-sm py-3 overflow-hidden">
      <div className="container mx-auto px-4 whitespace-nowrap">
        <div className="inline-block animate-marquee">
          🎀 ZYNTHERRAA is coming soon!
          <span className="text-gray-400 mx-3">|</span>
          ✨ Explore our exclusive designer wear collection
          <span className="text-gray-400 mx-3">|</span>
          🛍️ Visit us at upcoming fashion exhibitions
          <span className="text-gray-400 mx-3">|</span>
          💫 Shop online for a seamless style experience
        </div>
      </div>
    </div>


      {/* Main header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="inline-block hover:scale-105 transition-transform duration-500"
          >
            <h1 className="font-[Orbitron] font-extrabold tracking-widest text-black text-[30px] select-none">
              ZYNTHERRAA
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {/* Home */}
            <Link
              to="/"
              className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Shop by Category with Submenu */}
            <div className="relative group">
              <Link
                to="/collections"
                className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group"
              >
                Shop by category
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* Submenu */}
              <div
                className="absolute left-0 top-full bg-white shadow-lg rounded-lg py-3 w-56 
                          opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                          translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-in-out z-50"
              >
                {categories.map((item) => (
                  <Link
                    key={item._id}
                    to={`/category/${item.name.toLowerCase().replace(/\s+/g, '')}`}
                    className="block px-5 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Shop All */}
            <Link
              to="/shop"
              className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group"
            >
              Shop All
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Blogs */}
            <Link
              to="/blog"
              className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group"
            >
              Blogs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Search + Icons + Mobile Menu Button */}
          <div className="flex items-center space-x-6">
            {/* Search (Desktop) */}
            <div className="hidden md:flex items-center rounded-2xl px-6 py-3 border border-gray-200 hover:border-purple-300 transition-all duration-300 group">
              <Search className="w-5 h-5 text-gray-500 mr-3 group-hover:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for style..."
                className="bg-transparent outline-none text-sm w-52 placeholder-gray-500"
              />
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 md:hidden group">
                <Search className="w-6 h-6 group-hover:text-purple-500 transition-colors" />
              </button>
              <Link
                to="/wishlist"
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 relative group"
              >
                <Heart className="w-6 h-6 group-hover:text-red-500 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  3
                </span>
              </Link>
              <Link
                to="/cart"
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 relative group"
              >
                <ShoppingCart className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  2
                </span>
              </Link>
              <Link
                to="/account"
                className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 group"
              >
                <User className="w-6 h-6 group-hover:text-green-500 transition-colors" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg rounded-lg mt-4 p-4 space-y-3 animate-slideDown">
            <Link
              to="/"
              className="block text-gray-800 font-medium hover:text-purple-600 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {/* Category Toggle in Mobile */}
            <button
              className="flex justify-between items-center w-full text-gray-800 font-medium hover:text-pink-600 transition-all"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              Shop by category
              <ChevronDown
                className={`w-5 h-5 transform transition-transform ${
                  isCategoryOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {isCategoryOpen && (
              <div className="pl-4 space-y-2">
                {categories.map((item) => (
                  <Link
                    key={item._id}
                    to={`/category/${item.name.toLowerCase().replace(/\s+/g, '')}`}
                    className="block text-gray-700 hover:text-pink-600 transition-all"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCategoryOpen(false);
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/shop"
              className="block text-gray-800 font-medium hover:text-green-600 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop All
            </Link>
            <Link
              to="/blog"
              className="block text-gray-800 font-medium hover:text-green-600 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
