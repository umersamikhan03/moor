const mongoose = require("mongoose");

const DataSchema = mongoose.Schema(
  {
    imgSrc: { type: String, required: true },
    heading: { type: String, default: "" },
    subHeading: { type: String, default: "" },
    buttonText: { type: String, default: "" },
    buttonLink: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CarouselModel = mongoose.model("Carousel", DataSchema);

module.exports = CarouselModel;
