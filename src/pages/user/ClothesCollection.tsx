import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productApi, homepageApi } from "../../utils/api";
import { getImageUrl } from "../../utils/imageUtils";

interface Product {
  _id: string;
  title: string;
  category: string;
  subcategory?: string;
  variants: Array<{
    price: number;
    images: string[];
  }>;
}

interface CustomCollectionConfig {
  _id: string;
  name: string;
  description?: string;
  productIds: string[];
  order?: number;
  isActive?: boolean;
}

interface CustomCollection extends CustomCollectionConfig {
  products: Product[];
}

const ClothesCollection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Western Wear");
  const [products, setProducts] = useState<Product[]>([]);
  const [customCollections, setCustomCollections] = useState<CustomCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Our Collections");
  const [sectionSubtitle, setSectionSubtitle] = useState("Discover the perfect outfit for every occasion");
  const [sectionVisible, setSectionVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch section content with fallback to legacy type
        const sectionTypes = ['collections', 'our-collections'];
        let selectedSection: any = null;
        for (const type of sectionTypes) {
          const sectionResponse = await homepageApi.getSectionByType(type);
          if (sectionResponse.data && Array.isArray(sectionResponse.data) && sectionResponse.data.length > 0) {
            selectedSection = sectionResponse.data[0];
            const isActive = selectedSection?.isActive ?? true;
            setSectionVisible(isActive);
            if (!isActive) {
              setCustomCollections([]);
              setProducts([]);
              return;
            }
            if (selectedSection.title) setSectionTitle(selectedSection.title);
            if (selectedSection.subtitle) setSectionSubtitle(selectedSection.subtitle);
            break;
          }
        }
        if (!selectedSection) {
          setSectionVisible(true);
        }
        
        // Fetch products
        const response = await productApi.getAll({ status: 'Active' });
        let productsList: Product[] = [];
        if (response.data) {
          const productsData = (response.data as any).products || response.data;
          productsList = Array.isArray(productsData) ? productsData : [];
          setProducts(productsList);
        } else {
          setProducts([]);
        }

        if (
          selectedSection &&
          selectedSection.config &&
          Array.isArray(selectedSection.config.collections) &&
          selectedSection.config.collections.length > 0
        ) {
          const customConfigs: CustomCollection[] = selectedSection.config.collections
            .filter((item: CustomCollectionConfig) => item && (item.isActive ?? true))
            .map((item: CustomCollectionConfig) => ({
              _id: item._id || `${item.name}-${item.order || 0}`,
              name: item.name || 'Collection',
              description: item.description || '',
              productIds: Array.isArray(item.productIds) ? item.productIds : [],
              order: item.order ?? 0,
              isActive: item.isActive ?? true,
              products: []
            }));

          const enrichedCollections = customConfigs
            .map((collection) => ({
              ...collection,
              products: collection.productIds
                .map((id) => productsList.find((product) => product._id === id))
                .filter((product): product is Product => Boolean(product))
                .slice(0, 10)
            }))
            .filter((collection) => collection.products.length > 0)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

          setCustomCollections(enrichedCollections);
        } else {
          setCustomCollections([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setCustomCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group products by category
  const categories = React.useMemo(() => {
    const categoryMap = new Map<string, Product[]>();
    
    products.forEach((product) => {
      const category = product.category || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(product);
    });

    // Convert to array format
    const categoryArray = Array.from(categoryMap.entries()).map(([name, products]) => ({
      name,
      products: products.slice(0, 10) // Limit to 10 products per category
    }));

    return categoryArray.length > 0 ? categoryArray : [
      { name: "Western Wear", products: [] },
      { name: "Ethnic Wear", products: [] }
    ];
  }, [products]);

  useEffect(() => {
    if (customCollections.length > 0) {
      setActiveTab((prev) => {
        const exists = customCollections.some((collection) => collection.name === prev);
        return exists ? prev : customCollections[0].name;
      });
    }
  }, [customCollections]);

  useEffect(() => {
    if (customCollections.length === 0 && categories.length > 0) {
      setActiveTab((prev) => {
        const exists = categories.some((category) => category.name === prev);
        return exists ? prev : categories[0].name;
      });
    }
  }, [categories, customCollections.length]);

  const usingCustomCollections = customCollections.length > 0;
  const tabItems = usingCustomCollections ? customCollections : categories;
  const activeProducts = usingCustomCollections
    ? (customCollections.find((collection) => collection.name === activeTab)?.products || [])
    : (categories.find((category) => category.name === activeTab)?.products || []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };
  
  const handleProductClick = (product: Product) => {
    navigate(`/product/${product._id}`);
  };

  if (!sectionVisible) {
    return null;
  }

  if (loading) {
    return (
      <div className="theme-gradient-light py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-gradient-light py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="heading-luxury text-2xl sm:text-3xl font-semibold mb-2">
            {sectionTitle}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Tabs */}
        {tabItems.length > 0 && (
          <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
            <div className="flex space-x-2 sm:space-x-4 min-w-max">
              {tabItems.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-4 sm:px-5 py-2 rounded-full border border-gray-300 text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.name
                      ? "text-black border-black shadow-sm bg-white"
                      : "text-gray-600 hover:text-black hover:border-black bg-white"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Slider Section */}
        <div className="relative">
          {activeProducts.length > 3 && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute -left-2 sm:-left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:shadow-lg p-2 rounded-full z-10 hidden sm:block"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute -right-2 sm:-right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:shadow-lg p-2 rounded-full z-10 hidden sm:block"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* Product Cards */}
          {activeProducts.length > 0 ? (
            <div
              ref={scrollRef}
              className="flex space-x-4 sm:space-x-5 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {activeProducts.map((product) => {
                const firstVariant = product.variants?.[0];
                const productImage = getImageUrl(firstVariant?.images?.[0]) || '/images/placeholder.jpg';
                const productPrice = firstVariant?.price || 0;

                return (
                  <div
                    key={product._id}
                    className="min-w-[180px] sm:min-w-[220px] md:min-w-[250px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex-shrink-0"
                  >
                    <div
                      className="relative w-full h-48 sm:h-60 overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={productImage}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-110 transition duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <button 
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white shadow-md transition z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist functionality
                        }}
                        aria-label="Add to wishlist"
                      >
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 hover:text-red-500" />
                      </button>
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <p className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{product.title}</p>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">₹{productPrice.toLocaleString()}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        className="w-full py-1.5 sm:py-2 bg-black text-white rounded-full text-xs sm:text-sm font-medium hover:bg-gray-800 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm sm:text-base">No products available in this collection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothesCollection;
