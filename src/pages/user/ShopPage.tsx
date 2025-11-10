import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../utils/api';
import { getActiveCategories } from '../../data/categories';

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
  price?: number;
}

interface Category {
  name: string;
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';
type AvailabilityFilter = 'any' | 'in-stock' | 'out-of-stock';

interface FilterOption {
  value: string;
  label: string;
}

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('any');

  const toSlug = (value: string) =>
    value ? value.trim().toLowerCase().replace(/\s+/g, '-') : '';

  // Fetch all products
  const fetchProducts = useCallback(async (search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { status: 'Active' };
      
      // Add search if provided
      if (search.trim()) {
        params.search = search.trim();
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
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const backendCategories = await getActiveCategories();
      const formattedCategories = backendCategories.map(cat => ({ name: cat.name }));
      setCategories(formattedCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    // Initial product load
    fetchProducts('');
  }, [fetchCategories, fetchProducts]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchProducts]);

  // Get price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    
    const prices = products.flatMap(p => 
      p.variants.length > 0 
        ? p.variants.map(v => v.price)
        : [p.price || 0]
    );
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [products]);

  // Update max price when products load
  useEffect(() => {
    if (priceRange.max > 0 && maxPrice === 100000) {
      setMaxPrice(priceRange.max);
    }
  }, [priceRange, maxPrice]);

  const { subcategoryOptions, sizeOptions, colorOptions } = useMemo(() => {
    const shouldIncludeProduct = (product: Product) => {
      if (selectedCategory === 'all') return true;
      const categorySlug = toSlug(product.category);
      const subcategorySlug = product.subcategory ? toSlug(product.subcategory) : '';
      return selectedCategory === categorySlug || selectedCategory === subcategorySlug;
    };

    const subcategoryMap = new Map<string, string>();
    const sizeMap = new Map<string, string>();
    const colorMap = new Map<string, string>();

    products.forEach((product) => {
      if (!shouldIncludeProduct(product)) {
        return;
      }

      if (product.subcategory) {
        const slug = toSlug(product.subcategory);
        if (slug && !subcategoryMap.has(slug)) {
          subcategoryMap.set(slug, product.subcategory);
        }
      }

      product.variants.forEach((variant) => {
        if (variant.size) {
          const slug = toSlug(variant.size);
          if (slug && !sizeMap.has(slug)) {
            sizeMap.set(slug, variant.size);
          }
        }

        if (variant.color) {
          const slug = toSlug(variant.color);
          if (slug && !colorMap.has(slug)) {
            colorMap.set(slug, variant.color);
          }
        }
      });
    });

    const toOptions = (map: Map<string, string>): FilterOption[] =>
      Array.from(map.entries())
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

    return {
      subcategoryOptions: toOptions(subcategoryMap),
      sizeOptions: toOptions(sizeMap),
      colorOptions: toOptions(colorMap),
    };
  }, [products, selectedCategory]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => {
        const categorySlug = toSlug(p.category);
        const subcategorySlug = p.subcategory ? toSlug(p.subcategory) : '';
        return selectedCategory === categorySlug || selectedCategory === subcategorySlug;
      });
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const productPrice = p.variants.length > 0 
        ? Math.min(...p.variants.map(v => v.price))
        : (p.price || 0);
      return productPrice >= minPrice && productPrice <= maxPrice;
    });

    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((p) => {
        const subcategorySlug = p.subcategory ? toSlug(p.subcategory) : '';
        return subcategorySlug && selectedSubcategories.includes(subcategorySlug);
      });
    }

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.variants.some(
          (variant) =>
            variant.size && selectedSizes.includes(toSlug(variant.size))
        )
      );
    }

    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.variants.some(
          (variant) =>
            variant.color && selectedColors.includes(toSlug(variant.color))
        )
      );
    }

    if (availabilityFilter !== 'any') {
      filtered = filtered.filter((p) => {
        const hasStock = p.variants.some((variant) => (variant.stock ?? 0) > 0);
        return availabilityFilter === 'in-stock' ? hasStock : !hasStock;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      const priceA = a.variants.length > 0 
        ? Math.min(...a.variants.map(v => v.price))
        : (a.price || 0);
      const priceB = b.variants.length > 0 
        ? Math.min(...b.variants.map(v => v.price))
        : (b.price || 0);

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'oldest':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        case 'newest':
        default:
          const dateANew = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateBNew = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateBNew - dateANew;
      }
    });

    return filtered;
  }, [
    products,
    selectedCategory,
    minPrice,
    maxPrice,
    sortBy,
    selectedSubcategories,
    selectedSizes,
    selectedColors,
    availabilityFilter
  ]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product._id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubcategories([]);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setAvailabilityFilter('any');
    setSearchTerm('');
    setMinPrice(0);
    setMaxPrice(priceRange.max || 100000);
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Shop All Products</h1>
        <p className="text-gray-600">
          Discover our complete collection of {products.length} products
        </p>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg flex items-center justify-between"
        >
          <span>Filters & Sort</span>
          <span>{showFilters ? '−' : '+'}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-6">
            {/* Search */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Search</h3>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Categories</h3>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                <li>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((category) => {
                  const slug = toSlug(category.name);
                  return (
                    <li key={category.name}>
                      <button
                        onClick={() => handleCategoryChange(slug)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === slug
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

            {/* Subcategories */}
            {subcategoryOptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Subcategories</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subcategoryOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={selectedSubcategories.includes(option.value)}
                        onChange={() =>
                          setSelectedSubcategories((prev) =>
                            prev.includes(option.value)
                              ? prev.filter((value) => value !== option.value)
                              : [...prev, option.value]
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizeOptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Sizes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sizeOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={selectedSizes.includes(option.value)}
                        onChange={() =>
                          setSelectedSizes((prev) =>
                            prev.includes(option.value)
                              ? prev.filter((value) => value !== option.value)
                              : [...prev, option.value]
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colorOptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Colors</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {colorOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={selectedColors.includes(option.value)}
                        onChange={() =>
                          setSelectedColors((prev) =>
                            prev.includes(option.value)
                              ? prev.filter((value) => value !== option.value)
                              : [...prev, option.value]
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Availability</h3>
              <div className="space-y-2">
                {[
                  { label: 'All Products', value: 'any' as AvailabilityFilter },
                  { label: 'In Stock', value: 'in-stock' as AvailabilityFilter },
                  { label: 'Out of Stock', value: 'out-of-stock' as AvailabilityFilter },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      checked={availabilityFilter === option.value}
                      onChange={() => setAvailabilityFilter(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Price Range</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || priceRange.max)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    max={priceRange.max}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Range: ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          {/* Sort and Results Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredAndSortedProducts.length}</span> of{' '}
                <span className="font-semibold">{products.length}</span> products
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-gray-700 font-medium">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No products found matching your filters.</p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => {
                const productPrice = product.variants.length > 0
                  ? Math.min(...product.variants.map(v => v.price))
                  : (product.price || 0);
                const productImage = product.variants[0]?.images?.[0] || '/images/placeholder.jpg';

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={productImage}
                        alt={product.title}
                        className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                      {product.variants.length > 0 && (
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-800">
                          {product.variants.length} {product.variants.length === 1 ? 'variant' : 'variants'}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {product.category}
                        {product.subcategory && ` • ${product.subcategory}`}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xl font-bold text-primary">
                          ₹{productPrice.toLocaleString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          View Details
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

export default ShopPage;
