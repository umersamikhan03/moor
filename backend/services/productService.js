const ProductModel = require("../models/ProductModel");
const FlagModel = require("../models/FlagModel");
const CategoryModel = require("../models/CategoryModel");
const SubCategoryModel = require("../models/SubCategoryModel");
const ChildCategoryModel = require("../models/ChildCategoryModel");
const ProductSizeModel = require("../models/ProductSizeModel");
const mongoose = require("mongoose");

const normalizeAttributes = (variant = {}) => {
  if (Array.isArray(variant.attributes) && variant.attributes.length > 0) {
    return variant.attributes
      .filter((attr) => attr && attr.name && attr.value !== undefined)
      .map((attr) => ({
        name: String(attr.name).trim().toLowerCase(),
        value: String(attr.value).trim(),
        optionId: attr.optionId || null,
      }));
  }

  const attributes = [];
  if (variant.size) {
    if (typeof variant.size === "object") {
      attributes.push({
        name: "size",
        value: variant.size.name || variant.size.value || String(variant.size._id || ""),
        optionId: variant.size._id || null,
      });
    } else {
      attributes.push({ name: "size", value: String(variant.size), optionId: variant.size });
    }
  }
  if (variant.color) {
    if (typeof variant.color === "object") {
      attributes.push({
        name: "color",
        value: variant.color.name || variant.color.value || String(variant.color._id || ""),
        optionId: variant.color._id || null,
      });
    } else {
      attributes.push({ name: "color", value: String(variant.color), optionId: null });
    }
  }
  return attributes;
};

const normalizeVariants = async (variants = []) => {
  const sizeOptionIds = variants
    .map((variant) => variant?.size)
    .filter((size) => typeof size === "string" && mongoose.Types.ObjectId.isValid(size));

  const sizeDocs = sizeOptionIds.length
    ? await ProductSizeModel.find({ _id: { $in: sizeOptionIds } }).select("name").lean()
    : [];
  const sizeMap = new Map(sizeDocs.map((doc) => [doc._id.toString(), doc.name]));

  return variants.map((variant) => {
    const attributes = normalizeAttributes(variant).map((attr) => {
      if (attr.name === "size" && attr.optionId && sizeMap.has(String(attr.optionId))) {
        return { ...attr, value: sizeMap.get(String(attr.optionId)) };
      }
      if (attr.name === "size" && sizeMap.has(String(attr.value))) {
        return { ...attr, value: sizeMap.get(String(attr.value)), optionId: attr.optionId || attr.value };
      }
      return attr;
    });

    return {
      _id: variant._id,
      attributes,
      stock: Number(variant.stock),
      price: Number(variant.price),
      discount:
        variant.discount === "" || variant.discount === undefined || variant.discount === null
          ? null
          : Number(variant.discount),
    };
  });
};

const getVariantAttribute = (variant, attrName) =>
  variant?.attributes?.find((attr) => attr.name === attrName)?.value || null;

const serializeProduct = (productDoc) => {
  const product = typeof productDoc.toObject === "function" ? productDoc.toObject() : productDoc;
  if (!Array.isArray(product.variants)) return product;

  product.variants = product.variants.map((variant) => {
    const sizeName = getVariantAttribute(variant, "size");
    const colorName = getVariantAttribute(variant, "color");
    const sizeAttr = variant.attributes?.find((attr) => attr.name === "size");
    return {
      ...variant,
      sizeName: sizeName || undefined,
      colorName: colorName || undefined,
      // Backward compatibility for existing frontend code
      size: sizeName ? { _id: sizeAttr?.optionId || null, name: sizeName } : undefined,
      color: colorName ? { name: colorName } : undefined,
    };
  });

  return product;
};

