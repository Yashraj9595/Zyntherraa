import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      
      {/* <div className="bg-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay in Style</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new collections, 
            exclusive offers, and fashion trends.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-white transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/category" className="text-gray-300 hover:text-white transition-colors">
                  Shop by category
                </Link>
              </li>
              <li>
                <Link to="/women" className="text-gray-300 hover:text-white transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/sale" className="text-gray-300 hover:text-white transition-colors">
                  Sale Items
                </Link>
              </li>
              <li>
                <Link to="/customization" className="text-gray-300 hover:text-white transition-colors">
                  Customization
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get to knows</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Condition
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-white transition-colors">
                  Returns & Exchanges policy
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Condition offers 
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm">123 Fashion Street, Style City, SC 12345</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="text-sm">support@zyntherraa.com</span>
              </div>
            </div>
          </div>

          {/* News letters subscribtion*/}

          <div>
            <h4 className="text-lg font-semibold mb-4">Stay in Style</h4>
             <div className="bg-gray-800 py-12">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Subscribe to our newsletter and be the first to know about new
                  collections, exclusive offers, and fashion trends.
                </p>
                <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Zyntherraa. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
