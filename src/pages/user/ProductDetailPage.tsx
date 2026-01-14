import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { productApi } from '../../utils/api';

interface ProductVariant {
  _id?: string;
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

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productApi.getById(id) as Product;
        setProduct(response);
        
        // Set first variant as default
        if (response.variants && response.variants.length > 0) {
          setSelectedVariant(response.variants[0]);
          if (response.variants[0].images.length > 0) {
            setSelectedImage(response.variants[0].images[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (variant.images.length > 0) {
      setSelectedImage(variant.images[0]);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (selectedVariant?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', { product, variant: selectedVariant, quantity });
    alert('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const allImages = selectedVariant?.images || [];
  const displayImage = selectedImage || allImages[0] || '/images/placeholder.jpg';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-black">Shop</button>
          <span className="mx-2">/</span>
          <span className="text-black">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm p-6">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={displayImage}
                alt={product.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImage === image ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <span className="ml-2 text-gray-600">(4.5) 128 reviews</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">
                ₹{selectedVariant?.price || 0}
              </span>
              {selectedVariant && selectedVariant.stock > 0 ? (
                <span className="ml-4 text-green-600 font-medium">In Stock ({selectedVariant.stock} available)</span>
              ) : (
                <span className="ml-4 text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="mb-6 space-y-2">
              <div className="flex">
                <span className="font-semibold text-gray-900 w-32">Category:</span>
                <span className="text-gray-600">{product.category}</span>
              </div>
              {product.subcategory && (
                <div className="flex">
                  <span className="font-semibold text-gray-900 w-32">Subcategory:</span>
                  <span className="text-gray-600">{product.subcategory}</span>
                </div>
              )}
              {product.styleNumber && (
                <div className="flex">
                  <span className="font-semibold text-gray-900 w-32">Style Number:</span>
                  <span className="text-gray-600">{product.styleNumber}</span>
                </div>
              )}
              {product.fabric && (
                <div className="flex">
                  <span className="font-semibold text-gray-900 w-32">Fabric:</span>
                  <span className="text-gray-600">{product.fabric}</span>
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Size & Color</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => handleVariantChange(variant)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      selectedVariant === variant
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium">{variant.size}</div>
                    <div className="text-sm">{variant.color}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus size={20} />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (selectedVariant?.stock || 0)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100">
                <Heart size={24} />
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="text-gray-600" size={24} />
                <div>
                  <div className="font-medium">Free Shipping</div>
                  <div className="text-sm text-gray-600">On orders over ₹999</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="text-gray-600" size={24} />
                <div>
                  <div className="font-medium">Easy Returns</div>
                  <div className="text-sm text-gray-600">30-day return policy</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-gray-600" size={24} />
                <div>
                  <div className="font-medium">Secure Payment</div>
                  <div className="text-sm text-gray-600">100% secure transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
