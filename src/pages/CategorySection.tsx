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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-wide">
        </h2>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`} // navigate to category page
              className="flex flex-col items-center transition-transform transform hover:scale-105 focus:outline-none"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gray-300 hover:border-black shadow-md">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-3 text-sm font-semibold text-gray-700">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
