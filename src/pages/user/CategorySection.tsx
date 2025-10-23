import React from "react";
import { Link } from "react-router-dom";

// sample categories
const categories = [
  { id: "tshirt", name: "Top Wear", image: "/images/top_wear.png" },
  { id: "onepiece", name: "One Piece", image: "/images/onepiece.jpg" },
  { id: "croptop", name: "Coord Set", image: "/images/coord_set.jpg" },
  { id: "croptop", name: "Crop Tops", image: "/images/corp_top.jpg" },
  { id: "tshirt", name: "Casual Shirts", image: "/images/casual_shirts.png" },
  { id: "all", name: "New Arrivals", image: "/images/happy-byer.jpg" },
];

const CategorySection: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 theme-gradient-light relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-30" style={{backgroundColor: 'var(--primary-light)'}}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-30" style={{backgroundColor: 'var(--primary-medium)'}}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="heading-luxury text-xl sm:text-2xl md:text-3xl mb-2">
            Shop by Category
          </h2>
          <p className="text-elegant text-sm sm:text-base">
            Find your perfect style in our curated collections
          </p>
        </div>

        {/* Categories Scrollable Container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 sm:space-x-6 pb-4 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-3 lg:gap-4 max-w-4xl mx-auto min-w-max sm:min-w-0">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group flex flex-col items-center transition-all duration-300 hover:scale-105 focus:outline-none theme-fade-in flex-shrink-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden theme-shadow group-hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-400">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-t from-black to-transparent"></div>
                </div>
                <span className="mt-2 text-xs sm:text-sm font-medium theme-text-primary text-center leading-tight transition-colors duration-300 px-1 max-w-[80px] text-gray-800">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
};

export default CategorySection;
