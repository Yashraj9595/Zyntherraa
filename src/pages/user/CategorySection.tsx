import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getActiveCategories } from "../../data/categories";

interface Category {
  id: number;
  name: string;
  image: string;
}

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Get active categories from backend
      const backendCategories = await getActiveCategories();
      
      // Map to the format used in this component
      const mappedCategories: Category[] = backendCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        // Use a default image path or implement a more sophisticated image handling
        image: `/images/category_${index + 1}.jpg`
      }));
      
      // Add the special "New Arrivals" category
      const allCategories: Category[] = [
        ...mappedCategories,
        { id: 999, name: "New Arrivals", image: "/images/happy-byer.jpg" }
      ];
      
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to static categories if API fails
      setCategories([
        { id: 1, name: "Top Wear", image: "/images/top_wear.png" },
        { id: 2, name: "One Piece", image: "/images/onepiece.jpg" },
        { id: 3, name: "Coord Set", image: "/images/coord_set.jpg" },
        { id: 4, name: "Crop Tops", image: "/images/corp_top.jpg" },
        { id: 5, name: "Casual Shirts", image: "/images/casual_shirts.png" },
        { id: 6, name: "New Arrivals", image: "/images/happy-byer.jpg" }
      ]);
    }
  };

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
            Discover our curated collections
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={category.name === "New Arrivals" ? "/new-arrivals" : `/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group block"
            >
              <div className="aspect-square overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 relative">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback image if the image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white text-xs sm:text-sm font-medium drop-shadow-lg">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;