import React from "react";
import Layout from "../component/componentGeneral/Layout.jsx";
import ProductCarousel from "../component/componentGeneral/ProductCarousel.jsx";
import NewInSection from "../component/componentGeneral/NewInSection.jsx";
import CategoryShowcase from "../component/componentGeneral/CategoryShowcase.jsx";
import TrendingSection from "../component/componentGeneral/TrendingSection.jsx";
import CategoryBanners from "../component/componentGeneral/CategoryBanners.jsx";
import InspirationGallery from "../component/componentGeneral/InspirationGallery.jsx";
import QuickLinksSection from "../component/componentGeneral/QuickLinksSection.jsx";

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Carousel - Unchanged */}
      <ProductCarousel />
      
      {/* NEW IN Section - Category Cards Slider */}
      <NewInSection />
      
      {/* Category Showcase - Subcategory Product Grids */}
      <CategoryShowcase />
      
      {/* Trending Section - Tabbed Products */}
      <TrendingSection />
      
      {/* Category Banners - 2x2 Full Image Cards */}
      <CategoryBanners />
      
      {/* World of Inspiration - Instagram-style Gallery */}
      <InspirationGallery />
      
      {/* Quick Links - Service Cards */}
      <QuickLinksSection />
    </Layout>
  );
};

export default HomePage;
