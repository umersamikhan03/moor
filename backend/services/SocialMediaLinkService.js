const SocialMediaLinkModel = require('../models/SocialMediaLinkModel');

const ALLOWED_SOCIAL_FIELDS = [
  'facebook',
  'twitter',
  'instagram',
  'linkedin',
  'messenger',
  'whatsapp',
  'telegram',
  'youtube',
  'tiktok',
  'pinterest',
  'viber',
];

const pickSocialFields = (socialMedia = {}) =>
  ALLOWED_SOCIAL_FIELDS.reduce((acc, key) => {
    if (socialMedia[key] !== undefined) {
      acc[key] = socialMedia[key];
    }
    return acc;
  }, {});

// Get or initialize the first social media link entry
const getSocialMediaLink = async () => {
  const socialMedia = await SocialMediaLinkModel.findOne().sort({ createdAt: 1 }).select('-updatedAt');
  if (socialMedia) return socialMedia;

  const createdSocialMedia = await SocialMediaLinkModel.create({});
  return createdSocialMedia;
};

// Update the social media link entry
const updateSocialMediaLink = async (socialMedia) => {
  const updatePayload = pickSocialFields(socialMedia);
  if (Object.keys(updatePayload).length === 0) {
    throw new Error('At least one valid social media field is required');
  }

  const existingSocialMedia = await SocialMediaLinkModel.findOne().sort({ createdAt: 1 }).select('_id');
  const filter = existingSocialMedia ? { _id: existingSocialMedia._id } : {};

  const updatedSocialMedia = await SocialMediaLinkModel.findOneAndUpdate(filter, updatePayload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
  }).select('-updatedAt');

  return updatedSocialMedia;
};

module.exports = { getSocialMediaLink, updateSocialMediaLink };
