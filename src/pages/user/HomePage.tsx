import React from 'react';
import ImageSlider from "./ImageSlider";
import CategorySection from "./CategorySection";
import FeaturedProducts from "./FeaturedProducts";
import WatchAndShop from "./WatchAndShop";
import ClothesCollection from "./ClothesCollection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner Slider Section */}
      <section className="w-full">
        <ImageSlider />
      </section>

      {/* Shop by Category Section */}
      <section className="w-full">
        <CategorySection />
      </section>

      {/* Featured Products Section */}
      <section className="w-full">
        <FeaturedProducts />
      </section>

      {/* Watch & Shop Section */}
      <section className="w-full">
        <WatchAndShop />
      </section>

      {/* Our Collections Section */}
      <section className="w-full">
        <ClothesCollection />
      </section>
    </div>
  );
};

export default HomePage;
