/**
 * Unseed All - Database Cleanup (Optional)
 * Removes all seeded data - USE WITH CAUTION!
 * 
 * Usage:
 *   npm run unseed - Remove all seeded data (requires confirmation)
 *   npm run unseed -- --force - Skip confirmation prompt
 */

const mongoose = require("mongoose");
const path = require("path");
const readline = require("readline");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const ProductModel = require("../../models/ProductModel");
const CategoryModel = require("../../models/CategoryModel");
const SubCategoryModel = require("../../models/SubCategoryModel");
const ChildCategoryModel = require("../../models/ChildCategoryModel");
const ProductSizeModel = require("../../models/ProductSizeModel");
const FlagModel = require("../../models/FlagModel");
const CarouselModel = require("../../models/CarouselModel");
const GeneralInfoModel = require("../../models/GeneralInfoModel");

// Check for --force flag
const isForceMode = process.argv.includes("--force") || process.argv.includes("-f");

const confirmAction = async () => {
  // Skip confirmation in force mode
  if (isForceMode) {
    console.log("\n⚠️  Force mode enabled - skipping confirmation...");
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "\n⚠️  WARNING: This will delete ALL data from the database!\n" +
      "   Type 'yes' to confirm: ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
      }
    );
  });
};

const unseedAll = async () => {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                                                              ║");
  console.log("║   🗑️  DATABASE CLEANUP - UNSEED ALL                          ║");
  console.log("║                                                              ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  const confirmed = await confirmAction();

  if (!confirmed) {
    console.log("\n❌ Operation cancelled.");
    process.exit(0);
  }

  console.log("\n🔄 Removing all data...\n");

  try {
    // Delete in reverse order of dependencies
    const productResult = await ProductModel.deleteMany({});
    console.log(`  🗑️  Deleted ${productResult.deletedCount} products`);

    const childCategoryResult = await ChildCategoryModel.deleteMany({});
    console.log(`  🗑️  Deleted ${childCategoryResult.deletedCount} child categories`);

    const subCategoryResult = await SubCategoryModel.deleteMany({});
    console.log(`  🗑️  Deleted ${subCategoryResult.deletedCount} sub categories`);

    const categoryResult = await CategoryModel.deleteMany({});
    console.log(`  🗑️  Deleted ${categoryResult.deletedCount} categories`);

    const sizeResult = await ProductSizeModel.deleteMany({});
    console.log(`  🗑️  Deleted ${sizeResult.deletedCount} sizes`);

    const flagResult = await FlagModel.deleteMany({});
    console.log(`  🗑️  Deleted ${flagResult.deletedCount} flags`);

    const carouselResult = await CarouselModel.deleteMany({});
    console.log(`  🗑️  Deleted ${carouselResult.deletedCount} carousel items`);

    const generalInfoResult = await GeneralInfoModel.deleteMany({});
    console.log(`  🗑️  Deleted ${generalInfoResult.deletedCount} general info`);

    console.log("\n✅ All data has been removed successfully!");
    
  } catch (error) {
    console.error("\n❌ Unseed failed:", error.message);
    throw error;
  }
};

// Run the unseeder
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("📦 Connected to MongoDB");
    await unseedAll();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
