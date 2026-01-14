import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { productApi } from "../../utils/api";

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

const ClothesCollection: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productApi.getAll({ status: 'Active', limit: 6 }) as { products: Product[] };
        setProducts(response.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleViewAll = () => {
    navigate("/collections");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">Our Collection</h2>
        <p className="text-gray-500">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
        Our Collection
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.slice(0, 6).map((product) => {
          const firstVariant = product.variants[0];
          const image = firstVariant?.images[0] || '/images/placeholder.jpg';
          const price = firstVariant?.price || 0;

          return (
            <div
              key={product._id}
              className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 bg-white"
            >
              {/* Image Section */}
              <div
                onClick={() => handleProductClick(product._id)}
                className="relative w-full h-64 overflow-hidden"
              >
                <img
                  src={image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                {/* Wishlist Icon */}
                <div className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:scale-110 transition">
                  <Heart className="w-5 h-5 text-gray-500 hover:text-red-500" />
                </div>
              </div>

              {/* Product Info */}
              <div className="py-3 px-3">
                <h3 className="text-sm font-medium text-gray-800 truncate text-center">{product.title}</h3>
                <p className="text-lg font-semibold text-center mt-1">₹{price}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      {products.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleViewAll}
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition duration-300"
          >
            View All Products
          </button>
        </div>
      )}
    </div>
  );
};

export default ClothesCollection;
