import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { productApi } from "../../utils/api";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useAuth } from "../../contexts/AuthContext";
import { getImageUrl } from "../../utils/imageUtils";

interface ProductVariant {
  size: string;
  color: string;
  images: string[];
  videos: string[];
  price: number;
  stock: number;
  styleNumber?: string;
  fabric?: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  variants: ProductVariant[];
  status: string;
  styleNumber?: string;
  fabric?: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getById(id);
        
        if (response.data) {
          const productData = response.data as Product;
          setProduct(productData);
          
          // Debug: Log product data to see image structure
          console.log('Product data loaded:', {
            title: productData.title,
            _id: productData._id,
            variants: productData.variants?.map(v => ({
              size: v.size,
              color: v.color,
              images: v.images,
              imagesCount: v.images?.length || 0,
              imagePaths: v.images
            }))
          });
          
          // Set default variant (first available)
          if (productData.variants && Array.isArray(productData.variants) && productData.variants.length > 0) {
            const firstVariant = productData.variants[0];
            setSelectedVariant(firstVariant);
            setSelectedSize(firstVariant.size);
            setSelectedColor(firstVariant.color);
          }
        } else {
          setError(response.error || "Product not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Update selected variant when size or color changes
  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const variant = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      );
      if (variant) {
        setSelectedVariant(variant);
        setSelectedImage(0); // Reset to first image
      } else {
        // If the combination doesn't exist, try to find a variant with the selected size or color
        // First try: same size, any color
        let fallbackVariant = product.variants.find(v => v.size === selectedSize);
        if (!fallbackVariant) {
          // Second try: same color, any size
          fallbackVariant = product.variants.find(v => v.color === selectedColor);
        }
        if (fallbackVariant) {
          setSelectedVariant(fallbackVariant);
          setSelectedSize(fallbackVariant.size);
          setSelectedColor(fallbackVariant.color);
          setSelectedImage(0);
        } else if (product.variants.length > 0) {
          // Last resort: use first available variant
          const firstVariant = product.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedSize(firstVariant.size);
          setSelectedColor(firstVariant.color);
          setSelectedImage(0);
        }
      }
    }
  }, [selectedSize, selectedColor, product]);

  // Get available sizes and colors based on current selection
  const availableSizes = React.useMemo(() => {
    if (!product) return [];
    
    let sizes: string[] = [];
    
    // If a color is selected, show all sizes that have that color (even if out of stock)
    if (selectedColor) {
      sizes = Array.from(new Set(
        product.variants
          .filter(v => v.color === selectedColor)
          .map(v => v.size)
      ));
      console.log('Available sizes for color', selectedColor, ':', sizes);
    } else {
      // Otherwise, show all sizes from all variants
      sizes = Array.from(new Set(product.variants.map((v) => v.size)));
      console.log('All available sizes:', sizes);
    }
    
    return sizes;
  }, [product, selectedColor]);
  
  const availableColors = React.useMemo(() => {
    if (!product) return [];
    
    let colors: string[] = [];
    
    // If a size is selected, show all colors that have that size (even if out of stock)
    if (selectedSize) {
      colors = Array.from(new Set(
        product.variants
          .filter(v => v.size === selectedSize)
          .map(v => v.color)
      ));
      console.log('Available colors for size', selectedSize, ':', colors);
    } else {
      // Otherwise, show all colors from all variants
      colors = Array.from(new Set(product.variants.map((v) => v.color)));
      console.log('All available colors:', colors);
    }
    
    return colors;
  }, [product, selectedSize]);

  // Get images from selected variant or all variants
  const productImages = React.useMemo(() => {
    if (!product) return [];
    
    let images: string[] = [];
    
    // Try selected variant first
    if (selectedVariant?.images && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
      images = selectedVariant.images
        .filter(img => img && typeof img === 'string' && img.trim() !== '')
        .map(img => getImageUrl(img))
        .filter(url => url && url !== '/images/placeholder.jpg');
      
      if (images.length > 0) {
        console.log('Using selected variant images:', images);
        return images;
      }
    }
    
    // Fallback to all variants
    if (product?.variants && Array.isArray(product.variants)) {
      const allImages = product.variants
        .flatMap((v) => (v.images || []))
        .filter(img => img && typeof img === 'string' && img.trim() !== '')
        .map(img => getImageUrl(img))
        .filter(url => url && url !== '/images/placeholder.jpg');
      
      if (allImages.length > 0) {
        console.log('Using all variant images:', allImages);
        return allImages;
      }
    }
    
    console.warn('No images found for product:', product?.title, {
      selectedVariant: selectedVariant?.images,
      allVariants: product?.variants?.map(v => ({ size: v.size, color: v.color, images: v.images, imagesCount: v.images?.length || 0 }))
    });
    return [];
  }, [selectedVariant, product]);

  // Get related products (same category)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;

      try {
        const response = await productApi.getAll({
          category: product.category,
          status: "Active",
        });

        if (response.data) {
          const productsData = (response.data as any)?.products || (Array.isArray(response.data) ? response.data : []);
          // Filter out current product and limit to 4
          const related = Array.isArray(productsData) ? productsData
            .filter((p: Product) => p._id !== product._id)
            .slice(0, 4)
            .map((p: Product) => {
              const firstVariant = p.variants?.[0];
              const firstImage = firstVariant?.images?.[0] || "/images/placeholder.jpg";
              return {
                id: p._id,
                name: p.title,
                image: getImageUrl(firstImage),
                price: firstVariant?.price || 0,
              };
            }) : [];
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      alert("Please select size and color");
      return;
    }

    if (selectedVariant.stock <= 0) {
      alert("This variant is out of stock");
      return;
    }

    // Get image from selected variant, or fallback to first variant, or placeholder
    let imagePath = "/images/placeholder.jpg";
    if (selectedVariant.images && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
      imagePath = selectedVariant.images[0];
    } else if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      if (firstVariant.images && Array.isArray(firstVariant.images) && firstVariant.images.length > 0) {
        imagePath = firstVariant.images[0];
      }
    }

    addToCart({
      productId: product._id,
      productTitle: product.title,
      variantId: `${selectedSize}-${selectedColor}`,
      size: selectedSize,
      color: selectedColor,
      price: selectedVariant.price,
      image: imagePath, // Store the raw path, getImageUrl will process it in CartPage
    });

    alert(`${product.title} added to cart!`);
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    if (!user) {
      alert("Please login to add items to wishlist");
      navigate("/auth/login");
      return;
    }

    const variant = selectedSize || selectedColor ? {
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    } : undefined;

    const isInWishlistCheck = isInWishlist(product._id, variant);

    try {
      if (isInWishlistCheck) {
        // Find the item ID to remove
        // For now, we'll just show a message - in a real scenario, we'd need the item ID
        setWishlistMessage("Item is already in wishlist");
        setTimeout(() => setWishlistMessage(null), 3000);
      } else {
        await addToWishlist(product._id, variant);
        setWishlistMessage("Added to wishlist!");
        setTimeout(() => setWishlistMessage(null), 3000);
      }
    } catch (error: any) {
      setWishlistMessage(error.message || "Failed to add to wishlist");
      setTimeout(() => setWishlistMessage(null), 3000);
    }
  };

  const isItemInWishlist = product ? isInWishlist(product._id, {
    size: selectedSize || undefined,
    color: selectedColor || undefined,
  }) : false;

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
  return (
    <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const isInStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const currentPrice = selectedVariant?.price || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
        <button onClick={() => navigate("/")} className="hover:text-gray-900">
          Home
        </button>
        {" / "}
        <button onClick={() => navigate("/shop")} className="hover:text-gray-900">
          Shop
        </button>
        {product.category && (
          <>
            {" / "}
            <button
              onClick={() => navigate(`/category/${product.category.toLowerCase().replace(/\s+/g, "-")}`)}
              className="hover:text-gray-900"
            >
              {product.category}
            </button>
          </>
        )}
        {" / "}
        <span className="text-gray-900">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
        {/* Left: Product Images */}
        <div>
          {productImages.length > 0 ? (
            <>
              <div className="border rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50">
                <img
                  key={`main-${selectedImage}-${productImages[selectedImage]}`}
                  src={productImages[selectedImage]}
                  alt={product.title}
                  className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Image failed to load:', productImages[selectedImage]);
                    target.src = '/images/placeholder.jpg';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', productImages[selectedImage]);
                  }}
            />
          </div>

          {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 justify-center overflow-x-auto pb-2">
                  {productImages.map((img, idx) => (
              <img
                      key={`thumb-${idx}-${img}`}
                src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl border-2 cursor-pointer flex-shrink-0 object-cover ${
                  selectedImage === idx
                    ? "border-gray-900"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                onClick={() => setSelectedImage(idx)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Thumbnail failed to load:', img);
                        target.src = '/images/placeholder.jpg';
                      }}
              />
            ))}
          </div>
              )}
            </>
          ) : (
            <div className="border rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center h-[300px] sm:h-[400px] md:h-[500px]">
              <div className="text-center p-4">
                <p className="text-gray-400 text-sm sm:text-base mb-2">No images available</p>
                <p className="text-gray-500 text-xs">Please add images to this product in the admin panel</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.title}</h1>
          {product.styleNumber && (
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Style: {product.styleNumber}</p>
          )}
          {product.fabric && (
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Fabric: {product.fabric}</p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-2xl sm:text-3xl font-semibold text-gray-900">
              ₹{currentPrice.toLocaleString()}
            </span>
          </div>

          <p
            className={`mt-2 text-xs sm:text-sm font-medium ${
              isInStock ? "text-green-600" : "text-red-500"
            }`}
          >
            {isInStock
              ? `In Stock (${selectedVariant?.stock} available)`
              : "Out of Stock"}
          </p>

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div className="mt-4 sm:mt-5">
              <h3 className="text-gray-700 font-medium mb-2 text-sm sm:text-base">Select Size</h3>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {availableSizes.map((size) => {
                  // Find variant for this size and selected color (if color is selected)
                  const variant = selectedColor
                    ? product.variants.find(v => v.size === size && v.color === selectedColor)
                    : product.variants.find(v => v.size === size);
                  
                  const isAvailable = variant && variant.stock > 0;
                  const isSelected = selectedSize === size;
                  const exists = !!variant;

                  return (
                <button
                  key={size}
                      disabled={!exists}
                      className={`w-10 h-10 sm:w-12 sm:h-12 border rounded-full font-semibold text-sm sm:text-base transition-all ${
                        isSelected
                      ? "border-black bg-gray-100"
                          : isAvailable
                          ? "border-gray-300 hover:border-black cursor-pointer"
                          : exists
                          ? "border-gray-300 hover:border-gray-400 cursor-pointer opacity-60"
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (exists) {
                          setSelectedSize(size);
                          // If color is not selected, auto-select the first available color for this size
                          if (!selectedColor) {
                            const firstColorForSize = product.variants.find(v => v.size === size)?.color;
                            if (firstColorForSize) {
                              setSelectedColor(firstColorForSize);
                            }
                          }
                        }
                      }}
                      title={isAvailable ? `${size} - In Stock (${variant.stock} available)` : exists ? `${size} - Out of Stock` : 'Not Available'}
                >
                  {size}
                </button>
                  );
                })}
            </div>
          </div>
          )}

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="mt-4 sm:mt-5">
              <h3 className="text-gray-700 font-medium mb-2 text-sm sm:text-base">Select Color</h3>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {availableColors.map((color) => {
                  // Find variant for this color and selected size (if size is selected)
                  const variant = selectedSize
                    ? product.variants.find(v => v.color === color && v.size === selectedSize)
                    : product.variants.find(v => v.color === color);
                  
                  const isAvailable = variant && variant.stock > 0;
                  const isSelected = selectedColor === color;
                  const exists = !!variant;

                  return (
                    <button
                      key={color}
                      disabled={!exists}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg font-medium text-sm sm:text-base transition-all ${
                        isSelected
                          ? "border-black bg-gray-100"
                          : isAvailable
                          ? "border-gray-300 hover:border-black cursor-pointer"
                          : exists
                          ? "border-gray-300 hover:border-gray-400 cursor-pointer opacity-60"
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (exists) {
                          setSelectedColor(color);
                          // If size is not selected, auto-select the first available size for this color
                          if (!selectedSize) {
                            const firstSizeForColor = product.variants.find(v => v.color === color)?.size;
                            if (firstSizeForColor) {
                              setSelectedSize(firstSizeForColor);
                            }
                          }
                        }
                      }}
                      title={isAvailable ? `${color} - In Stock (${variant.stock} available)` : exists ? `${color} - Out of Stock` : 'Not Available'}
                    >
                      {color}
                    </button>
                  );
                })}
            </div>
          </div>
          )}

          {/* Add to Cart and Wishlist */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || !selectedVariant}
              className="bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Add to Cart
            </button>

            <button
              onClick={handleAddToWishlist}
              className={`border px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition ${
                isItemInWishlist
                  ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              <Heart 
                size={16} 
                className={`sm:w-[18px] sm:h-[18px] ${isItemInWishlist ? 'fill-red-600' : ''}`} 
              /> 
              {isItemInWishlist ? 'In Wishlist' : 'Wishlist'}
            </button>
          </div>

          {/* Wishlist Message */}
          {wishlistMessage && (
            <div className={`mt-2 p-2 rounded-lg text-sm ${
              wishlistMessage.includes('Added') 
                ? 'bg-green-50 text-green-800' 
                : 'bg-yellow-50 text-yellow-800'
            }`}>
              {wishlistMessage}
            </div>
          )}

          {/* Delivery & Return Info */}
          <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
            <p>Estimated delivery in 5-7 business days.</p>
            <p>30-day easy return policy.</p>
          </div>

          {/* Product Description */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Product Description
            </h3>
            <p className="text-gray-600 mt-2 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Care Instructions */}
          {product.fabric && (
            <div className="mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Fabric & Care
            </h3>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Fabric: {product.fabric}
              </p>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Machine wash cold with like colors. Tumble dry low.
              </p>
          </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-8 sm:mt-12 md:mt-16">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="relative border rounded-2xl overflow-hidden group hover:shadow-md transition"
              >
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-60 object-cover cursor-pointer"
                  onClick={() => handleProductClick(item.id)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />

                {/* Add to Cart Button (on hover navigates to product page) */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleProductClick(item.id)}
                    className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-200"
                  >
                    View Details
                  </button>
                </div>

                <div
                  className="p-3 sm:p-4 cursor-pointer"
                  onClick={() => handleProductClick(item.id)}
                >
                  <p className="text-gray-800 font-medium text-sm sm:text-base line-clamp-2">{item.name}</p>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">₹{item.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
