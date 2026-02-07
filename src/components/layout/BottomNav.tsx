import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartCount = getCartItemCount();
  const wishlistCount = getWishlistCount();

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home',
      activeColor: 'theme-text-secondary'
    },
    { 
      path: '/collections', 
      icon: Search, 
      label: 'Shop',
      activeColor: 'theme-text-secondary'
    },
    { 
      path: '/wishlist', 
      icon: Heart, 
      label: 'Wishlist',
      activeColor: 'theme-text-secondary',
      badge: wishlistCount
    },
    { 
      path: '/cart', 
      icon: ShoppingBag, 
      label: 'Cart',
      activeColor: 'theme-text-secondary',
      badge: cartCount
    },
    { 
      path: '/account', 
      icon: User, 
      label: 'Account',
      activeColor: 'theme-text-secondary'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 safe-area-bottom bottom-nav-bar">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                isActive 
                  ? 'theme-primary-light scale-105' 
                  : 'theme-text-muted hover:text-gray-700 hover:bg-gray-50'
              }`}
              style={isActive ? {color: 'var(--primary-dark)'} : {}}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'scale-110' : ''
                  }`} 
                />
                
                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`badge-theme absolute -top-2 -right-2 min-w-[16px] h-4 px-1 text-xs font-bold rounded-full flex items-center justify-center ${
                    isActive ? 'theme-pulse' : ''
                  }`}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-xs font-medium mt-1 transition-all duration-300 ${
                isActive ? 'opacity-100 scale-105' : 'opacity-70'
              }`}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full theme-pulse" style={{backgroundColor: 'var(--primary-dark)'}} />
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-bottom" />
    </nav>
  );
};

export default BottomNav;
