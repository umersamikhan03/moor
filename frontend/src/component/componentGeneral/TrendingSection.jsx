import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import useProductStore from "../../store/useProductStore.js";
import useFlagStore from "../../store/useFlagStore.js";
import Skeleton from "react-loading-skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImageComponentWithCompression from "./ImageComponentWithCompression.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Helper function for price formatting
const formatPrice = (price) => {
  if (isNaN(price)) return price;
  return price.toLocaleString();
};

const TrendingSection = () => {
  const { homeProducts, fetchHomeProducts, loading: productsLoading } = useProductStore();
  const { flags, fetchFlags, loading: flagsLoading } = useFlagStore();
  const [activeTab, setActiveTab] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchFlags();
    fetchHomeProducts();
  }, [fetchFlags, fetchHomeProducts]);

  // Set first flag as active tab once flags are loaded
  useEffect(() => {
    if (flags.length > 0 && !activeTab) {
      setActiveTab(flags[0].name);
    }
  }, [flags, activeTab]);

  const activeProducts = activeTab ? (homeProducts[activeTab] || []).slice(0, 10) : [];

  const settings = {
    dots: false,
    infinite: activeProducts.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
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
    ],
  };

  // Reset slider when tab changes
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(0);
    }
  }, [activeTab]);

  if (productsLoading || flagsLoading) {
    return (
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <Skeleton height={40} width={200} className="mb-2" />
              <Skeleton height={20} width={250} />
            </div>
            <div className="flex gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={30} width={100} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={500} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (flags.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - Title Left, Tabs Right */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          {/* Left Side - Title */}
          <div>
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-gray-900 mb-2">
              TRENDING
            </h2>
            <p className="text-sm tracking-wider text-gray-500 uppercase">
              Discover the Best-Selling Styles
            </p>
          </div>

          {/* Right Side - Tab Navigation */}
          <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-2">
            {flags.map((flag) => (
              <button
                key={flag._id}
                onClick={() => setActiveTab(flag.name)}
                className={`relative text-sm md:text-base tracking-wider font-medium whitespace-nowrap transition-all duration-300 pb-2
                  ${activeTab === flag.name 
                    ? 'text-gray-900' 
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {flag.name.toUpperCase()}
                {/* Underline indicator */}
                <span 
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transition-transform duration-300 origin-left
                    ${activeTab === flag.name ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Products Slider */}
        {activeProducts.length > 0 ? (
          <div className="relative group">
            {/* Navigation Arrows - Sapphire Style */}
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="absolute left-0 top-1/3 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all duration-300"
              aria-label="Previous"
            >
              <ChevronLeft size={32} strokeWidth={1} />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="absolute right-0 top-1/3 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all duration-300"
              aria-label="Next"
            >
              <ChevronRight size={32} strokeWidth={1} />
            </button>

            <Slider ref={sliderRef} {...settings}>
              {activeProducts.map((product) => {
                const price = product.variants?.length
                  ? product.variants[0].discount > 0 
                    ? product.variants[0].discount 
                    : product.variants[0].price
                  : product.finalDiscount > 0 
                    ? product.finalDiscount 
                    : product.finalPrice;

                return (
                  <div key={product._id || product.slug} className="px-2">
                    <Link
                      to={`/product/${product.slug}`}
                      className="block group/card"
                    >
                      {/* Product Image - Tall Portrait Aspect Ratio */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-4">
                        <ImageComponentWithCompression
                          imageName={product.thumbnailImage}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-105"
                          altName={product.name}
                          width={400}
                          height={533}
                        />
                      </div>

                      {/* Product Info - Clean Sapphire Style */}
                      <div className="text-left">
                        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1 uppercase tracking-wide">
                          {product.name}
                        </h3>
                        
                        <p className="text-xs text-gray-400 mb-2">
                          {product.category?.name || activeTab} - New Arrivals
                        </p>

                        {/* Price */}
                        <p className="text-sm text-gray-900">
                          Rs.{formatPrice(Number(price))}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </Slider>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No products found for this category.
          </div>
        )}
      </div>

      {/* Custom styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default TrendingSection;
