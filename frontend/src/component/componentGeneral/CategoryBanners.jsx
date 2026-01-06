import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useCategoryStore from "../../store/useCategoryStore.js";
import useProductStore from "../../store/useProductStore.js";
import Skeleton from "react-loading-skeleton";
import ImageComponentWithCompression from "./ImageComponentWithCompression.jsx";
import { ArrowRight } from "lucide-react";

const CategoryBanners = () => {
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const { products, fetchProducts, loading: productsLoading } = useProductStore();

  useEffect(() => {
    fetchCategories();
    fetchProducts({ limit: 100, page: 1 });
  }, [fetchCategories, fetchProducts]);

  // Get first 4 featured categories
  const featuredCategories = categories.filter(cat => cat.featureCategory).slice(0, 4);

  // Get first product image for each category (to use as banner)
  const getCategoryImage = (categoryName) => {
    const categoryProducts = products.filter(
      p => p.category?.name === categoryName && p.thumbnailImage
    );
    return categoryProducts[0]?.thumbnailImage || null;
  };

  if (categoriesLoading || productsLoading) {
    return (
      <section className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={500} className="w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (featuredCategories.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {featuredCategories.map((category) => {
          const categoryImage = getCategoryImage(category.name);
          
          return (
            <Link
              key={category._id}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="block relative group overflow-hidden"
            >
              {/* Full-size Image Container */}
              <div className="relative aspect-[4/5] md:aspect-[16/12] overflow-hidden bg-gray-100">
                {categoryImage ? (
                  <ImageComponentWithCompression
                    imageName={categoryImage}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    altName={category.name}
                    width={800}
                    height={600}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-white text-2xl font-light tracking-widest">
                      {category.name}
                    </span>
                  </div>
                )}
                
                {/* Dark Gradient Overlay at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  {/* Category Name */}
                  <h3 className="text-white text-xl md:text-2xl font-medium tracking-[0.15em] uppercase mb-3">
                    {category.name}
                  </h3>
                  
                  {/* Shop The Trend Link */}
                  <div className="flex items-center gap-2 text-white text-sm tracking-widest group-hover:gap-3 transition-all duration-300">
                    <span>SHOP THE TREND</span>
                    <ArrowRight size={16} strokeWidth={1.5} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBanners;
