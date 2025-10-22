import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const womenWesternWear = [
  {
    id: 1,
    price: "₹1299",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    price: "₹899",
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    price: "₹799",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
  },
];

const ClothesCollection: React.FC = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/collections");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
        Women's Western Collection
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {womenWesternWear.map((item) => (
          <div
            key={item.id}
            className="group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition duration-300 bg-white"
          >
            {/* Image Section */}
            <div
              onClick={handleRedirect}
              className="relative w-full h-64 overflow-hidden"
            >
              <img
                src={item.img}
                alt="product"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Wishlist Icon */}
              <div className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:scale-110 transition">
                <Heart className="w-5 h-5 text-gray-500 hover:text-red-500" />
              </div>
            </div>

            {/* Price Section */}
            <div className="py-3 text-center">
              <p className="text-lg font-semibold">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClothesCollection;
