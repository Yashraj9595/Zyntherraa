import React from 'react';

const HomePage: React.FC = () => {
  return (

    <div className="relative w-full w-4/5 mx-auto overflow-hidden">
      <img
        src="images/zynterraa_banner.jpeg"
        alt="Banner"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <h1 className="text-white text-2xl md:text-4xl font-bold">
          Coming Soon...
        </h1>
      </div>
    </div>
  );
};

export default HomePage;
