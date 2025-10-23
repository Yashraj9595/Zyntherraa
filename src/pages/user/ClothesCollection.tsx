import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const womenWesternWear = [
  {
    id: 1,
    price: "₹1299",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    price: "₹899",
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    price: "₹799",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
  },
];

const ClothesCollection: React.FC = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/collections");
  };

  return (
    <div className="theme-gradient-light py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="heading-luxury text-2xl sm:text-3xl md:text-4xl mb-3">
            Women's Western Collection
          </h2>
          <p className="text-elegant text-sm sm:text-base max-w-2xl mx-auto">
            Discover our handpicked selection of trendy western wear designed for the modern woman
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {womenWesternWear.map((item, index) => (
            <div
              key={item.id}
              className="card-theme theme-hover-lift group cursor-pointer rounded-2xl overflow-hidden theme-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Image Section */}
              <div
                onClick={handleRedirect}
                className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden"
              >
                <img
                  src={item.img}
                  alt="product"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 bg-gradient-to-t from-black to-transparent"></div>

                {/* Wishlist Icon */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full theme-shadow hover:scale-110 transition-all duration-300 hover:bg-white">
                  <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-gray-700 hover:text-black transition-colors" />
                </div>

                {/* Quick Add Button */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button className="btn-theme-light w-full py-2 px-4 rounded-full font-medium transition-all duration-300 shadow-lg text-sm">
                    Quick Add
                  </button>
                </div>
              </div>

              {/* Price Section */}
              <div className="p-4 text-center">
                <p className="text-lg sm:text-xl font-bold theme-text-primary mb-1">{item.price}</p>
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs theme-text-muted ml-1">(4.8)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8 sm:mt-10">
          <button 
            onClick={handleRedirect}
            className="btn-theme-primary inline-flex items-center px-8 py-3 font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Products
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClothesCollection;
