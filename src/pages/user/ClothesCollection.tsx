import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";


const categories = [
  {
    name: "Western Wear",
    products: [
      { id: 1, price: "₹1299",name: "Floral Maxi Dress", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" },
      { id: 2, price: "₹899",name: "Denim Jacket style", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80" },
      { id: 3, price: "₹799",name: "Casual Blazer", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80" },
      { id: 4, price: "₹999", name: "Striped Shirt",img: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=600&q=80" },
      { id: 5, price: "₹699",name: "Striped 2", img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80" },
    ],
  },
  {
    name: "Ethnic Wear",
    products: [
      { id: 1, price: "₹1499", name: "Denim Jacket", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80" },
      { id: 2, price: "₹999",name: "Striped Shirt", img: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=600&q=80" },
      { id: 3, price: "₹899",name: " Shirt1", img: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=600&q=80" },
    ],
  },
];

const ClothesCollection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(categories[0].name);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();


  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const activeCategory = categories.find((c) => c.name === activeTab);
    const handleProductClick = (product: any) => {
        navigate(`/product/${product.id}`, { state: { product } });
      };
  return (
    <div className="theme-gradient-light py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="heading-luxury text-3xl font-semibold mb-2">
            Women's Collection
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Discover the perfect outfit for every occasion
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveTab(category.name)}
              className={`px-5 py-2 rounded-full border border-gray-300 text-sm font-medium transition-all duration-300
                ${
                  activeTab === category.name
                    ? "text-black border-black shadow-sm"
                    : "text-gray-600 hover:text-black hover:border-black"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Slider Section */}
        <div className="relative">
          {activeCategory && activeCategory.products.length > 3 && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:shadow-lg p-2 rounded-full z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-md hover:shadow-lg p-2 rounded-full z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Product Cards */}
          {/* <div
            ref={scrollRef}
            className="flex space-x-5 overflow-x-hidden scroll-smooth scrollbar-hide"
          >
            {activeCategory?.products.map((item) => (
              <div
                key={item.id}
                className="min-w-[220px] sm:min-w-[250px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1"
              >
                <div className="relative w-full h-60 overflow-hidden">
                  <img
                    src={item.img}
                    alt="product"
                    className="w-full h-full object-cover hover:scale-110 transition duration-700"
                  />
                  <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white shadow-md transition">
                    <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <p className="text-lg font-semibold">{item.price}</p>
                  <p className="text-sm text-gray-500">4.8 ★★★★★</p>
                </div>
              </div>
            ))}
          </div> */}

            <div
            ref={scrollRef}
            className="flex space-x-5 overflow-x-hidden scroll-smooth scrollbar-hide"
           >
            {activeCategory?.products.map((item) => (
              <div
                key={item.id}
                className="min-w-[220px] sm:min-w-[250px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1"
              >
                <div
                  className="relative w-full h-60 overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(item)}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-700"
                  />
                  <button className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white shadow-md transition">
                    <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-4 text-center">
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-gray-600 mb-2">{item.price}</p>
                  <button
                    onClick={() => handleProductClick(item)}
                    className="w-full py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClothesCollection;
