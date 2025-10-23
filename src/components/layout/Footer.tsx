import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ChevronDown } from 'lucide-react';

const Footer: React.FC = () => {
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className="bg-black text-white relative overflow-hidden bottom-nav-safe">
      {/* Subtle geometric background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-20 w-40 h-40 border border-gray-700 rounded-full"></div>
          <div className="absolute bottom-32 left-16 w-24 h-24 bg-gray-800 rounded-lg rotate-45"></div>
          <div className="absolute top-40 left-1/3 w-2 h-32 bg-gray-700"></div>
          <div className="absolute bottom-20 right-1/4 w-32 h-2 bg-gray-700"></div>
        </div>
      </div>

      {/* Brand Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-wider text-white">
            ZYNTHERRAA
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Crafting timeless elegance through sustainable fashion. 
            <br className="hidden sm:block" />
            Where style meets consciousness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Quick Links */}
          <div className="space-y-4">
            <button 
              className="lg:cursor-default lg:pointer-events-none flex justify-between items-center w-full text-lg font-bold mb-4 text-white lg:mb-4"
              onClick={() => toggleSection('quickLinks')}
            >
              <span className="relative">
                Quick Links
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-white"></div>
              </span>
              <ChevronDown 
                className={`w-5 h-5 lg:hidden transition-transform duration-300 ${
                  openSections.quickLinks ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <ul className={`space-y-3 lg:block ${openSections.quickLinks ? 'block' : 'hidden lg:block'}`}>
              <li>
                <Link to="/collections" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Shop All Collections
                </Link>
              </li>
              <li>
                <Link to="/category" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link to="/women" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link to="/sale" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Sale & Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <button 
              className="lg:cursor-default lg:pointer-events-none flex justify-between items-center w-full text-lg font-bold mb-4 text-white lg:mb-4"
              onClick={() => toggleSection('customerCare')}
            >
              <span className="relative">
                Customer Care
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-white"></div>
              </span>
              <ChevronDown 
                className={`w-5 h-5 lg:hidden transition-transform duration-300 ${
                  openSections.customerCare ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <ul className={`space-y-3 lg:block ${openSections.customerCare ? 'block' : 'hidden lg:block'}`}>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-all duration-300 text-sm group flex items-center">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-3 group-hover:bg-white transition-colors"></span>
                  Fashion Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <button 
              className="lg:cursor-default lg:pointer-events-none flex justify-between items-center w-full text-lg font-bold mb-4 text-white lg:mb-4"
              onClick={() => toggleSection('contact')}
            >
              <span className="relative">
                Get in Touch
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-white"></div>
              </span>
              <ChevronDown 
                className={`w-5 h-5 lg:hidden transition-transform duration-300 ${
                  openSections.contact ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <div className={`lg:block ${openSections.contact ? 'block' : 'hidden lg:block'}`}>
              <div className="space-y-4">
                <div className="flex items-start text-gray-400 hover:text-white transition-colors group">
                  <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-gray-500 group-hover:text-white transition-colors" />
                  <span className="text-sm leading-relaxed">
                    123 Fashion Street, Style City, SC 12345
                  </span>
                </div>
                <div className="flex items-center text-gray-400 hover:text-white transition-colors group">
                  <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-gray-500 group-hover:text-white transition-colors" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-400 hover:text-white transition-colors group">
                  <Mail className="w-5 h-5 mr-3 flex-shrink-0 text-gray-500 group-hover:text-white transition-colors" />
                  <span className="text-sm break-all sm:break-normal">
                    support@zyntherraa.com
                  </span>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="mt-6">
                <h5 className="text-white font-semibold mb-3 text-sm">Follow Us</h5>
                <div className="flex space-x-3">
                  <a
                    href="https://www.instagram.com/zyntherraa"
                    aria-label="Zyntherraa on Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-300 group hover:bg-gray-800"
                  >
                    <Instagram className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </a>
                  <a
                    href="https://www.facebook.com/zyntherraa"
                    aria-label="Zyntherraa on Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-300 group hover:bg-gray-800"
                  >
                    <Facebook className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </a>
                  <a
                    href="https://twitter.com/zyntherraa"
                    aria-label="Zyntherraa on Twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-300 group hover:bg-gray-800"
                  >
                    <Twitter className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter subscription */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <button 
              className="lg:cursor-default lg:pointer-events-none flex justify-between items-center w-full text-lg font-bold mb-4 text-white lg:mb-4"
              onClick={() => toggleSection('newsletter')}
            >
              <span className="relative">
                Stay in Style
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-white"></div>
              </span>
              <ChevronDown 
                className={`w-5 h-5 lg:hidden transition-transform duration-300 ${
                  openSections.newsletter ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <div className={`lg:block ${openSections.newsletter ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  Subscribe to our newsletter for exclusive updates on new collections, 
                  fashion trends, and special offers.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-lg bg-black border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                  />
                  <button className="w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-sm bg-white text-black hover:bg-gray-200">
                    Subscribe Now
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-3 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm mb-1">
                © 2025 Zyntherraa. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs">
                Crafted with 🖤 for timeless fashion
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
