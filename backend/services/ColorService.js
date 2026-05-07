const ColorModel = require('../models/ColorModel');

const ALLOWED_COLOR_FIELDS = ['primaryColor', 'secondaryColor', 'tertiaryColor', 'accentColor'];

const pickColorFields = (colorData = {}) =>
  ALLOWED_COLOR_FIELDS.reduce((acc, key) => {
    if (colorData[key] !== undefined) {
      acc[key] = colorData[key];
    }
    return acc;
  }, {});

// Get or initialize the single color entry
const getColors = async () => {
  const colors = await ColorModel.findOne().sort({ createdAt: 1 }).select('-updatedAt ');
  if (colors) return colors;

  const createdColors = await ColorModel.create({});
  return createdColors;
};

// Update the color entry
const updateColor = async (colorData) => {
  const updatePayload = pickColorFields(colorData);
  if (Object.keys(updatePayload).length === 0) {
    throw new Error('At least one valid color field is required');
  }

  const existingColor = await ColorModel.findOne().sort({ createdAt: 1 }).select('_id');
  const filter = existingColor ? { _id: existingColor._id } : {};

  const updatedColor = await ColorModel.findOneAndUpdate(filter, updatePayload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
  });
  return updatedColor;
};

module.exports = { getColors, updateColor };
