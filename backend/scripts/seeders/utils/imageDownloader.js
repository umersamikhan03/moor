/**
 * Image Downloader Utility
 * Downloads images from URLs and saves them to the uploads folder
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const UPLOADS_DIR = path.join(__dirname, "../../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Generate unique filename with timestamp
 * @param {string} extension - File extension (e.g., 'webp', 'jpg')
 * @returns {string} - Unique filename
 */
const generateFilename = (extension = "webp") => {
  return `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
};

/**
 * Download image from URL and save to uploads folder
 * @param {string} url - Image URL to download
 * @param {string} prefix - Optional prefix for the filename
 * @returns {Promise<string|null>} - Saved filename or null if failed
 */
const downloadImage = async (url, prefix = "") => {
  try {
    // Skip if URL is empty or invalid
    if (!url || typeof url !== "string") {
      console.log(`    ⚠️  Invalid URL: ${url}`);
      return null;
    }

    // Make request with timeout and proper headers
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "arraybuffer",
      timeout: 30000, // 30 second timeout
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://pk.sapphireonline.pk/",
      },
    });

    // Check if response is valid image
    const contentType = response.headers["content-type"] || "";
    if (!contentType.includes("image")) {
      console.log(`    ⚠️  Not an image: ${contentType}`);
      return null;
    }

    // Determine extension from content type
    let extension = "webp";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      extension = "jpg";
    } else if (contentType.includes("png")) {
      extension = "png";
    } else if (contentType.includes("gif")) {
      extension = "gif";
    }

    // Generate filename
    const filename = prefix ? `${prefix}_${generateFilename(extension)}` : generateFilename(extension);
    const filepath = path.join(UPLOADS_DIR, filename);

    // Convert to WebP for optimization (optional)
    try {
      const buffer = Buffer.from(response.data);
      const webpFilename = filename.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");
      const webpFilepath = path.join(UPLOADS_DIR, webpFilename);

      await sharp(buffer)
        .webp({ quality: 85 })
        .toFile(webpFilepath);

      return webpFilename;
    } catch (sharpError) {
      // If sharp fails, save original
      fs.writeFileSync(filepath, response.data);
      return filename;
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.log(`    ⚠️  Timeout downloading image`);
    } else if (error.response) {
      console.log(`    ⚠️  HTTP ${error.response.status} downloading image`);
    } else {
      console.log(`    ⚠️  Error downloading: ${error.message}`);
    }
    return null;
  }
};

/**
 * Download multiple images
 * @param {string[]} urls - Array of image URLs
 * @param {string} prefix - Optional prefix for filenames
 * @returns {Promise<string[]>} - Array of saved filenames
 */
const downloadImages = async (urls, prefix = "") => {
  const filenames = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`    📥 Downloading image ${i + 1}/${urls.length}...`);
    
    const filename = await downloadImage(url, prefix);
    if (filename) {
      filenames.push(filename);
    }

    // Add small delay between downloads to be respectful to server
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return filenames;
};

/**
 * Color palette for product placeholders (Sapphire-inspired)
 */
const PRODUCT_COLORS = [
  { bg: "#1a1a2e", accent: "#e94560", name: "Navy" },
  { bg: "#2d2d44", accent: "#ff6b6b", name: "Dark Blue" },
  { bg: "#6a0572", accent: "#f8a1d1", name: "Plum" },
  { bg: "#0f4c75", accent: "#3fc1c9", name: "Ocean" },
  { bg: "#553939", accent: "#f8b739", name: "Brown" },
  { bg: "#1b4332", accent: "#95d5b2", name: "Forest" },
  { bg: "#240046", accent: "#e0aaff", name: "Purple" },
  { bg: "#370617", accent: "#faa307", name: "Burgundy" },
  { bg: "#2b2d42", accent: "#ef233c", name: "Charcoal" },
  { bg: "#003049", accent: "#fdf0d5", name: "Midnight" },
  { bg: "#582f0e", accent: "#ffe6a7", name: "Coffee" },
  { bg: "#1d3557", accent: "#a8dadc", name: "Slate" },
];

/**
 * Create placeholder image if download fails
 * @param {string} text - Text to display on placeholder
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} colorIndex - Optional color index for consistency
 * @returns {Promise<string>} - Saved filename
 */
const createPlaceholder = async (text = "No Image", width = 600, height = 720, colorIndex = null) => {
  const filename = generateFilename("webp");
  const filepath = path.join(UPLOADS_DIR, filename);

  // Select color based on index or random
  const color = colorIndex !== null 
    ? PRODUCT_COLORS[colorIndex % PRODUCT_COLORS.length] 
    : PRODUCT_COLORS[Math.floor(Math.random() * PRODUCT_COLORS.length)];

  // Escape text for SVG
  const safeText = text.replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;'
  }[c]));

  // Truncate text if too long
  const displayText = safeText.length > 30 ? safeText.substring(0, 27) + "..." : safeText;

  // Create stylish product placeholder with pattern
  const svgBuffer = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color.accent};stop-opacity:0.3" />
        </linearGradient>
        <pattern id="pattern" patternUnits="userSpaceOnUse" width="60" height="60">
          <circle cx="30" cy="30" r="20" fill="${color.accent}" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect width="100%" height="100%" fill="url(#pattern)"/>
      <rect x="40" y="${height - 120}" width="${width - 80}" height="80" fill="rgba(255,255,255,0.15)" rx="10"/>
      <text x="50%" y="${height - 75}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${displayText}</text>
      <text x="50%" y="${height - 50}" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">SAPPHIRE COLLECTION</text>
    </svg>
  `);

  await sharp(svgBuffer).webp({ quality: 85 }).toFile(filepath);
  return filename;
};

module.exports = {
  downloadImage,
  downloadImages,
  createPlaceholder,
  generateFilename,
  UPLOADS_DIR,
  PRODUCT_COLORS,
};
