import React, { useState, useEffect } from "react";

// Responsive image sets - different images for different screen sizes
const imagesSets = {
  mobile: [
    "/images/Untitled design1100×1564 .png", // Portrait for mobile
    "/images/Untitled design (2).png", // Fallback mobile image
  ],
  desktop: [
    "/images/Untitled design1880×827.png", // Landscape for desktop
    "/images/banner_garment.png", // Additional desktop image
  ]
};

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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

  // Get current image set based on screen size
  const currentImages = isMobile ? imagesSets.mobile : imagesSets.desktop;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
    }, 4000); // Slower transition for better viewing
    return () => clearInterval(interval);
  }, [currentImages.length]);

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
              alt={`Banner ${index + 1} - ${isMobile ? 'Mobile' : 'Desktop'} View`}
              className={`w-full h-full rounded-b-3xl sm:rounded-b-none ${
                isMobile 
                  ? 'object-contain object-center' // Portrait images - contain to show full image
                  : 'object-contain object-center' // Landscape images - contain to show full image
              }`}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-10 rounded-b-3xl sm:rounded-b-none"></div>
          </div>
        ))}

        {/* Dots Indicator - Only show if multiple images */}
        {currentImages.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
            {currentImages.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === current ? "bg-white scale-125" : "bg-white bg-opacity-50"
                }`}
              ></button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSlider;
