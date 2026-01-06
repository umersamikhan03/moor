/**
 * Seed Categories - Categories, SubCategories, ChildCategories
 * Idempotent: Checks for existing entries before inserting
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const CategoryModel = require("../../models/CategoryModel");
const SubCategoryModel = require("../../models/SubCategoryModel");
const ChildCategoryModel = require("../../models/ChildCategoryModel");
const CategoryCounterModel = require("../../models/CategoryCounterModel");
const ChildCategoryCounterModel = require("../../models/ChildCategoryCounter");
const slugify = require("slugify");
const categoriesData = require("./data/categories.json");

// Helper function to get next counter value
const getNextCounterValue = async (CounterModel, counterName) => {
  const counter = await CounterModel.findOneAndUpdate(
    { name: counterName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

const seedCategories = async () => {
  try {
    console.log("🔄 Seeding Categories...");
    
    const stats = {
      categories: { created: 0, skipped: 0 },
      subCategories: { created: 0, skipped: 0 },
      childCategories: { created: 0, skipped: 0 }
    };

    // 1. Seed Main Categories
    console.log("\n📁 Seeding Main Categories...");
    const categoryMap = {};
    
    for (const category of categoriesData.categories) {
      let existingCategory = await CategoryModel.findOne({ name: category.name });
      
      if (existingCategory) {
        console.log(`  ⏭️  Category "${category.name}" already exists, skipping...`);
        categoryMap[category.name] = existingCategory._id;
        stats.categories.skipped++;
      } else {
        const newCategory = await CategoryModel.create(category);
        categoryMap[category.name] = newCategory._id;
        console.log(`  ✅ Created category: ${category.name}`);
        stats.categories.created++;
      }
    }

    // 2. Seed SubCategories
    console.log("\n📂 Seeding SubCategories...");
    const subCategoryMap = {};
    
    for (const subCategory of categoriesData.subCategories) {
      const categoryId = categoryMap[subCategory.categoryName];
      
      if (!categoryId) {
        console.log(`  ⚠️  Parent category "${subCategory.categoryName}" not found for "${subCategory.name}"`);
        continue;
      }

      let existingSubCategory = await SubCategoryModel.findOne({ 
        name: subCategory.name,
        category: categoryId 
      });
      
      if (existingSubCategory) {
        console.log(`  ⏭️  SubCategory "${subCategory.name}" already exists, skipping...`);
        subCategoryMap[`${subCategory.categoryName}-${subCategory.name}`] = existingSubCategory._id;
        stats.subCategories.skipped++;
      } else {
        // Manually generate categoryId (counter) and slug since pre-save runs after validation
        const counterValue = await getNextCounterValue(CategoryCounterModel, "SubCategory");
        const slug = slugify(`${subCategory.name}-${counterValue}`, { lower: true });
        
        const newSubCategory = await SubCategoryModel.create({
          name: subCategory.name,
          isActive: subCategory.isActive,
          category: categoryId,
          categoryId: counterValue,
          slug: slug
        });
        subCategoryMap[`${subCategory.categoryName}-${subCategory.name}`] = newSubCategory._id;
        console.log(`  ✅ Created subCategory: ${subCategory.name} (under ${subCategory.categoryName})`);
        stats.subCategories.created++;
      }
    }

    // 3. Seed ChildCategories
    console.log("\n📄 Seeding ChildCategories...");
    
    for (const childCategory of categoriesData.childCategories) {
      const categoryId = categoryMap[childCategory.categoryName];
      const subCategoryId = subCategoryMap[`${childCategory.categoryName}-${childCategory.subCategoryName}`];
      
      if (!categoryId || !subCategoryId) {
        console.log(`  ⚠️  Parent not found for child "${childCategory.name}"`);
        continue;
      }

      let existingChildCategory = await ChildCategoryModel.findOne({ 
        name: childCategory.name,
        category: categoryId,
        subCategory: subCategoryId
      });
      
      if (existingChildCategory) {
        console.log(`  ⏭️  ChildCategory "${childCategory.name}" already exists, skipping...`);
        stats.childCategories.skipped++;
      } else {
        // Manually generate categoryId (counter) and slug
        const counterValue = await getNextCounterValue(ChildCategoryCounterModel, "SubCategory");
        const slug = slugify(`${childCategory.name}-${counterValue}`, { lower: true });
        
        await ChildCategoryModel.create({
          name: childCategory.name,
          isActive: childCategory.isActive,
          category: categoryId,
          subCategory: subCategoryId,
          categoryId: counterValue,
          slug: slug
        });
        console.log(`  ✅ Created childCategory: ${childCategory.name}`);
        stats.childCategories.created++;
      }
    }

    console.log("\n📊 Categories Summary:");
    console.log(`   Categories: ${stats.categories.created} created, ${stats.categories.skipped} skipped`);
    console.log(`   SubCategories: ${stats.subCategories.created} created, ${stats.subCategories.skipped} skipped`);
    console.log(`   ChildCategories: ${stats.childCategories.created} created, ${stats.childCategories.skipped} skipped`);
    
    return stats;
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
    throw error;
  }
};

// Run standalone
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("📦 Connected to MongoDB");
      await seedCategories();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedCategories;
