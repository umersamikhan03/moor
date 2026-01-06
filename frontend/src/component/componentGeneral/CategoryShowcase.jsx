import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useSubCategoryStore from "../../store/useSubCategoryStore.js";
import useProductStore from "../../store/useProductStore.js";
import useCategoryStore from "../../store/useCategoryStore.js";
import Skeleton from "react-loading-skeleton";
import ImageComponentWithCompression from "./ImageComponentWithCompression.jsx";

const CategoryShowcase = () => {
  const { subCategories, fetchSubCategories, loading: subCategoriesLoading } = useSubCategoryStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const { products, fetchProducts, loading: productsLoading } = useProductStore();
  const [showcaseData, setShowcaseData] = useState([]);

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
    fetchProducts({ limit: 100, page: 1 });
  }, [fetchSubCategories, fetchCategories, fetchProducts]);

  useEffect(() => {
    if (subCategories.length > 0 && products.length > 0 && categories.length > 0) {
      // Group subcategories by their parent category
      const categoryGroups = {};
      
      categories.filter(cat => cat.featureCategory).forEach(category => {
        const categorySubs = subCategories.filter(
          sub => sub.category === category._id || sub.category?._id === category._id
        );
        
        if (categorySubs.length > 0) {
          categoryGroups[category._id] = {
            category: category,
            subcategories: categorySubs.slice(0, 4).map(sub => {
              // Get products for this subcategory
              const subProducts = products.filter(
                p => (p.subCategory?._id === sub._id || p.subCategory === sub._id) && p.thumbnailImage
              );
              return {
                ...sub,
                products: subProducts.slice(0, 3),
              };
            }).filter(sub => sub.products.length > 0)
          };
        }
      });

      // Convert to array and take first 3 categories with subcategories
      const showcase = Object.values(categoryGroups)
        .filter(group => group.subcategories.length > 0)
        .slice(0, 3);

      setShowcaseData(showcase);
    }
  }, [subCategories, products, categories]);

  if (subCategoriesLoading || productsLoading || categoriesLoading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {[1, 2].map((i) => (
            <div key={i} className="mb-16">
              <Skeleton height={30} width={200} className="mb-4" />
              <Skeleton height={20} width={150} className="mb-6" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton height={400} />
                <Skeleton height={400} />
                <Skeleton height={400} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (showcaseData.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-white">
      {showcaseData.map((group, groupIndex) => (
        <div key={group.category._id} className="mb-16 last:mb-0">
          {/* Category Header */}
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <div className="text-center">
              <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-2">
                {group.category.name}
              </p>
              <h2 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-gray-900 mb-4">
                {group.category.name}
              </h2>
              <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                Experience the quintessence of enduring artistry and elegance crafted to perfection.
              </p>
            </div>
            
            {/* Category Quick Links */}
            <div className="flex justify-center gap-6 mt-6">
              {group.subcategories.slice(0, 3).map((sub) => (
                <Link
                  key={sub._id}
                  to={`/shop?subcategory=${sub.slug}`}
                  className="text-xs tracking-widest text-gray-700 hover:text-gray-900 border-b border-transparent hover:border-gray-900 pb-1 transition-all duration-300 uppercase"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Subcategory Showcases */}
          {group.subcategories.map((subcategory, subIndex) => (
            <div 
              key={subcategory._id} 
              className={`py-12 ${subIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <div className="max-w-7xl mx-auto px-4">
                {/* Subcategory Title */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-light tracking-[0.15em] text-gray-900 uppercase">
                      {subcategory.name}
                    </h3>
                  </div>
                  <Link
                    to={`/shop?subcategory=${subcategory.slug}`}
                    className="hidden md:inline-flex items-center gap-2 text-sm tracking-widest text-gray-700 hover:text-gray-900 transition-colors duration-300 group"
                  >
                    SHOP THE TREND
                    <svg 
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>

                {/* Product Images Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {subcategory.products.slice(0, 3).map((product, productIndex) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug}`}
                      className="block relative group overflow-hidden"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                        <ImageComponentWithCompression
                          imageName={product.thumbnailImage}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          altName={product.name}
                          width={400}
                          height={533}
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        
                        {/* Product Name on Hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs md:text-sm truncate">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Mobile Shop Button */}
                <div className="mt-6 md:hidden text-center">
                  <Link
                    to={`/shop?subcategory=${subcategory.slug}`}
                    className="inline-flex items-center gap-2 text-sm tracking-widest text-gray-700 border border-gray-300 px-6 py-3 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300"
                  >
                    SHOP THE TREND
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
};

export default CategoryShowcase;
