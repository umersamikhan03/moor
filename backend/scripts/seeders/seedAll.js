/**
 * Seed All - Main Seeder Runner
 * Runs all seeders in the correct order with idempotent logic
 * 
 * Usage:
 *   npm run seed          - Seed all data
 *   npm run seed:sizes    - Seed only sizes
 *   npm run seed:flags    - Seed only flags
 *   npm run seed:categories - Seed only categories
 *   npm run seed:products - Seed only products
 *   npm run seed:carousel - Seed only carousel
 *   npm run seed:info     - Seed only general info
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

// Import all seeders
const seedSizes = require("./seedSizes");
const seedFlags = require("./seedFlags");
const seedCategories = require("./seedCategories");
const seedProducts = require("./seedProducts");
const seedCarousel = require("./seedCarousel");
const seedGeneralInfo = require("./seedGeneralInfo");

const printBanner = () => {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                                                              ║");
  console.log("║   🌿 SAPPHIRE E-COMMERCE DATABASE SEEDER                     ║");
  console.log("║                                                              ║");
  console.log("║   Data sourced from: pk.sapphireonline.pk                    ║");
  console.log("║   Idempotent: Safe to run multiple times                     ║");
  console.log("║                                                              ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("\n");
};

const printSummary = (results) => {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    📊 SEEDING COMPLETE                       ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [name, stats] of Object.entries(results)) {
    if (typeof stats === 'object') {
      if (stats.created !== undefined) {
        totalCreated += stats.created;
        totalSkipped += stats.skipped || 0;
        const created = String(stats.created).padStart(3);
        const skipped = String(stats.skipped || 0).padStart(3);
        console.log(`║   ${name.padEnd(20)} Created: ${created}  Skipped: ${skipped}      ║`);
      } else {
        // Nested stats (like categories)
        for (const [subName, subStats] of Object.entries(stats)) {
          totalCreated += subStats.created || 0;
          totalSkipped += subStats.skipped || 0;
        }
      }
    }
  }

  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║   TOTAL                Created: ${String(totalCreated).padStart(3)}  Skipped: ${String(totalSkipped).padStart(3)}      ║`);
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("\n");
};

const seedAll = async () => {
  printBanner();
  
  const results = {};

  try {
    // 1. Seed Sizes (required for product variants)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    results.Sizes = await seedSizes();

    // 2. Seed Flags (required for product flags)
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    results.Flags = await seedFlags();

    // 3. Seed Categories (required for products)
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const categoryStats = await seedCategories();
    results.Categories = categoryStats.categories;
    results.SubCategories = categoryStats.subCategories;
    results.ChildCategories = categoryStats.childCategories;

    // 4. Seed Products
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    results.Products = await seedProducts();

    // 5. Seed Carousel
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    results.Carousel = await seedCarousel();

    // 6. Seed General Info
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    results.GeneralInfo = await seedGeneralInfo();

    printSummary(results);

    return results;
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    throw error;
  }
};

// Run the seeder
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("📦 Connected to MongoDB");
    await seedAll();
    console.log("✅ All seeding completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
