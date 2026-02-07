import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { homepageApi } from "../../utils/api";
import { getImageUrl } from "../../utils/imageUtils";
import { Heart } from "lucide-react";

interface FeaturedProduct {
  _id: string;
  productId: {
    _id: string;
    title: string;
    variants: Array<{
      images: string[];
      price: number;
    }>;
  };
  order: number;
  isActive: boolean;
}

const FeaturedProducts: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Featured Products");
  const [sectionSubtitle, setSectionSubtitle] = useState("Handpicked selections just for you");
  const [sectionVisible, setSectionVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch section title/subtitle with fallback section types
        const sectionTypes = ['featured-products', 'best-sellers', 'featured'];
        let sectionIsActive = true;
        for (const type of sectionTypes) {
          const sectionResponse = await homepageApi.getSectionByType(type);
          if (sectionResponse.data && Array.isArray(sectionResponse.data) && sectionResponse.data.length > 0) {
            const section = sectionResponse.data[0];
            sectionIsActive = section?.isActive ?? true;
            setSectionVisible(sectionIsActive);
            if (!sectionIsActive) {
              setFeaturedProducts([]);
              return;
            }
            if (section.title) setSectionTitle(section.title);
            if (section.subtitle) setSectionSubtitle(section.subtitle);
            break;
          }
        }
        if (sectionIsActive) {
        
        // Fetch featured products
        const response = await homepageApi.getFeatured(true); // Only get active featured products
        
          if (response.data && Array.isArray(response.data)) {
            // Sort by order
            const sorted = [...response.data].sort((a: FeaturedProduct, b: FeaturedProduct) => a.order - b.order);
            setFeaturedProducts(sorted);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
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

  // Don't show section if no featured products
  if (featuredProducts.length === 0) {
    return null;
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

        {/* Featured Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
          {featuredProducts.map((item) => {
            const product = item.productId;
            const firstVariant = product?.variants?.[0];
            const productImage = getImageUrl(firstVariant?.images?.[0]) || '/images/placeholder.jpg';
            const productPrice = firstVariant?.price || 0;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  className="relative w-full h-48 sm:h-60 overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  <img
                    src={productImage}
                    alt={product?.title || 'Product'}
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
                  <p className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{product?.title || 'Unknown Product'}</p>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">₹{productPrice.toLocaleString()}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product._id);
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
      </div>
    </div>
  );
};

export default FeaturedProducts;

