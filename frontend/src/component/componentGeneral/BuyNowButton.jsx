import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { FaPlus } from "react-icons/fa6";
import { FiMinus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore.js";
import { FaCartArrowDown, FaCreditCard } from "react-icons/fa";

const BuyNowButton = ({ product, isAddToCart = false }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const MAX_QUANTITY = 5;

  const getAttrValue = (variant, attrName) =>
    variant?.attributes?.find((attr) => attr.name === attrName)?.value ||
    (attrName === "size" ? variant?.size?.name : variant?.color?.name) ||
    "";

  const findVariantByCombination = (sizeName, colorName) =>
    product.variants.find(
      (variant) =>
        getAttrValue(variant, "size") === sizeName &&
        getAttrValue(variant, "color") === colorName,
    );

  const availableSizes = [
    ...new Set(product?.variants?.map((variant) => getAttrValue(variant, "size"))),
  ].filter(Boolean);

  const availableColors = [
    ...new Set(
      (product?.variants || [])
        .filter((variant) => getAttrValue(variant, "size") === selectedSize)
        .map((variant) => getAttrValue(variant, "color")),
    ),
  ].filter(Boolean);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);
      setSelectedSize(getAttrValue(firstVariant, "size"));
      setSelectedColor(getAttrValue(firstVariant, "color"));
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleQuantityChange = (type) => {
    if (type === "increase" && quantity < MAX_QUANTITY) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSizeChange = (sizeName) => {
    setSelectedSize(sizeName);
    const firstColorForSize = (product?.variants || [])
      .filter((variant) => getAttrValue(variant, "size") === sizeName)
      .map((variant) => getAttrValue(variant, "color"))
      .find(Boolean);
    const fallbackColor = firstColorForSize || "";
    setSelectedColor(fallbackColor);
    setSelectedVariant(findVariantByCombination(sizeName, fallbackColor) || null);
  };
  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
    setSelectedVariant(findVariantByCombination(selectedSize, colorName) || null);
  };

  const handleConfirm = () => {
    addToCart(product, quantity, selectedVariant);
    if (isAddToCart) {
      handleClose();
    } else {
      navigate("/checkout");
    }
  };

  const formatPrice = (price) => {
    if (isNaN(price)) return price;
    return price.toLocaleString();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="primaryBgColor accentTextColor w-full px-1 py-1 md:py-1 rounded cursor-pointer"
      >
        <div className="flex items-center justify-center gap-4">
          {isAddToCart ? <FaCartArrowDown /> : <FaCreditCard />}
          <span>{isAddToCart ? "Add to Cart" : "Buy Now"}</span>
        </div>
      </button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{product.name}</DialogTitle>
        <DialogContent>
          {/* Variant Price */}
          {selectedVariant && (
            <div className="flex gap-2">
              {selectedVariant.discount > 0 ? (
                <>
                  <div className="line-through">
                    Rs. {formatPrice(Number(selectedVariant.price))}
                  </div>
                  <div className="text-red-800">
                    Rs. {formatPrice(Number(selectedVariant.discount))}
                  </div>
                </>
              ) : (
                <div className="text-black">
                  Rs. {formatPrice(Number(selectedVariant.price))}
                </div>
              )}
            </div>
          )}

          {/* Non-variant Price */}
          {!product.variants?.length && (
            <div className="flex gap-2 items-center">
              {product.finalDiscount > 0 ? (
                <>
                  <div className="line-through">
                    Rs. {formatPrice(Number(product.finalPrice))}
                  </div>
                  <div className="text-red-800">
                    Rs. {formatPrice(Number(product.finalDiscount))}
                  </div>
                </>
              ) : (
                <div className="text-black font-medium">
                  Rs. {formatPrice(Number(product.finalPrice))}
                </div>
              )}
            </div>
          )}

          {/* Size Variants */}
          {product.variants?.length > 0 && (
            <div className="flex gap-4 items-center mt-4">
              <h2 className="text-lg">Weight:</h2>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((sizeName) => (
                  <button
                    key={sizeName}
                    onClick={() => handleSizeChange(sizeName)}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      selectedSize === sizeName
                        ? "primaryBgColor text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {sizeName}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.variants?.length > 0 && (
            <div className="flex gap-4 items-center mt-4">
              <h2 className="text-lg">Color:</h2>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((colorName) => (
                  <button
                    key={colorName}
                    onClick={() => handleColorChange(colorName)}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      selectedColor === colorName
                        ? "primaryBgColor text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {colorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex gap-4 items-center mt-4">
            <h2 className="text-lg">Quantity</h2>
            <div className="rounded flex items-center justify-between">
              <button
                className="primaryBgColor accentTextColor px-2 py-2 rounded-l cursor-pointer"
                onClick={() => handleQuantityChange("decrease")}
              >
                <FiMinus />
              </button>
              <span className="px-3 py-1 bg-gray-200">{quantity}</span>
              <button
                className="primaryBgColor accentTextColor px-2 py-2 rounded-r cursor-pointer"
                onClick={() => handleQuantityChange("increase")}
                disabled={quantity >= MAX_QUANTITY}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          {/* Stock Info */}
          <div className="mt-4">
            {selectedVariant?.stock === 0 || product.finalStock === 0 ? (
              <span className="text-red-600 font-semibold">Stock Out</span>
            ) : selectedVariant?.stock < 20 || product.finalStock < 20 ? (
              <span className="primaryTextColor font-semibold">
                Only {selectedVariant?.stock || product.finalStock} left!
              </span>
            ) : null}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={
              (product.variants?.length > 0 && !selectedVariant) ||
              selectedVariant?.stock === 0 ||
              product.finalStock === 0
            }
            className="primaryBgColor"
            variant="contained"
          >
            {isAddToCart ? "Add to Cart" : "Proceed to Checkout"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BuyNowButton;