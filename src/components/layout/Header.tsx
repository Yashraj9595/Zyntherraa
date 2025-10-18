import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar */}
         <div className="bg-black text-white text-sm py-3 overflow-hidden">
      <div className="container mx-auto px-4 whitespace-nowrap">
        <div className="inline-block animate-marquee">
          {/* Duplicate content for smooth infinite scrolling */}
          ✨ Free shipping on orders over $100
          <span className="text-gray-300 mx-2">|</span>
          🔄 30-day returns
          <span className="text-gray-300 mx-2">|</span>
          🎉 New arrivals daily
          <span className="text-gray-300 mx-2">|</span>
          ✨ Free shipping on orders over $100
          <span className="text-gray-300 mx-2">|</span>
          🔄 30-day returns
          <span className="text-gray-300 mx-2">|</span>
          🎉 New arrivals daily
        </div>
      </div>
    </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
            <img
        src="images/logo.jpeg"
        alt="Logo"
        className="w-32 h-auto" // adjust width as needed
      />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group">
               Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {/* <Link to="/men" className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group">
              Men
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </Link> */}
            <Link to="/category" className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group">
              Shop by category
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {/* <Link to="/kids" className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group">
              Kids
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
            </Link> */}
            <Link to="/shop" className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group">
              shop All
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/sale" className="bg-red-600 text-white px-4 py-2 rounded-full font-bold hover:scale-105 transition-all duration-300">
              🔥 Sale
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-black transition-all duration-300 font-medium relative group">
              Blogs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Search and Icons */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <div className="hidden md:flex items-center glass-dark rounded-2xl px-6 py-3 border border-gray-200 hover:border-purple-300 transition-all duration-300 group">
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
              <Link to="/wishlist" className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 relative group">
                <Heart className="w-6 h-6 group-hover:text-red-500 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  3
                </span>
              </Link>
              <Link to="/cart" className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 relative group">
                <ShoppingCart className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  2
                </span>
              </Link>
              <Link to="/account" className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 group">
                <User className="w-6 h-6 group-hover:text-green-500 transition-colors" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/shop"
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/men"
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                to="/women"
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Women
              </Link>
              <Link
                to="/kids"
                className="text-gray-700 hover:text-black transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kids
              </Link>
              <Link
                to="/sale"
                className="text-red-600 hover:text-red-700 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sale
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
