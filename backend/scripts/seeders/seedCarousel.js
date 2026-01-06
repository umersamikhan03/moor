/**
 * Seed Carousel - Homepage Carousel/Banners
 * Idempotent: Checks for existing entries by heading before inserting
 * Downloads images and stores locally
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const CarouselModel = require("../../models/CarouselModel");
const carouselData = require("./data/carousel.json");
const { downloadImage, createPlaceholder } = require("./utils/imageDownloader");

const seedCarousel = async () => {
  try {
    console.log("🔄 Seeding Carousel/Banners...");
    
    let created = 0;
    let skipped = 0;

    let carouselIndex = 0;
    for (const carousel of carouselData) {
      // Check if carousel already exists by heading (idempotent)
      const existingCarousel = await CarouselModel.findOne({ 
        heading: carousel.heading 
      });
      
      if (existingCarousel) {
        console.log(`  ⏭️  Carousel "${carousel.heading}" already exists, skipping...`);
        skipped++;
        carouselIndex++;
        continue;
      }

      // Download or create placeholder image
      console.log(`  📷 Processing image for "${carousel.heading}"...`);
      let imageFilename = null;
      
      if (carousel.imgSrc && carousel.imgSrc.startsWith("http")) {
        imageFilename = await downloadImage(carousel.imgSrc, "carousel");
      }
      
      if (!imageFilename) {
        console.log(`    ⚠️  Creating placeholder banner...`);
        imageFilename = await createPlaceholder(carousel.heading, 1920, 600, carouselIndex);
      }

      await CarouselModel.create({
        ...carousel,
        imgSrc: imageFilename
      });
      console.log(`  ✅ Created carousel: ${carousel.heading}`);
      created++;
      carouselIndex++;
    }

    console.log(`\n📊 Carousel Summary: ${created} created, ${skipped} skipped`);
    return { created, skipped };
  } catch (error) {
    console.error("❌ Error seeding carousel:", error.message);
    throw error;
  }
};

// Run standalone
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("📦 Connected to MongoDB");
      await seedCarousel();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = seedCarousel;