// Create a new product
const createProduct = async (data) => {
  try {
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      data.variants = await normalizeVariants(data.variants);
    }
    const product = new ProductModel(data); // Save product with image names
    await product.save();
    return serializeProduct(product);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get all products without pagination or filters
 */
const getProducts = async () => {
  try {
    // Fetch all products without any pagination or filters
    const products = await ProductModel.find()
      .select("-createdAt -updatedAt") // Optional fields to exclude from the response
      .populate([
        { path: "category", select: "-createdAt -updatedAt" },
        { path: "subCategory", select: "-createdAt -updatedAt" },
        { path: "childCategory", select: "-createdAt -updatedAt" },
        { path: "flags", select: "-createdAt -updatedAt" },
      ]);

    return products.map(serializeProduct);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Get a single product by ID
 */
const getProductById = async (productId) => {
  try {
    const product = await ProductModel.findOne({ productId }).populate([
      { path: "category", select: "-createdAt -updatedAt" },
      { path: "subCategory", select: "-createdAt -updatedAt" },
      { path: "childCategory", select: "-createdAt -updatedAt" },
      { path: "flags", select: "-createdAt -updatedAt" },
    ]);
    if (!product) throw new Error("Product not found");
    return serializeProduct(product);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get a product by slug
const getProductBySlug = async (slug) => {
  try {
    // Ensure to use the slug directly, not the productId
    const product = await ProductModel.findOne({ slug }).populate([
      { path: "category", select: "-createdAt -updatedAt" },
      { path: "subCategory", select: "-createdAt -updatedAt" },
      { path: "childCategory", select: "-createdAt -updatedAt" },
      { path: "flags", select: "-createdAt -updatedAt" },
    ]);

    if (!product) throw new Error("Product not found");

    return serializeProduct(product);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Delete a product by ID
 */
const deleteProduct = async (productId) => {
  try {
    const deletedProduct = await ProductModel.findOneAndDelete({ productId });
    if (!deletedProduct) throw new Error("Product not found");
    return deletedProduct;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all products with pagination, filters, and sorting
// const getAllProducts = async ({
//   page = 1,
//   limit = 10,
//   sort,
//   category,
//   subcategory,
//   childCategory,
//   stock,
//   flags,
//   isActive,
//   search, // <-- added
// }) => {
//   try {
//     // Fetch category, subcategory, and childCategory independently
//     const [categoryDoc, subCategoryDoc, childCategoryDoc, flagDocs] =
//       await Promise.all([
//         category
//           ? CategoryModel.findOne({ name: category }).select("_id")
//           : null,
//         subcategory
//           ? SubCategoryModel.findOne({
//               slug: subcategory,
//               isActive: true,
//             }).select("_id")
//           : null,
//         childCategory
//           ? ChildCategoryModel.findOne({
//               slug: childCategory,
//               isActive: true,
//             }).select("_id")
//           : null,
//         flags
//           ? FlagModel.find({
//               name: { $in: flags.split(",") },
//               isActive: true,
//             }).select("_id")
//           : [],
//       ]);
//
//     // If any provided category, subcategory, or childCategory is invalid, return an empty result
//     if (
//       (category && !categoryDoc) ||
//       (subcategory && !subCategoryDoc) ||
//       (childCategory && !childCategoryDoc) ||
//       (flags && flagDocs.length === 0)
//     ) {
//       return {
//         products: [],
//         totalProducts: 0,
//         totalPages: 0,
//         currentPage: page,
//       };
//     }
//
//     let query = {};
//
//     if (typeof isActive === "boolean") {
//       query.isActive = isActive;
//     }
//
//     // Apply filters for valid active categories, subcategories, and child categories
//     if (categoryDoc) query.category = categoryDoc._id;
//     if (subCategoryDoc) query.subCategory = subCategoryDoc._id;
//     if (childCategoryDoc) query.childCategory = childCategoryDoc._id;
//
//     // Apply stock filter (in-stock or out-of-stock)
//     if (stock === "in") query.finalStock = { $gt: 0 };
//     if (stock === "out") query.finalStock = { $lte: 0 };
//
//
//
//
//
//     // Apply flags filter if provided
//     if (flagDocs.length)
//       query.flags = { $in: flagDocs.map((flag) => flag._id) };
//
//     // Default sorting to newest first
//     let sortOption = { createdAt: -1 };
//
//     // Check for valid sorting values
//     const validSortValues = [
//       "price_high",
//       "price_low",
//       "name_asc",
//       "name_desc",
//       "latest",
//       "oldest",
//     ];
//     if (sort && !validSortValues.includes(sort)) {
//       return {
//         products: [],
//         totalProducts: 0,
//         totalPages: 0,
//         currentPage: page,
//       };
//     }
//
//     // Sorting logic
//     if (sort === "price_high") sortOption = { finalDiscount: -1 };
//     if (sort === "price_low") sortOption = { finalDiscount: 1 };
//     if (sort === "name_asc") sortOption = { name: 1 }; // A-Z
//     if (sort === "name_desc") sortOption = { name: -1 }; // Z-A
//     if (sort === "oldest") sortOption = { createdAt: 1 }; // Oldest first
//
//     // Count total products based on the active filter
//     const totalProducts = await ProductModel.countDocuments(query);
//
//     // Fetch products with filters, sorting, and pagination
//     const products = await ProductModel.find(query)
//       .sort(sortOption)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .select(
//         "name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags productId",
//       )
//       .populate([
//         { path: "category", select: "-createdAt -updatedAt" },
//         { path: "flags", select: "-createdAt -updatedAt" },
//         { path: "variants.size", select: "-createdAt -updatedAt" },
//       ]);
//     if (
//       (category && !categoryDoc) ||
//       (subcategory && !subCategoryDoc) ||
//       (childCategory && !childCategoryDoc) ||
//       (flags && flagDocs.length === 0)
//     ) {
//       return {
//         products: [],
//         totalProducts: 0,
//         totalPages: 0,
//         currentPage: page,
//       };
//     }
//
// // ✅ ADD THIS NEXT
//     if (search && search.trim()) {
//       const matchedProduct = await ProductModel.findOne({
//         $expr: {
//           $eq: [{ $toLower: "$name" }, search.toLowerCase()],
//         },
//         isActive: true,
//       })
//         .select(
//           "name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags"
//         )
//         .populate([
//           { path: "category", select: "-createdAt -updatedAt" },
//           { path: "flags", select: "-createdAt -updatedAt" },
//           { path: "variants.size", select: "-createdAt -updatedAt" },
//         ]);
//
//       return {
//         products: matchedProduct ? [matchedProduct] : [],
//         totalProducts: matchedProduct ? 1 : 0,
//         totalPages: 1,
//         currentPage: page,
//       };
//     }
//
//     return {
//       products,
//       totalProducts,
//       totalPages: Math.ceil(totalProducts / limit),
//       currentPage: page,
//     };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const getAllProducts = async ({
  page = 1,
  limit = 10,
  sort,
  category,
  subcategory,
  childCategory,
  stock,
  flags,
  isActive,
  search,
}) => {
  try {
    // Fetch category, subcategory, childCategory, and flags independently
    const [categoryDoc, subCategoryDoc, childCategoryDoc, flagDocs] =
      await Promise.all([
        category
          ? CategoryModel.findOne({ name: category }).select("_id")
          : null,
        subcategory
          ? SubCategoryModel.findOne({
              slug: subcategory,
              isActive: true,
            }).select("_id")
          : null,
        childCategory
          ? ChildCategoryModel.findOne({
              slug: childCategory,
              isActive: true,
            }).select("_id")
          : null,
        flags
          ? FlagModel.find({
              name: { $in: flags.split(",") },
              isActive: true,
            }).select("_id")
          : [],
      ]);

    // If any provided category, subcategory, childCategory, or flags are invalid, return empty result
    if (
      (category && !categoryDoc) ||
      (subcategory && !subCategoryDoc) ||
      (childCategory && !childCategoryDoc) ||
      (flags && flagDocs.length === 0)
    ) {
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // Build the query object
    let query = {};

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    if (categoryDoc) query.category = categoryDoc._id;
    if (subCategoryDoc) query.subCategory = subCategoryDoc._id;
    if (childCategoryDoc) query.childCategory = childCategoryDoc._id;

    if (stock === "in") query.finalStock = { $gt: 0 };
    if (stock === "out") query.finalStock = { $lte: 0 };

    if (flagDocs.length) {
      query.flags = { $in: flagDocs.map((flag) => flag._id) };
    }

    // Add search filter: partial, case-insensitive match on product name
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    // Validate sort option
    const validSortValues = [
      "price_high",
      "price_low",
      "name_asc",
      "name_desc",
      "latest",
      "oldest",
    ];
    if (sort && !validSortValues.includes(sort)) {
      return {
        products: [],
        totalProducts: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // Define sorting options
    let sortOption = { createdAt: -1 }; // default newest first
    if (sort === "price_high") sortOption = { finalDiscount: -1 };
    if (sort === "price_low") sortOption = { finalDiscount: 1 };
    if (sort === "name_asc") sortOption = { name: 1 };
    if (sort === "name_desc") sortOption = { name: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    // Count total documents matching the query
    const totalProducts = await ProductModel.countDocuments(query);

    // Fetch products with filters, sorting, and pagination
    const products = await ProductModel.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags productCode",
      )
      .populate([
        { path: "category", select: "-createdAt -updatedAt" },
        { path: "flags", select: "-createdAt -updatedAt" },
      ]);

    return {
      products: products.map(serializeProduct),
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateProduct = async (productId, updatedData, files) => {
  try {
    // 1. Find the existing product
    const product = await ProductModel.findOne({ productId });
    if (!product) {
      throw new Error("Product not found");
    }

    // --- IMAGE HANDLING START ---
    // Handle thumbnail image update (only if a new file is uploaded)
    if (files && files.thumbnailImage && files.thumbnailImage.length > 0) {
      product.thumbnailImage = files.thumbnailImage[0].filename;
    }
    // If no new thumbnail uploaded, keep the old one (do nothing)

    // Handle images array update
    // updatedData.images = req.body.existingImages (may be string or array)
    let images = [];

    if (updatedData.existingImages) {
      images = Array.isArray(updatedData.existingImages)
        ? updatedData.existingImages
        : [updatedData.existingImages];
    }

    if (files && files.images && files.images.length > 0) {
      images = images.concat(files.images.map((f) => f.filename));
    }

    // Handle deleted images
    if (updatedData.imagesToDelete) {
      const toDelete = Array.isArray(updatedData.imagesToDelete)
        ? updatedData.imagesToDelete
        : [updatedData.imagesToDelete];
      images = images.filter((img) => !toDelete.includes(img));
    }

    product.images = images;

    // --- IMAGE HANDLING END ---

    // 2. Secure variant updates
    if (updatedData.variants && Array.isArray(updatedData.variants)) {
      updatedData.variants = await normalizeVariants(updatedData.variants);
    }

    // Handle other updates and save...
    Object.assign(product, updatedData);

    await product.save();

    return serializeProduct(product);
  } catch (error) {
    console.error("Update failed:", {
      error: error.message,
      inputVariants: updatedData.variants,
      existingVariants: product?.variants?.map((v) => ({
        _id: v._id,
        size: v.size._id,
        price: v.price,
        stock: v.stock,
      })),
    });
    throw new Error(`Update failed: ${error.message}`);
  }
};

// Similar Products for product details page
const getSimilarProducts = async (category, excludeId) => {
  try {
    const categoryObjectId = new mongoose.Types.ObjectId(category);
    const excludeObjectId = new mongoose.Types.ObjectId(excludeId);

    // Fetch products without specific sorting
    const similarProducts = await ProductModel.find({
      category: categoryObjectId,
      _id: { $ne: excludeObjectId },
      isActive: true,
    })
      .limit(8) // Limiting to 12 products
      .select(
        "name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags productId",
      )
      .populate([
        { path: "category", select: "-createdAt -updatedAt" },
        { path: "flags", select: "-createdAt -updatedAt" },
      ]);

    // Randomize the order using a Fisher-Yates shuffle
    const shuffledProducts = shuffleArray(similarProducts);

    return shuffledProducts.map(serializeProduct);
  } catch (error) {
    throw new Error("Failed to fetch similar products: " + error.message);
  }
};

// Fisher-Yates shuffle function to randomize the array
const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
};

// Get Products Details For Order
const getProductDetailsService = async ({ productId, variantId }) => {
  if (!productId) {
    throw { status: 400, message: "⚠️ productId is required!" };
  }

  const product = await ProductModel.findById(productId).lean();

  if (!product) {
    throw { status: 404, message: "❌ Product not found!" };
  }

  // Check if the product has variants
  const hasVariants =
    Array.isArray(product.variants) && product.variants.length > 0;

  // 🔒 If product has variants but no variantId provided
  if (hasVariants && !variantId) {
    throw {
      status: 400,
      message: "⚠️ variantId is required for products with variants!",
    };
  }

  // 👉 If variantId is provided
  if (variantId) {
    const selectedVariant = product.variants.find(
      (variant) => variant._id.toString() === variantId,
    );

    if (!selectedVariant) {
      throw { status: 404, message: "❌ Variant not found!" };
    }

    return {
      message: "✅ Product variant retrieved successfully!",
      variant: true,
      data: {
        productId: product._id,
        name: product.name,
        thumbnailImage: product.thumbnailImage,
        images: product.images,
        category: product.category,
        selectedVariant: {
          _id: selectedVariant._id,
          attributes: selectedVariant.attributes || [],
          size: getVariantAttribute(selectedVariant, "size"),
          color: getVariantAttribute(selectedVariant, "color"),
          price: selectedVariant.price,
          stock: selectedVariant.stock,
          discount: selectedVariant.discount ?? 0,
        },
      },
    };
  }

  // ✅ If product has no variants and no variantId is required
  return {
    message: "✅ Product (no variant) retrieved successfully!",
    variant: false,
    data: {
      productId: product._id,
      name: product.name,
      shortDesc: product.shortDesc,
      longDesc: product.longDesc,
      thumbnailImage: product.thumbnailImage,
      images: product.images,
      category: product.category,
      finalPrice: product.finalPrice,
      finalDiscount: product.finalDiscount,
      finalStock: product.finalStock,
    },
  };
};

const getHomePageProducts = async () => {
  try {
    // Step 1: Get all active flags
    const flags = await FlagModel.find({ isActive: true }).sort({
      createdAt: -1,
    });

    // Step 2: Prepare an object to hold products for each flag
    const result = {};

    for (const flag of flags) {
      const products = await ProductModel.find({
        flags: flag._id,
        isActive: true,
      })
        .limit(10)
        .sort({ createdAt: -1 }) // Sort products by newest first

        .select(
          "name slug finalDiscount finalPrice finalStock thumbnailImage isActive images productId category variants flags",
        )
      .populate([
          { path: "category", select: "-createdAt -updatedAt" },
          { path: "flags", select: "-createdAt -updatedAt" },
        ]);

      result[flag.name] = products.map(serializeProduct);
    }

    return result;
  } catch (error) {
    throw new Error("Failed to load homepage products: " + error.message);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSimilarProducts,
  getProductDetailsService,
  getHomePageProducts,
};
