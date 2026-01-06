/**
 * Seed Flags - Product Flags/Badges
 * Idempotent: Checks for existing entries before inserting
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const FlagModel = require("../../models/FlagModel");
const flagsData = require("./data/flags.json");

const seedFlags = async () => {
  try {
    console.log("🔄 Seeding Product Flags...");
    
    let created = 0;
    let skipped = 0;

    for (const flag of flagsData) {
      // Check if flag already exists (idempotent - case insensitive)
      const existingFlag = await FlagModel.findOne({ 
        name: { $regex: new RegExp(`^${flag.name}$`, 'i') }
      });
      
      if (existingFlag) {
        console.log(`  ⏭️  Flag "${flag.name}" already exists, skipping...`);
        skipped++;
        continue;
      }

      await FlagModel.create(flag);
      console.log(`  ✅ Created flag: ${flag.name}`);
      created++;
    }

    console.log(`\n📊 Flags Summary: ${created} created, ${skipped} skipped`);
    return { created, skipped };
  } catch (error) {
    console.error("❌ Error seeding flags:", error.message);
    throw error;
  }
};

// Run standalone
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("📦 Connected to MongoDB");
      await seedFlags();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedFlags;
