// src/components/ProductsCollection.tsx
import React, { useMemo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productApi, categoryApi } from "../../utils/api";

interface ProductVariant {
  size: string;
  color: string;
  images: string[];
  price: number;
  stock: number;
}

interface Product {
  _id: string;
  title: string;
  category: string;
  variants: ProductVariant[];
  status: string;
}

interface Category {
  _id: string;
  name: string;
}

const ProductsCollection: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // derive active tab from URL param (fallback to 'all')
  const activeTab = params.category ?? "all";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const catResponse = await categoryApi.getAll() as { categories: Category[] };
        setCategories(catResponse.categories || []);
        
        // Fetch products
        const prodParams: any = { status: 'Active' };
        if (activeTab !== 'all') {
          prodParams.category = activeTab;
        }
        const prodResponse = await productApi.getAll(prodParams) as { products: Product[] };
        setProducts(prodResponse.products || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // navigate to category route (URL change only)
  const handleCategoryClick = (category: string) => {
    if (category === "all") {
      navigate("/collections");
    } else {
      navigate(`/category/${category}`);
    }
  };

  // filter products based on activeTab (memoized)
  const filteredProducts = useMemo(() => {
    return activeTab === "all"
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeTab.toLowerCase());
  }, [activeTab, products]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product: Product) => {
    // Replace with your cart logic (context/redux/api)
    console.log("Add to cart:", product);
  };

  const categoryTabs = [
    { label: "All", value: "all" },
    ...categories.map(cat => ({
      label: cat.name,
      value: cat.name.toLowerCase().replace(/\s+/g, '')
    }))
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-6">Our Collections</h2>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {categoryTabs.map((cat) => {
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
        {filteredProducts.map((product) => {
          const firstVariant = product.variants[0];
          const image = firstVariant?.images[0] || '/images/placeholder.jpg';
          const price = firstVariant?.price || 0;
          
          return (
            <div
              key={product._id}
              className="group relative cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 bg-white"
            >
              <div
                className="relative w-full h-64 overflow-hidden"
                onClick={() => handleProductClick(product._id)}
              >
                <img
                  src={image}
                  alt={product.title}
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

              {/* Product Info */}
              <div className="py-3 px-3">
                <h3 className="text-sm font-medium text-gray-800 truncate">{product.title}</h3>
                <p className="text-lg font-semibold text-center mt-1">₹{price}</p>
              </div>
            </div>
          );
        })}

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
