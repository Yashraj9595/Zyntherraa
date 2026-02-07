import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { categoryApi, productApi, homepageApi } from "../../utils/api";
import { getImageUrl } from "../../utils/imageUtils";

interface Category {
  _id: string;
  name: string;
  image?: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

interface CustomCategoryItem {
  _id: string;
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
  categoryId?: string;
}

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Shop by Category");
  const [sectionSubtitle, setSectionSubtitle] = useState("Discover our curated collections");
  const [sectionVisible, setSectionVisible] = useState(true);

  useEffect(() => {
    fetchSectionContent();
    fetchCategories();
  }, []);

  const fetchSectionContent = async () => {
    const sectionTypes = ['category', 'shop-by-category', 'category-section', 'collections'];
    for (const type of sectionTypes) {
      try {
        const response = await homepageApi.getSectionByType(type);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const section = response.data[0];
          const isActive = section?.isActive ?? true;
          setSectionVisible(isActive);

          if (!isActive) {
            setCustomCategories([]);
            return;
          }

          if (section.title) setSectionTitle(section.title);
          if (section.subtitle) setSectionSubtitle(section.subtitle);
          
          const configItems = section.config?.items;
          if (Array.isArray(configItems) && configItems.length > 0) {
            const activeItems = configItems
              .filter((item: any) => item && (item.isActive ?? true))
              .map((item: any) => ({
                _id: item._id || item.id || `${item.title}-${item.order || 0}`,
                title: item.title || item.name || 'Category',
                subtitle: item.subtitle,
                image: item.image,
                link: item.link,
                order: item.order ?? 0,
                isActive: item.isActive ?? true,
                categoryId: item.categoryId
              }))
              .sort((a: CustomCategoryItem, b: CustomCategoryItem) => (a.order ?? 0) - (b.order ?? 0));
            setCustomCategories(activeItems);
          } else {
            setCustomCategories([]);
          }
          return;
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} section content:`, error);
      }
    }
    setSectionVisible(true);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Get active categories from backend
      const categoriesResponse = await categoryApi.getAll();
      
      if (categoriesResponse.error || !categoriesResponse.data) {
        console.error('Failed to fetch categories:', categoriesResponse.error);
        setCategories([]);
        return;
      }

      const backendCategories = Array.isArray(categoriesResponse.data) 
        ? categoriesResponse.data 
        : [];

      // Filter only active categories
      const activeCategories = backendCategories.filter(
        (cat: any) => cat.status === 'Active'
      );

      // Get products to extract category images
      const productsResponse = await productApi.getAll({ status: 'Active' });
      const productsData = productsResponse.data 
        ? ((productsResponse.data as any).products || productsResponse.data)
        : [];
      const products = Array.isArray(productsData) ? productsData : [];

      // Map categories with images from products or category image field
      const categoriesWithImages: Category[] = await Promise.all(
        activeCategories.map(async (cat: any) => {
          let categoryImage = cat.image; // Use category image if available

          // If no category image, get from first product in this category
          if (!categoryImage && products.length > 0) {
            const categoryProduct = products.find(
              (p: any) => p.category && p.category.toLowerCase() === cat.name.toLowerCase()
            );
            
            if (categoryProduct && categoryProduct.variants && categoryProduct.variants.length > 0) {
              const firstVariant = categoryProduct.variants[0];
              if (firstVariant.images && firstVariant.images.length > 0) {
                categoryImage = firstVariant.images[0];
              }
            }
          }

          return {
            _id: cat._id,
            name: cat.name,
            image: categoryImage,
            productCount: cat.productCount || 0,
            status: cat.status
          };
        })
      );

      // Only show categories that have images or products
      const validCategories = categoriesWithImages.filter(
        (cat) => cat.image || cat.productCount > 0
      );

      setCategories(validCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  if (!sectionVisible) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-6 sm:py-8 theme-gradient-light relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  const hasCustomCategories = customCategories.length > 0;

  // Don't show section if no categories
  if (!hasCustomCategories && categories.length === 0) {
    return null;
  }

  const displayCategories = hasCustomCategories ? customCategories : categories;

  return (
    <section className="py-6 sm:py-8 theme-gradient-light relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8 relative z-10">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="heading-luxury text-xl sm:text-2xl md:text-3xl mb-2">
            {sectionTitle}
          </h2>
          <p className="text-elegant text-sm sm:text-base">
            {sectionSubtitle}
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {displayCategories.map((item) => {
            if (hasCustomCategories) {
              const custom = item as CustomCategoryItem;
              const imageSrc = custom.image ? getImageUrl(custom.image) : undefined;
              if (!imageSrc) {
                return null;
              }
              const targetLink = custom.link || '#';
              return (
                <Link 
                  key={custom._id}
                  to={targetLink}
                  className="group block"
                >
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 ring-2 ring-gray-200 group-hover:ring-primary">
                      <img 
                        src={imageSrc} 
                        alt={custom.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.closest('.group');
                          if (parent) {
                            (parent as HTMLElement).style.display = 'none';
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-medium group-hover:text-primary transition-colors duration-300">
                        {custom.title}
                      </h3>
                      {custom.subtitle && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-1">
                          {custom.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            }

            const category = item as Category;
            if (!category.image) {
              return null;
            }

            return (
              <Link 
                key={category._id} 
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group block"
              >
                <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                  {/* Circular Image Container */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 ring-2 ring-gray-200 group-hover:ring-primary">
                    <img 
                      src={getImageUrl(category.image)} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Hide category if image fails to load
                        const target = e.target as HTMLImageElement;
                        const parent = target.closest('.group');
                        if (parent) {
                          (parent as HTMLElement).style.display = 'none';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                  </div>
                  {/* Category Name Below Circle */}
                  <div className="text-center">
                    <h3 className="text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-medium group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    {category.productCount > 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                        {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;