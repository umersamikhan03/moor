/**
 * Seed Sizes - Product Size Options
 * Idempotent: Checks for existing entries before inserting
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const ProductSizeModel = require("../../models/ProductSizeModel");
const sizesData = require("./data/sizes.json");

const seedSizes = async () => {
  try {
    console.log("🔄 Seeding Product Sizes...");
    
    let created = 0;
    let skipped = 0;

    for (const size of sizesData) {
      // Check if size already exists (idempotent)
      const existingSize = await ProductSizeModel.findOne({ name: size.name });
      
      if (existingSize) {
        console.log(`  ⏭️  Size "${size.name}" already exists, skipping...`);
        skipped++;
        continue;
      }

      await ProductSizeModel.create(size);
      console.log(`  ✅ Created size: ${size.name}`);
      created++;
    }

    console.log(`\n📊 Sizes Summary: ${created} created, ${skipped} skipped`);
    return { created, skipped };
  } catch (error) {
    console.error("❌ Error seeding sizes:", error.message);
    throw error;
  }
};

// Run standalone
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("📦 Connected to MongoDB");
      await seedSizes();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedSizes;
