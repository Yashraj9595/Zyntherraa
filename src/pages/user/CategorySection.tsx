import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { categoryApi } from "../../utils/api";

interface Category {
  _id: string;
  name: string;
  image?: string;
}

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll() as { categories: Category[] };
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-wide">
          Shop by Category
        </h2>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.name.toLowerCase().replace(/\s+/g, '')}`}
              className="flex flex-col items-center transition-transform transform hover:scale-105 focus:outline-none"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-gray-300 hover:border-black shadow-md">
                <img
                  src={category.image || '/images/placeholder.jpg'}
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
