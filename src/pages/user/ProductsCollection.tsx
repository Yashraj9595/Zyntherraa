// src/components/ProductsCollection.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../../utils/api';
import { getActiveCategories } from '../../data/categories';
import { getImageUrl } from '../../utils/imageUtils';

interface ProductVariant {
  _id?: string;
  id?: string;
  size: string;
  color: string;
  images: string[];
  videos: string[];
  price: number;
  stock: number;
  styleNumber?: string;
  fabric?: string;
  customSize?: string;
  customColor?: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  variants: ProductVariant[];
  status: 'Active' | 'Inactive';
  styleNumber?: string;
  fabric?: string;
  createdAt?: string;
  updatedAt?: string;
  price?: number; // For backward compatibility
}

interface Category {
  name: string;
}

const ProductsCollection: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ category?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // derive active tab from URL param (fallback to 'all')
  const activeTab = params.category ?? 'all';

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { status: 'Active' };
      
      // Only add category filter if not viewing all products
      if (activeTab !== "all" && activeTab) {
        // Convert URL slug to category name format (e.g., "one-piece" -> "One Piece")
        const categoryName = activeTab
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        params.category = categoryName;
      }
      
      const response = await productApi.getAll(params);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const productsData = (response.data as any).products || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchCategories = useCallback(async () => {
    try {
      const backendCategories = await getActiveCategories();
      // Convert to the format expected by this component
      const formattedCategories = backendCategories.map(cat => ({ name: cat.name }));
      setCategories(formattedCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Fallback to static categories
      setCategories([
        { name: "All" },
        { name: "One Piece" },
        { name: "Crop Top" },
        { name: "T-Shirt" }
      ]);
    }
  }, []);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Helper function to convert category name to URL slug
  const categoryToSlug = (categoryName: string): string => {
    return categoryName.toLowerCase().replace(/\s+/g, '-');
  };

  // navigate to category route (URL change only)
  const handleCategoryClick = (category: string) => {
    if (category === 'all' || category.toLowerCase() === 'all') {
      navigate('/collections');
    } else {
      const slug = categoryToSlug(category);
      navigate(`/category/${slug}`);
    }
  };

  // filter products based on activeTab (memoized)
  // Note: Backend already filters by category, but we keep this for client-side filtering if needed
  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') {
      return products;
    }
    // Convert URL slug to category name for comparison
    const categoryName = activeTab
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return products.filter((p) => {
      const productCategory = p.category.toLowerCase();
      const productSubcategory = p.subcategory?.toLowerCase() || '';
      const searchCategory = categoryName.toLowerCase();
      const searchSlug = activeTab.toLowerCase();
      
      return productCategory === searchCategory || 
             productSubcategory === searchCategory ||
             productCategory.replace(/\s+/g, '-') === searchSlug ||
             productSubcategory.replace(/\s+/g, '-') === searchSlug;
    });
  }, [activeTab, products]);

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page
    navigate(`/product/${product._id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
        {/* Sidebar with Categories - Mobile: Collapsible, Desktop: Always visible */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Categories</h2>
            <ul className="space-y-1 sm:space-y-2 max-h-[60vh] md:max-h-none overflow-y-auto">
              <li>
                <button
                  onClick={() => handleCategoryClick('all')}
                  className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    activeTab === 'all'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((category) => {
                const categorySlug = categoryToSlug(category.name);
                return (
                  <li key={category.name}>
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                        activeTab === categorySlug
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {activeTab === 'all' 
                ? 'All Products' 
                : activeTab
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg">No products found in this category.</p>
              <button
                onClick={() => handleCategoryClick('all')}
                className="mt-4 px-4 sm:px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const firstVariant = product.variants[0];
                const productImage = getImageUrl(firstVariant?.images?.[0]) || '/images/placeholder.jpg';
                const productPrice = firstVariant?.price || product.price || 0;

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                      <img
                        src={productImage}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                        {product.category}
                        {product.subcategory && ` / ${product.subcategory}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg sm:text-xl font-bold text-primary">
                          ₹{productPrice.toLocaleString()}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                          className="px-3 sm:px-4 py-1 sm:py-1.5 bg-primary text-white text-xs sm:text-sm rounded hover:bg-primary-dark transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsCollection;