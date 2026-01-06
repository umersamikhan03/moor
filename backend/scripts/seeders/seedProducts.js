/**
 * Seed Products - Main Products with Variants
 * Idempotent: Checks for existing entries by productCode before inserting
 * Downloads images from Sapphire CDN and stores locally
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const ProductModel = require("../../models/ProductModel");
const CategoryModel = require("../../models/CategoryModel");
const SubCategoryModel = require("../../models/SubCategoryModel");
const ChildCategoryModel = require("../../models/ChildCategoryModel");
const ProductSizeModel = require("../../models/ProductSizeModel");
const FlagModel = require("../../models/FlagModel");
const productsData = require("./data/products.json");
const { downloadImage, downloadImages, createPlaceholder } = require("./utils/imageDownloader");

const seedProducts = async () => {
  try {
    console.log("🔄 Seeding Products...");
    
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Pre-load all reference data for faster lookups
    const categories = await CategoryModel.find({});
    const subCategories = await SubCategoryModel.find({});
    const childCategories = await ChildCategoryModel.find({});
    const sizes = await ProductSizeModel.find({});
    const flags = await FlagModel.find({});

    // Create lookup maps
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.name] = c._id);

    const subCategoryMap = {};
    subCategories.forEach(sc => {
      const cat = categories.find(c => c._id.equals(sc.category));
      if (cat) {
        subCategoryMap[`${cat.name}-${sc.name}`] = sc._id;
      }
    });

    const childCategoryMap = {};
    childCategories.forEach(cc => {
      const cat = categories.find(c => c._id.equals(cc.category));
      const subCat = subCategories.find(sc => sc._id.equals(cc.subCategory));
      if (cat && subCat) {
        childCategoryMap[`${cat.name}-${subCat.name}-${cc.name}`] = cc._id;
      }
    });

    const sizeMap = {};
    sizes.forEach(s => sizeMap[s.name] = s._id);

    const flagMap = {};
    flags.forEach(f => flagMap[f.name] = f._id);

    for (let productIndex = 0; productIndex < productsData.length; productIndex++) {
      const product = productsData[productIndex];
      try {
        // Check if product already exists by productCode (idempotent)
        const existingProduct = await ProductModel.findOne({ 
          productCode: product.productCode 
        });
        
        if (existingProduct) {
          console.log(`  ⏭️  Product "${product.name}" (${product.productCode}) already exists, skipping...`);
          skipped++;
          continue;
        }

        // Get category IDs
        const categoryId = categoryMap[product.categoryName];
        const subCategoryId = subCategoryMap[`${product.categoryName}-${product.subCategoryName}`];
        const childCategoryId = childCategoryMap[`${product.categoryName}-${product.subCategoryName}-${product.childCategoryName}`];

        if (!categoryId) {
          console.log(`  ⚠️  Category "${product.categoryName}" not found for product "${product.name}"`);
          errors++;
          continue;
        }

        // Get flag IDs
        const flagIds = [];
        if (product.flagNames && product.flagNames.length > 0) {
          for (const flagName of product.flagNames) {
            const flagId = flagMap[flagName];
            if (flagId) {
              flagIds.push(flagId);
            }
          }
        }

        // Build variants with size references
        const variants = [];
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            const sizeId = sizeMap[variant.sizeName];
            if (sizeId) {
              variants.push({
                size: sizeId,
                stock: variant.stock,
                price: variant.price,
                discount: variant.discount
              });
            }
          }
        }

        // Download images from Sapphire CDN
        console.log(`  📷 Downloading images for "${product.name}"...`);
        
        // Download thumbnail
        let thumbnailFilename = null;
        if (product.thumbnailImage) {
          thumbnailFilename = await downloadImage(product.thumbnailImage, product.productCode);
        }
        if (!thumbnailFilename) {
          console.log(`    ⚠️  Creating placeholder for thumbnail...`);
          thumbnailFilename = await createPlaceholder(product.name.substring(0, 25), 600, 720, productIndex);
        }

        // Download product images
        let imageFilenames = [];
        if (product.images && product.images.length > 0) {
          imageFilenames = await downloadImages(product.images, product.productCode);
        }
        // If no images downloaded, create multiple placeholders with variations
        if (imageFilenames.length === 0) {
          const placeholder1 = await createPlaceholder(product.name.substring(0, 25), 600, 720, productIndex);
          const placeholder2 = await createPlaceholder(product.name.substring(0, 25), 600, 720, productIndex + 3);
          imageFilenames = [placeholder1, placeholder2];
        }

        // Create product with local image filenames
        const productData = {
          name: product.name,
          productCode: product.productCode,
          shortDesc: product.shortDesc,
          longDesc: product.longDesc,
          category: categoryId,
          subCategory: subCategoryId || undefined,
          childCategory: childCategoryId || undefined,
          flags: flagIds.length > 0 ? flagIds : undefined,
          thumbnailImage: thumbnailFilename,
          images: imageFilenames,
          searchTags: product.searchTags,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          metaKeywords: product.metaKeywords,
          isActive: true
        };

        // Add variants or direct pricing
        if (variants.length > 0) {
          productData.variants = variants;
        } else {
          productData.finalPrice = product.finalPrice;
          productData.finalDiscount = product.finalDiscount;
          productData.finalStock = product.finalStock;
        }

        await ProductModel.create(productData);
        console.log(`  ✅ Created product: ${product.name}`);
        created++;

      } catch (productError) {
        console.log(`  ❌ Error creating product "${product.name}": ${productError.message}`);
        errors++;
      }
    }

    console.log(`\n📊 Products Summary: ${created} created, ${skipped} skipped, ${errors} errors`);
    return { created, skipped, errors };
  } catch (error) {
    console.error("❌ Error seeding products:", error.message);
    throw error;
  }
};

// Run standalone
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("📦 Connected to MongoDB");
      await seedProducts();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedProducts;
