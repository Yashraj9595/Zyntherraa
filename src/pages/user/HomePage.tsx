import React from 'react';
import ImageSlider from "./ImageSlider";
import ClothesCollection from "./ClothesCollection";
import CategorySection from "./CategorySection";

const HomePage: React.FC = () => {
  return (
    <>
      {/*Slider section*/}
      <div className="w-full h-full">
        <ImageSlider />
      </div>

      <div>
        <CategorySection />
      </div>

      {/*Our Collections section*/}
      <div className="w-full">
        <ClothesCollection/>
      </div>
    </>
  );
};

export default HomePage;
