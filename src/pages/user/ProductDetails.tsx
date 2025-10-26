import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

interface Product {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  deliveryDays: number;
  returnPolicy: string;
  images: string[];
  sizes: string[];
  colors: string[];
  description: string;
  care: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Black");

  // Example product data
  const product: Product = {
    id: id || "1",
    name: "Men's Cotton Casual Shirt",
    brand: "UrbanEdge",
    price: 1299,
    discountPrice: 999,
    rating: 4.5,
    reviews: 87,
    inStock: true,
    deliveryDays: 5,
    returnPolicy: "30-day easy return",
    images: [
      "/images/1.jpg",
      "/images/2.jpg",
      "/images/3.jpg",
      "/images/4.png",
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Blue", "White"],
    description:
      "This stylish cotton casual shirt from UrbanEdge offers a perfect blend of comfort and sophistication. Designed with premium breathable fabric, it’s ideal for both work and weekend outings.",
    care: "Machine wash cold with like colors. Tumble dry low.",
  };

  // Related products (You May Also Like)
  const relatedProducts = [
    {
      id: "2",
      name: "Men's Checked Cotton Shirt",
      image: "/images/sample/1.jpg",
      price: 1099,
    },
    {
      id: "3",
      name: "Denim Slim Fit Shirt",
      image: "/images/sample/2.jpg",
      price: 1199,
    },
    {
      id: "4",
      name: "Printed Half Sleeve Shirt",
      image: "/images/sample/3.jpg",
      price: 999,
    },
    {
      id: "5",
      name: "Formal Cotton Shirt",
      image: "/images/sample/2.jpg",
      price: 1299,
    },
  ];

  const handleAddToCart = (productName: string) => {
    alert(`${productName} added to cart!`);
  };

  const handleAddToWishlist = () => {
    alert(`${product.name} added to wishlist!`);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        Home / Men / Shirts /{" "}
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Product Images */}
        <div>
          <div className="border rounded-2xl overflow-hidden">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 justify-center">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Thumbnail"
                className={`w-20 h-20 rounded-xl border-2 cursor-pointer ${
                  selectedImage === idx
                    ? "border-gray-900"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                onClick={() => setSelectedImage(idx)}
              />
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-500 mt-1">Brand: {product.brand}</p>

          <div className="flex items-center gap-2 mt-3">
            <span className="text-3xl font-semibold text-gray-900">
              ₹{product.discountPrice}
            </span>
            <span className="text-gray-400 line-through text-lg">
              ₹{product.price}
            </span>
            <span className="text-green-600 text-sm font-medium">23% OFF</span>
          </div>

          <div className="flex items-center mt-2 text-yellow-500">
            {"★".repeat(Math.floor(product.rating))}{" "}
            <span className="text-gray-600 ml-2">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <p
            className={`mt-2 text-sm font-medium ${
              product.inStock ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </p>

          {/* Size Selection */}
          <div className="mt-5">
            <h3 className="text-gray-700 font-medium mb-2">Select Size</h3>
            <div className="flex gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`w-12 h-12 border rounded-full font-semibold ${
                    selectedSize === size
                      ? "border-black bg-gray-100"
                      : "border-gray-300 hover:border-black"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mt-5">
            <h3 className="text-gray-700 font-medium mb-2">Select Color</h3>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`px-4 py-2 border rounded-full ${
                    selectedColor === color
                      ? "border-black bg-gray-100"
                      : "border-gray-300 hover:border-black"
                  }`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart and Wishlist */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={() => handleAddToCart(product.name)}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              Add to Cart
            </button>

            <button
              onClick={handleAddToWishlist}
              className="border border-gray-300 px-6 py-3 rounded-xl flex items-center gap-2 hover:border-black"
            >
              <Heart size={18} /> Wishlist
            </button>
          </div>

          {/* Delivery & Return Info */}
          <div className="mt-6 text-sm text-gray-600">
            <p>Estimated delivery in {product.deliveryDays} days.</p>
            <p>{product.returnPolicy}.</p>
          </div>

          {/* Product Description */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">
              Product Description
            </h3>
            <p className="text-gray-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Care Instructions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Care Instructions
            </h3>
            <p className="text-gray-600 mt-2">{product.care}</p>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
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
              />

              {/* Add to Cart Button (on hover navigates to product page) */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleProductClick(item.id)} // Navigate to details
                  className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Add to Cart
                </button>
              </div>

              <div
                className="p-4 cursor-pointer"
                onClick={() => handleProductClick(item.id)}
              >
                <p className="text-gray-800 font-medium">{item.name}</p>
                <p className="text-gray-600 text-sm">₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
