/**
 * Seed General Info - Company Information
 * Idempotent: Only creates if no general info exists, or updates existing
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const GeneralInfoModel = require("../../models/GeneralInfoModel");
const generalInfoData = require("./data/generalInfo.json");

const seedGeneralInfo = async () => {
  try {
    console.log("🔄 Seeding General Info...");
    
    // Check if general info already exists (idempotent)
    const existingInfo = await GeneralInfoModel.findOne({});
    
    if (existingInfo) {
      console.log(`  ⏭️  General Info already exists, skipping...`);
      console.log(`\n📊 General Info Summary: 0 created, 1 skipped`);
      return { created: 0, skipped: 1 };
    }

    await GeneralInfoModel.create(generalInfoData);
    console.log(`  ✅ Created General Info for: ${generalInfoData.CompanyName}`);

    console.log(`\n📊 General Info Summary: 1 created, 0 skipped`);
    return { created: 1, skipped: 0 };
  } catch (error) {
    console.error("❌ Error seeding general info:", error.message);
    throw error;
  }
};

// Run standalone
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("📦 Connected to MongoDB");
      await seedGeneralInfo();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedGeneralInfo;
