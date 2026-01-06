const CarouselModel = require("../models/CarouselModel");

// Create Carousel

const createCarousel = async (carouselData) => {
  return await CarouselModel.create(carouselData);
};

// Update Carousel

const updateCarousel = async (id, updateData) => {
  return await CarouselModel.findByIdAndUpdate(id, updateData, { new: true });
};

// Get All Carousel

const getAllCarousels = async () => {
  return await CarouselModel.find();
};

// Delete Carousel

const deleteCarousel = async (id) => {
  return await CarouselModel.findByIdAndDelete(id);
};

module.exports = {
  createCarousel,
  updateCarousel,
  getAllCarousels,
  deleteCarousel,
};
