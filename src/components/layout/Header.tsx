import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const categories = [
    { name: "One Piece", path: "/category/onepiece" },
    { name: "Crop Tops", path: "/category/croptop" },
    { name: "Casual Shirts", path: "/category/tshirt" },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      
      {/* Top Bar */}
    <div className="theme-gradient text-white text-xs sm:text-sm py-1 sm:py-2 overflow-hidden">
      <div className="container mx-auto px-2 sm:px-4 whitespace-nowrap">
        <div className="inline-block animate-marquee">
          🖤 ZYNTHERRAA - Your Style Destination!
          <span className="text-gray-300 mx-2 sm:mx-3">|</span>
          ✨ Free shipping on orders above ₹999
          <span className="text-gray-300 mx-2 sm:mx-3 hidden sm:inline">|</span>
          <span className="hidden sm:inline">🛍️ New arrivals every week</span>
          <span className="text-gray-300 mx-2 sm:mx-3 hidden md:inline">|</span>
          <span className="hidden md:inline">🤍 Timeless fashion choices</span>
        </div>
      </div>
    </div>


      {/* Main header */}
      <div className="container mx-auto px-4 sm:px-4 py-2 relative">
        <div className="flex items-center justify-between md:justify-between">
          {/* Logo */}
          <div className="flex-1 md:flex-initial flex justify-center md:justify-start">
            <Link
              to="/"
              className="inline-block hover:scale-105 transition-transform duration-500 flex-shrink-0"
            >
              <h1 className="logo-primary select-none" style={{fontSize: '1.2rem'}}>
                ZYNTHERRAA
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            {/* Home */}
            <Link
              to="/"
              className="theme-text-secondary hover:text-black transition-all duration-300 font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{backgroundColor: 'var(--primary-dark)'}}></span>
            </Link>

            {/* Shop by Category with Submenu */}
            <div className="relative group">
              <Link
                to="/collections"
                className="theme-text-secondary hover:text-black transition-all duration-300 font-medium relative group"
              >
                Shop by category
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{backgroundColor: 'var(--primary-medium)'}}></span>
              </Link>

              {/* Submenu */}
              <div
                className="absolute left-0 top-full bg-white shadow-lg rounded-lg py-3 w-56 
                          opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto 
                          translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-in-out z-50"
              >
                {categories.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
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
              className="theme-text-secondary hover:text-black transition-all duration-300 font-medium relative group"
            >
              Shop All
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{backgroundColor: 'var(--primary-lighter)'}}></span>
            </Link>

            {/* Blogs */}
            <Link
              to="/blog"
              className="theme-text-secondary hover:text-black transition-all duration-300 font-medium relative group"
            >
              Blogs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{backgroundColor: 'var(--primary-lighter)'}}></span>
            </Link>
          </nav>

          {/* Search + Icons + Mobile Menu Button */}
          <div className="flex items-center space-x-1 sm:space-x-3 lg:space-x-6">
            {/* Search (Desktop) */}
            <div className="hidden lg:flex items-center rounded-2xl px-4 lg:px-6 py-2 lg:py-3 border theme-border hover:border-gray-400 transition-all duration-300 group">
              <Search className="w-4 lg:w-5 h-4 lg:h-5 theme-text-muted mr-2 lg:mr-3 transition-colors" style={{color: 'var(--primary-dark)'}} />
              <input
                type="text"
                placeholder="Search for style..."
                className="bg-transparent outline-none text-sm w-32 lg:w-52 placeholder-gray-500"
              />
            </div>

            {/* Icons - Hide duplicates on mobile since we have bottom nav */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 lg:space-x-3">
              {/* Search - Only show on larger screens, mobile has it in bottom nav */}
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hidden sm:block lg:hidden group">
                <Search className="w-4 sm:w-5 h-4 sm:h-5 transition-colors" style={{color: 'var(--primary-dark)'}} />
              </button>
              
              {/* Wishlist, Cart, Account - Only show on tablet and desktop since mobile has bottom nav */}
              <Link
                to="/wishlist"
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 relative group hidden sm:block"
              >
                <Heart className="w-4 sm:w-5 h-4 sm:h-5 transition-colors" style={{color: 'var(--primary-dark)'}} />
                <span className="badge-theme absolute -top-0.5 -right-0.5 text-white text-xs rounded-full w-3.5 sm:w-4 h-3.5 sm:h-4 flex items-center justify-center font-bold text-[10px] sm:text-xs">
                  3
                </span>
              </Link>
              <Link
                to="/cart"
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 relative group hidden sm:block"
              >
                <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5 transition-colors" style={{color: 'var(--primary-dark)'}} />
                <span className="badge-theme absolute -top-0.5 -right-0.5 text-white text-xs rounded-full w-3.5 sm:w-4 h-3.5 sm:h-4 flex items-center justify-center font-bold theme-pulse text-[10px] sm:text-xs">
                  2
                </span>
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 group hidden sm:block"
                >
                  <User className="w-4 sm:w-5 h-4 sm:h-5 transition-colors" style={{color: 'var(--primary-dark)'}} />
                </button>
              ) : (
                <Link
                  to="/auth/login"
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 group hidden sm:block"
                >
                  <User className="w-4 sm:w-5 h-4 sm:h-5 transition-colors" style={{color: 'var(--primary-dark)'}} />
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors absolute right-4"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer - Simplified for categories and search only */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg rounded-lg mt-2 p-3 space-y-3 animate-slideDown">
            {/* Mobile Search */}
            <div className="flex items-center rounded-2xl px-4 py-3 border theme-border">
              <Search className="w-5 h-5 mr-3" style={{color: 'var(--primary-dark)'}} />
              <input
                type="text"
                placeholder="Search for style..."
                className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500"
              />
            </div>

            {/* Category Toggle in Mobile */}
            <button
              className="flex justify-between items-center w-full theme-text-primary font-medium transition-all py-2"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              Shop by Category
              <ChevronDown
                className={`w-5 h-5 transform transition-transform ${
                  isCategoryOpen ? "rotate-180" : "rotate-0"
                }`}
                style={{color: 'var(--primary-dark)'}}
              />
            </button>
            {isCategoryOpen && (
              <div className="pl-4 space-y-2 theme-primary-light rounded-lg p-3">
                {categories.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block theme-text-secondary hover:text-black transition-all py-2 px-3 rounded-lg hover:bg-white"
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
              className="block text-gray-800 font-medium hover:text-gray-600 transition-all py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop All
            </Link>
            <Link
              to="/blog"
              className="block text-gray-800 font-medium hover:text-gray-600 transition-all py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>

            {/* Mobile Account Link */}
            <div className="border-t border-gray-200 mt-3 pt-3 sm:hidden">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-800 font-medium hover:text-gray-600 transition-all py-2"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/auth/login"
                  className="block text-gray-800 font-medium hover:text-gray-600 transition-all py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;