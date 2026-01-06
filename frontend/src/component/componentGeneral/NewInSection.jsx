import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import useCategoryStore from "../../store/useCategoryStore.js";
import useProductStore from "../../store/useProductStore.js";
import Skeleton from "react-loading-skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageComponentWithCompression from "./ImageComponentWithCompression.jsx";

const NewInSection = () => {
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const { products, fetchProducts, loading: productsLoading } = useProductStore();
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    // Fetch some products to get category images
    fetchProducts({ limit: 50, page: 1 });
  }, [fetchCategories, fetchProducts]);

  // Filter featured categories
  const featuredCategories = categories.filter(cat => cat.featureCategory);

  // Get first product image for each category
  const getCategoryImage = (categoryName) => {
    const categoryProducts = products.filter(
      p => p.category?.name === categoryName && p.thumbnailImage
    );
    return categoryProducts[0]?.thumbnailImage || null;
  };

  const settings = {
    dots: false,
    infinite: featuredCategories.length > 3,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "40px",
        },
      },
    ],
  };

  if (categoriesLoading || productsLoading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton height={30} width={150} className="mx-auto mb-4" />
          <Skeleton height={20} width={400} className="mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={400} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredCategories.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-light tracking-[0.3em] text-gray-900 mb-4">
            NEW IN
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Refresh your wardrobe with this week's new arrivals. Discover the latest trends,
            collection highlights, and key pieces for the season.
          </p>
          <Link
            to="/shop?page=1&limit=20"
            className="inline-block mt-6 text-sm tracking-widest text-gray-900 border-b border-gray-900 pb-1 hover:text-gray-600 hover:border-gray-600 transition-all duration-300"
          >
            SHOP NOW
          </Link>
        </div>

        {/* Category Slider */}
        <div className="relative group">
          {/* Custom Navigation Arrows */}
          <button
            onClick={() => sliderRef.current?.slickPrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-100"
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="text-gray-800" />
          </button>
          <button
            onClick={() => sliderRef.current?.slickNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-100"
            aria-label="Next"
          >
            <ChevronRight size={20} className="text-gray-800" />
          </button>

          <Slider ref={sliderRef} {...settings}>
            {featuredCategories.map((category) => {
              const categoryImage = getCategoryImage(category.name);
              
              return (
                <div key={category._id} className="px-2">
                  <Link
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="block relative group/card overflow-hidden"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {categoryImage ? (
                        <ImageComponentWithCompression
                          imageName={categoryImage}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                          altName={category.name}
                          width={400}
                          height={533}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">{category.name}</span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                      
                      {/* Category Name */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <h3 className="text-white text-sm md:text-base font-medium tracking-[0.2em] uppercase">
                          {category.name}
                        </h3>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </Slider>
        </div>

        {/* Slide Indicators (Dots) */}
        <div className="flex justify-center gap-2 mt-6">
          {featuredCategories.slice(0, Math.min(6, featuredCategories.length)).map((_, index) => (
            <button
              key={index}
              onClick={() => sliderRef.current?.slickGoTo(index)}
              className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-500 transition-colors duration-300"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewInSection;
