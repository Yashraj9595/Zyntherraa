import React from 'react';
import ImageSlider from "./ImageSlider";
import ClothesCollection from "./ClothesCollection";
import CategorySection from "./CategorySection";
const HomePage: React.FC = () => {
  return (
<>
{/*Banner section*/}
{/* <div className="relative w-full h-[450px] mx-auto m-0">
  <img
    src="images/zynterraa_banner.jpeg"  // replace with your image path or URL
    alt="Banner" className='w-full h-full'     
  />
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
    <h1 className="text-white text-2xl md:text-4xl font-bold">
      Event's Coming Soon...
    </h1>
  </div>
</div> */}
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
