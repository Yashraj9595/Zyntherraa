// src/components/ProductsCollection.tsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Product {
  id: number;
  category: string;
  price: string;
  img: string;
}

const products: Product[] = [
  { id: 1, category: "onepiece", price: "₹1299", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" },
  { id: 2, category: "tshirt",   price: "₹899",  img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80" },
  { id: 3, category: "croptop",  price: "₹799",  img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80" },
  { id: 4, category: "onepiece", price: "₹1599", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80" },
];

const categories = [
  { label: "All", value: "all" },
  { label: "One Piece", value: "onepiece" },
  { label: "Crop Top", value: "croptop" },
  { label: "T-Shirt", value: "tshirt" },
];

const ProductsCollection: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ category?: string }>();
  // derive active tab from URL param (fallback to 'all')
  const activeTab = params.category ?? "all";

  // navigate to category route (URL change only)
  const handleCategoryClick = (category: string) => {
    if (category === "all") {
      // use replace: false so user can go back in history; set to true if you prefer replacing
      navigate("/collections");
    } else {
      navigate(`/category/${category}`);
    }
  };

  // filter products based on activeTab (memoized)
  const filteredProducts = useMemo(() => {
    return activeTab === "all"
      ? products
      : products.filter((p) => p.category === activeTab);
  }, [activeTab]);

  const handleProductClick = (category: string) => {
    // Example: keep user on same page but update url to category (optional)
    navigate(`/category/${category}`);
  };

  const handleAddToCart = (product: Product) => {
    // Replace with your cart logic (context/redux/api)
    console.log("Add to cart:", product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-6">Our Collections</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {categories.map((cat) => {
          const isActive = activeTab === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`px-4 py-2 rounded-full border transition ${
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-black hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group relative cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 bg-white"
          >
            <div
              className="relative w-full h-64 overflow-hidden"
              onClick={() => handleProductClick(product.category)}
            >
              <img
                src={product.img}
                alt={product.category}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Add to Cart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300"
              >
                Add to Cart
              </button>
            </div>

            {/* Price only */}
            <div className="py-3 text-center">
              <p className="text-lg font-semibold">{product.price}</p>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            No products found in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsCollection;
