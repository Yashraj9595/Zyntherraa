import React, { useState, useEffect } from 'react';
import { X, Cookie, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const CookieConsentPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();

  const closePopup = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  useEffect(() => {
    // Don't show on admin or auth pages
    const isAdminPage = location.pathname.startsWith('/admin');
    const isAuthPage = location.pathname.startsWith('/auth');
    
    if (isAdminPage || isAuthPage) {
      setIsVisible(false);
      setIsAnimating(false);
      return;
    }

    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    
    // Show popup if consent hasn't been given
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    closePopup();
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    closePopup();
  };

  const handleCustomize = () => {
    // Store that user wants to customize
    localStorage.setItem('cookieConsent', 'customize');
    closePopup();
    // You can navigate to a cookie settings page here
    // navigate('/cookie-settings');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[9999] p-4 transition-all duration-300 ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-2xl p-6">
        <div className="flex items-start gap-4">
          {/* Cookie Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                We Value Your Privacy
              </h3>
              <button
                onClick={closePopup}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              We use cookies to enhance your browsing experience, serve personalized content, 
              and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
              You can customize your preferences or learn more in our{' '}
              <Link 
                to="/terms" 
                className="text-primary hover:underline font-medium"
              >
                Cookie Policy
              </Link>
              .
            </p>

            {/* Cookie Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                <span>Essential Cookies (Always Active)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-4 h-4 text-blue-500" />
                <span>Analytics & Performance</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="w-4 h-4 text-purple-500" />
                <span>Marketing & Advertising</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
              >
                Accept All
              </button>
              <button
                onClick={handleReject}
                className="px-6 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors text-sm"
              >
                Reject All
              </button>
              <button
                onClick={handleCustomize}
                className="px-6 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors text-sm"
              >
                Customize
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentPopup;

