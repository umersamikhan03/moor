import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoPersonOutline } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosLogOut } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import Skeleton from "react-loading-skeleton";

import GeneralInfoStore from "../../store/GeneralInfoStore";
import useCartStore from "../../store/useCartStore";
import useAuthUserStore from "../../store/AuthUserStore";
import useCategoryStore from "../../store/useCategoryStore.js";
import useSubCategoryStore from "../../store/useSubCategoryStore.js";
import useChildCategoryStore from "../../store/useChildCategoryStore.js";

import ImageComponent from "./ImageComponent";
import MobileMenu from "./MobileMenu";
import Cart from "./Cart";
import HeaderSearch from "./HeaderSearch.jsx";
import ImageComponentWithCompression from "./ImageComponentWithCompression.jsx";

const Headers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { GeneralInfoList, GeneralInfoListLoading, GeneralInfoListError } =
    GeneralInfoStore();
  const { cart } = useCartStore();
  const { user, logout } = useAuthUserStore();
  const { categories } = useCategoryStore();
  const { subCategories } = useSubCategoryStore();
  const { childCategories } = useChildCategoryStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartMenuOpen, setIsCartMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const cartButtonRef = useRef(null);
  const cartMenuRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  const prevCartCount = useRef(
    cart.reduce((total, item) => total + item.quantity, 0)
  );

  // Check if we're on the homepage
  const isHomePage = location.pathname === "/";

  const avatarClass = `
    w-8 h-8 md:w-10 md:h-10
    rounded-full object-cover border-2
    flex items-center justify-center
    transition-all duration-300 ease-in-out
    ${isScrolled || !isHomePage ? "border-gray-300 bg-gray-100 text-gray-800" : "border-white/50 bg-white/20 text-white"}
  `;

  // Build query string helper
  const buildQueryString = useCallback((params) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    return urlParams.toString();
  }, []);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }

      // Close cart menu
      if (
        cartMenuRef.current &&
        !cartMenuRef.current.contains(event.target) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target)
      ) {
        setIsCartMenuOpen(false);
      }

      // Close user dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }

      // Close search
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    if (isMenuOpen || isCartMenuOpen || isDropdownOpen || isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isCartMenuOpen, isDropdownOpen, isSearchOpen]);

  useEffect(() => {
    const currentCartCount = cart.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    if (currentCartCount > prevCartCount.current) {
      setIsCartMenuOpen(true);
    }
    prevCartCount.current = currentCartCount;
  }, [cart]);

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDropdownEnter = (categoryId) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(categoryId);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  if (GeneralInfoListError) {
    return (
      <div className="primaryTextColor container md:mx-auto text-center p-3">
        <h1>Something went wrong! Please try again later.</h1>
      </div>
    );
  }

  if (GeneralInfoListLoading) {
    return (
      <div className="xl:container xl:mx-auto p-3">
        <Skeleton height={60} />
      </div>
    );
  }

  // Dynamic text/icon colors based on scroll state and page
  const textColorClass = isScrolled || !isHomePage ? "text-gray-800" : "text-white";
  const hoverColorClass = isScrolled || !isHomePage ? "hover:text-gray-600" : "hover:text-white/80";
  const isTransparentMode = !isScrolled && isHomePage;

  return (
    <div>
      {/* Main Header - Sapphire Style */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparentMode ? "" : "bg-white shadow-sm"}`}
        style={isTransparentMode ? { background: "linear-gradient(45deg, black, transparent)" } : {}}
      >
        <div className="xl:container xl:mx-auto">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            {/* Left Section - Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu - Mobile */}
              <button
                ref={hamburgerRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden ${textColorClass} ${hoverColorClass} transition-colors cursor-pointer`}
                aria-label="Menu"
              >
                <GiHamburgerMenu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <ImageComponentWithCompression
                  imageName={isScrolled || !isHomePage ? GeneralInfoList?.PrimaryLogo : (GeneralInfoList?.SecondaryLogo || GeneralInfoList?.PrimaryLogo)}
                  className="h-8 md:h-10 w-auto object-contain"
                  altName={GeneralInfoList?.CompanyName}
                  width={200}
                  height={80}
                  loadingStrategy="eager"
                  fetchPriority="high"
                />
              </Link>
            </div>

            {/* Center Section - Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
              <ul className="flex items-center gap-1">
                {/* Home */}
                <li>
                  <Link
                    to="/"
                    className={`px-4 py-2 text-sm font-medium tracking-wide uppercase ${textColorClass} ${hoverColorClass} transition-colors`}
                  >
                    Home
                  </Link>
                </li>

                {/* Dynamic Categories */}
                {categories
                  ?.filter((category) => category.showOnNavbar)
                  .slice(0, 5)
                  .map((category) => {
                    const categoryQuery = buildQueryString({
                      category: category.name,
                    });
                    const categoryPath = `/shop?${categoryQuery}`;
                    const hasSubCategories =
                      Array.isArray(subCategories) &&
                      subCategories.some(
                        (subCat) =>
                          subCat?.category?._id === category._id && subCat.isActive
                      );

                    return (
                      <li
                        key={category._id}
                        className="relative"
                        onMouseEnter={() => handleDropdownEnter(category._id)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <Link
                          to={categoryPath}
                          className={`px-4 py-2 text-sm font-medium tracking-wide uppercase flex items-center gap-1 ${textColorClass} ${hoverColorClass} transition-colors`}
                        >
                          {category.name}
                          {hasSubCategories && (
                            <FaAngleDown className="w-3 h-3" />
                          )}
                        </Link>

                        {/* Dropdown Menu */}
                        {hasSubCategories && (
                          <div
                            className={`absolute top-full left-0 mt-0 pt-2 transition-all duration-200 ${
                              activeDropdown === category._id
                                ? "opacity-100 visible"
                                : "opacity-0 invisible"
                            }`}
                          >
                            <div className="bg-white shadow-lg rounded-md min-w-[200px] py-2">
                              {subCategories
                                .filter(
                                  (subCat) =>
                                    subCat?.category?._id === category._id &&
                                    subCat.isActive
                                )
                                .map((subCategory) => {
                                  const subCategoryQuery = buildQueryString({
                                    subcategory: subCategory.slug,
                                  });
                                  const subCategoryPath = `/shop?${subCategoryQuery}`;

                                  const hasChildCategories =
                                    Array.isArray(childCategories) &&
                                    childCategories.some(
                                      (child) =>
                                        (child?.subCategory?._id ||
                                          child?.subCategory) === subCategory._id &&
                                        child.isActive
                                    );

                                  return (
                                    <div key={subCategory._id} className="group/sub relative">
                                      <Link
                                        to={subCategoryPath}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                      >
                                        {subCategory.name}
                                      </Link>

                                      {/* Child Categories */}
                                      {hasChildCategories && (
                                        <div className="pl-4">
                                          {childCategories
                                            .filter(
                                              (child) =>
                                                (child?.subCategory?._id ||
                                                  child?.subCategory) ===
                                                  subCategory._id && child.isActive
                                            )
                                            .map((childCategory) => {
                                              const childCategoryQuery =
                                                buildQueryString({
                                                  childCategory: childCategory.slug,
                                                });
                                              const childCategoryPath = `/shop?${childCategoryQuery}`;

                                              return (
                                                <Link
                                                  key={childCategory._id}
                                                  to={childCategoryPath}
                                                  className="block px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                                                >
                                                  {childCategory.name}
                                                </Link>
                                              );
                                            })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}

                {/* Shop All */}
                <li>
                  <Link
                    to="/shop"
                    className={`px-4 py-2 text-sm font-medium tracking-wide uppercase ${textColorClass} ${hoverColorClass} transition-colors`}
                  >
                    Shop
                  </Link>
                </li>

                {/* More Dropdown */}
                <li
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter("more")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`px-4 py-2 text-sm font-medium tracking-wide uppercase flex items-center gap-1 ${textColorClass} ${hoverColorClass} transition-colors cursor-pointer`}
                  >
                    More <FaAngleDown className="w-3 h-3" />
                  </button>

                  <div
                    className={`absolute top-full right-0 mt-0 pt-2 transition-all duration-200 ${
                      activeDropdown === "more"
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                    }`}
                  >
                    <div className="bg-white shadow-lg rounded-md min-w-[180px] py-2">
                      {[
                        { name: "About Us", path: "/about" },
                        { name: "FAQ", path: "/faqs" },
                        { name: "Blog", path: "/blog" },
                        { name: "Contact", path: "/contact-us" },
                        { name: "Track Order", path: "/track-order" },
                      ].map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Right Section - Icons */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`${textColorClass} ${hoverColorClass} transition-colors p-1 cursor-pointer`}
                aria-label="Search"
              >
                <CiSearch className="w-6 h-6" strokeWidth={0.5} />
              </button>

              {/* User Icon */}
              {user ? (
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center cursor-pointer"
                  >
                    {user?.userImage &&
                    typeof user.userImage === "string" &&
                    user.userImage.trim() !== "" ? (
                      <ImageComponent
                        imageName={user.userImage}
                        className={avatarClass}
                      />
                    ) : (
                      <span className={avatarClass}>
                        {(user?.fullName &&
                          user.fullName.trim().charAt(0).toUpperCase()) ||
                          "U"}
                      </span>
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 top-full right-0 mt-3 bg-white shadow-lg rounded-md overflow-hidden min-w-[160px]"
                    >
                      <Link
                        to="/user/home"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <IoPersonOutline className="w-4 h-4" />
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full transition-colors cursor-pointer"
                      >
                        <IoIosLogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`${textColorClass} ${hoverColorClass} transition-colors p-1`}
                  aria-label="Login"
                >
                  <IoPersonOutline className="w-6 h-6" />
                </Link>
              )}

              {/* Cart Icon */}
              <button
                ref={cartButtonRef}
                onClick={() => setIsCartMenuOpen(!isCartMenuOpen)}
                className={`relative ${textColorClass} ${hoverColorClass} transition-colors p-1 cursor-pointer`}
                aria-label="Cart"
              >
                <HiOutlineShoppingBag className="w-6 h-6" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <div
          ref={searchRef}
          className={`absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 overflow-hidden ${
            isSearchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="xl:container xl:mx-auto px-4 py-4">
            <HeaderSearch onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>
      </header>

      {/* Spacer for fixed header on non-home pages */}
      {(!isHomePage || isScrolled) && <div className="h-16 md:h-18" />}

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          ref={menuRef}
          className="relative bg-white w-72 h-full shadow-lg transform transition-transform duration-300"
          style={{
            transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div className="p-4 h-full flex flex-col">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <ImageComponentWithCompression
                  imageName={GeneralInfoList?.PrimaryLogo}
                  className="h-8 w-auto"
                  altName={GeneralInfoList?.CompanyName}
                  width={150}
                  height={60}
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto">
              <MobileMenu />
            </div>

            {/* Mobile Menu Footer */}
            <div className="pt-4 border-t mt-4">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <IoIosLogOut className="w-5 h-5" />
                  Log Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <IoPersonOutline className="w-5 h-5" />
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Slide-in Menu */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isCartMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsCartMenuOpen(false)}
        />

        <div
          ref={cartMenuRef}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-lg transition-transform duration-300 ease-in-out"
          style={{
            transform: isCartMenuOpen ? "translateX(0)" : "translateX(100%)",
          }}
        >
          <div className="p-4 h-full flex flex-col">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-medium">
                Your Cart ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
              </h2>
              <button
                onClick={() => setIsCartMenuOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <Cart onCloseCartMenu={() => setIsCartMenuOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Headers;
