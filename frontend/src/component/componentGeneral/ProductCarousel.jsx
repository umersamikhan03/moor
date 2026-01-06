import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import CarouselStore from "../../store/CarouselStore.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import GeneralInfoStore from "../../store/GeneralInfoStore.js";
import ImageComponentWithCompression from "./ImageComponentWithCompression.jsx";

const ProductCarousel = () => {
  const {
    CarouselStoreList,
    CarouselStoreListLoading,
    CarouselStoreListError,
  } = CarouselStore();

  const { GeneralInfoList } = GeneralInfoStore();

  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(CarouselStoreList) && CarouselStoreList.length > 0) {
      setProducts(CarouselStoreList);
    }
  }, [CarouselStoreList]);

  const settings = {
    dots: false,
    infinite: products.length > 1,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: products.length > 1,
    autoplaySpeed: 6000,
    pauseOnHover: false,
    arrows: true,
    fade: true,
    cssEase: "ease-in-out",
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  useEffect(() => {
    if (sliderRef.current && products.length > 1) {
      sliderRef.current.slickPlay();
    }
  }, [products]);

  if (CarouselStoreListError) {
    return (
      <div className="primaryTextColor container md:mx-auto text-center p-3">
        <h1 className="p-44">
          Something went wrong! Please try again later.
        </h1>
      </div>
    );
  }

  return (
    <div className="hero-carousel relative w-full">
      {CarouselStoreListLoading ? (
        <div className="w-full">
          <Skeleton height={600} width="100%" />
        </div>
      ) : (
        <Slider ref={sliderRef} {...settings}>
          {products.map((product, index) => (
            <div key={index} className="relative">
              {/* Hero Image - Full Width */}
              <div className="relative w-full  overflow-hidden">
                <ImageComponentWithCompression
                  imageName={product.imgSrc}
                  className="w-full h-full object-cover object-center"
                  skeletonHeight={600}
                  altName={GeneralInfoList?.CompanyName || "Hero Image"}
                  width={1920}
                  height={1080}
                  loadingStrategy="eager"
                  fetchPriority="high"
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Text Overlay Content */}
                {(product.heading || product.subHeading || product.buttonText) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 lg:pb-32 text-center text-white px-4">
                    {/* Heading */}
                    {product.heading && (
                      <h1 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-wider mb-2 md:mb-3 animate-fadeInUp">
                        {product.heading}
                      </h1>
                    )}
                    
                    {/* Sub Heading */}
                    {product.subHeading && (
                      <p className="text-sm md:text-lg lg:text-xl tracking-widest mb-4 md:mb-6 font-light animate-fadeInUp animation-delay-100">
                        {product.subHeading}
                      </p>
                    )}
                    
                    {/* CTA Button */}
                    {product.buttonText && (
                      <Link
                        to={product.buttonLink || "/shop"}
                        className="inline-block border border-white text-white px-8 py-3 text-sm md:text-base tracking-widest hover:bg-white hover:text-black transition-all duration-300 animate-fadeInUp animation-delay-200"
                      >
                        {product.buttonText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </Slider>
      )}
      
      {/* Custom CSS for animations */}
      <style>{`
        .hero-carousel .slick-slide {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .hero-carousel .slick-slide.slick-active {
          opacity: 1;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease forwards;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

// Custom Arrow Components - Minimal Sapphire Style
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-2 z-10 transition-all duration-300 cursor-pointer"
    aria-label="Previous slide"
  >
    <ChevronLeft size={40} strokeWidth={1} />
  </button>
);

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-2 z-10 transition-all duration-300 cursor-pointer"
    aria-label="Next slide"
  >
    <ChevronRight size={40} strokeWidth={1} />
  </button>
);

export default ProductCarousel;
