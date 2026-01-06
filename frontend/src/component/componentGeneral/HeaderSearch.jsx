import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CiSearch } from "react-icons/ci";

const HeaderSearch = ({ onClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const searchTimeoutRef = useRef(null);

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}&page=1`);
      if (onClose) onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  return (
    <div className="flex w-full max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search products..."
        value={searchInput}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="px-4 py-3 w-full outline-none text-gray-700 border border-gray-200 rounded-l-lg focus:border-gray-400 transition-colors"
        autoFocus
      />
      <button
        onClick={handleSearch}
        className="primaryBgColor px-6 py-3 rounded-r-lg hover:opacity-90 transition-opacity"
        aria-label="Search"
      >
        <CiSearch className="text-white w-5 h-5" />
      </button>
    </div>
  );
};

export default HeaderSearch;
