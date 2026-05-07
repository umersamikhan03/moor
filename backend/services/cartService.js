const CartModel = require("../models/CartModel");
const ProductModel = require("../models/ProductModel");

const matchCartItem = (cartItem, productId, variantId, variant) => {
  if (cartItem.productId?.toString() !== productId?.toString()) return false;
  if (variantId) {
    return (cartItem.variantId || "").toString() === variantId.toString();
  }
  return cartItem.variant === variant;
};

const getCart = async (userId) => {
  const cart = await CartModel.findOne({ user: userId });
  return cart || { user: userId, items: [] };
};

const addToCart = async (userId, item) => {
  if (!item.productId || !item.quantity) {
    throw new Error("Missing productId or quantity");
  }

  const product = await ProductModel.findById(item.productId).select("variants");
  if (!product) {
    throw new Error("Product not found");
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    if (!item.variantId || item.variantId === "Default") {
      throw new Error("Variant is required for this product");
    }
    const isValidVariant = product.variants.some(
      (variant) => variant._id.toString() === item.variantId.toString(),
    );
    if (!isValidVariant) {
      throw new Error("Variant not found for selected product");
    }
  }

  let cart = await CartModel.findOne({ user: userId });

  if (!cart) {
    cart = new CartModel({ user: userId, items: [item] });
  } else {
    const index = cart.items.findIndex(
      (i) => matchCartItem(i, item.productId, item.variantId, item.variant),
    );

    if (index > -1) {
      cart.items[index].quantity += item.quantity;
      if (cart.items[index].quantity > 5) {
        cart.items[index].quantity = 5;
      }
    } else {
      cart.items.push(item);
    }
  }

  await cart.save();
  return cart;
};

const updateCartItem = async (userId, productId, variantId, variant, quantity) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  const index = cart.items.findIndex(
    (item) => matchCartItem(item, productId, variantId, variant),
  );

  if (index > -1) {
    cart.items[index].quantity = quantity;
    await cart.save();
    return cart;
  } else {
    throw new Error("Item not found in cart");
  }
};

const removeCartItem = async (userId, productId, variantId, variant) => {
  const cart = await CartModel.findOne({ user: userId });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (item) => !matchCartItem(item, productId, variantId, variant),
  );
  await cart.save();
  return cart;
};

const clearCart = async (userId) => {
  const cart = await CartModel.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return { message: "Cart cleared successfully" };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
