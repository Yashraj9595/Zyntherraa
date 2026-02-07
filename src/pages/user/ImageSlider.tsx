import React, { useState, useEffect } from "react";
import { homepageApi } from "../../utils/api";
import { getImageUrl } from "../../utils/imageUtils";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
}

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const wasMobile = isMobile;
      const nowMobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(nowMobile);
      
      // Reset current index if screen size category changed
      if (wasMobile !== nowMobile) {
        setCurrent(0);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMobile]);

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await homepageApi.getBanners(true); // Only get active banners
        
        if (response.data && Array.isArray(response.data)) {
          // Sort by order
          const sortedBanners = [...response.data].sort((a: Banner, b: Banner) => a.order - b.order);
          setBanners(sortedBanners);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        // Fallback to default images if API fails
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Get current images and banner data based on screen size and available banners
  const getCurrentImages = () => {
    // Only use banners from backend - no static fallbacks
    if (banners.length === 0) {
      return {
        images: [],
        bannerData: []
      };
    }

    // Use banners from backend
    const images = banners.map((banner) => {
      // Use mobile image if available and on mobile, otherwise use desktop image
      if (isMobile && banner.mobileImage) {
        return getImageUrl(banner.mobileImage);
      }
      return getImageUrl(banner.image);
    });

    return {
      images,
      bannerData: banners // Keep reference to banner data
    };
  };

  const { images: currentImages, bannerData } = getCurrentImages();

  // Auto-rotate through images
  useEffect(() => {
    if (currentImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
    }, 4000); // Slower transition for better viewing
    
    return () => clearInterval(interval);
  }, [currentImages.length]);

  // Don't show anything if loading and no banners
  if (loading && banners.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[75vh] lg:h-[70vh] xl:h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Don't show slider if no images
  if (currentImages.length === 0) {
    return null;
  }

  // Get current banner data - use bannerData array which matches currentImages
  const currentBanner = bannerData[current] || null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Image wrapper - Responsive height based on screen size and image aspect ratio */}
      <div className={`relative w-full ${
        isMobile 
          ? 'h-[60vh] sm:h-[70vh] md:h-[75vh]' // Taller for portrait mobile images
          : 'h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh]' // Standard landscape heights
      }`}>
        {currentImages.map((img: string, index: number) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={img}
              alt={currentBanner?.title || `Banner ${index + 1} - ${isMobile ? 'Mobile' : 'Desktop'} View`}
              className={`w-full h-full rounded-b-3xl sm:rounded-b-none ${
                isMobile 
                  ? 'object-contain object-center' // Portrait images - contain to show full image
                  : 'object-contain object-center' // Landscape images - contain to show full image
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-10 rounded-b-3xl sm:rounded-b-none"></div>
            
            {/* Banner content overlay (if banner has text) */}
            {currentBanner && index === current && (currentBanner.title || currentBanner.subtitle || currentBanner.buttonText) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
                {currentBanner.title && (
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
                    {currentBanner.title}
                  </h2>
                )}
                {currentBanner.subtitle && (
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 sm:mb-6 drop-shadow-md max-w-2xl">
                    {currentBanner.subtitle}
                  </p>
                )}
                {currentBanner.buttonText && currentBanner.buttonLink && (
                  <a
                    href={currentBanner.buttonLink}
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base shadow-lg"
                  >
                    {currentBanner.buttonText}
                  </a>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Dots Indicator - Only show if multiple images */}
        {currentImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
            {currentImages.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === current ? "bg-white scale-125" : "bg-white bg-opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSlider;
