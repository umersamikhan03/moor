const CarouselService = require("../services/CaroselService");

const createCarousel = async (req, res) => {
  try {
    if (!req.files || !req.files.imgSrc) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const fileName = req.files.imgSrc[0].filename;
    const { heading, subHeading, buttonText, buttonLink } = req.body;
    
    const carouselData = {
      imgSrc: fileName,
      heading: heading || "",
      subHeading: subHeading || "",
      buttonText: buttonText || "",
      buttonLink: buttonLink || "",
    };
    
    const carousel = await CarouselService.createCarousel(carouselData);

    res.status(201).json(carousel);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, subHeading, buttonText, buttonLink } = req.body;
    
    const updateData = {};
    if (heading !== undefined) updateData.heading = heading;
    if (subHeading !== undefined) updateData.subHeading = subHeading;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (buttonLink !== undefined) updateData.buttonLink = buttonLink;
    
    // If new image is uploaded
    if (req.files && req.files.imgSrc) {
      updateData.imgSrc = req.files.imgSrc[0].filename;
    }
    
    const carousel = await CarouselService.updateCarousel(id, updateData);
    
    if (!carousel) {
      return res.status(404).json({ message: "Carousel not found" });
    }
    
    res.status(200).json(carousel);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const getAllCarousel = async (req, res) => {
  try {
    const carousels = await CarouselService.getAllCarousels();
    return res.status(200).json(carousels);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const deleteByIdCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCarousel = await CarouselService.deleteCarousel(id);
    if (!deletedCarousel) {
      return res.status(404).json({ message: "Carousel not found" });
    }
    return res.status(200).json({ message: "Carousel deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCarousel,
  updateCarousel,
  getAllCarousel,
  deleteByIdCarousel,
};
