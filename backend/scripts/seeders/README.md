# 🌿 Sapphire E-Commerce Database Seeder

This seeder populates the database with real product data sourced from [Sapphire Online Pakistan](https://pk.sapphireonline.pk/).

## 📋 Features

- **Idempotent**: Safe to run multiple times - won't create duplicate data
- **Real Data**: Products, categories, and pricing from Sapphire Online
- **Modular**: Run individual seeders or all at once
- **Organized**: Proper category hierarchy with products

## 🚀 Quick Start

### Seed All Data
```bash
cd backend
npm run seed
```

### Individual Seeders
```bash
npm run seed:sizes      # Seed product sizes (XS, S, M, L, XL, etc.)
npm run seed:flags      # Seed product flags (50% OFF, New Arrival, etc.)
npm run seed:categories # Seed categories, subcategories, child categories
npm run seed:products   # Seed products with variants
npm run seed:carousel   # Seed homepage carousel/banners
npm run seed:info       # Seed company general information
```

### Remove All Seeded Data
```bash
npm run unseed
```
> ⚠️ **Warning**: This will delete ALL data from the database!

## 📁 File Structure

```
backend/scripts/seeders/
├── data/
│   ├── sizes.json        # Size options (XS, S, M, L, XL, XXL, Free Size)
│   ├── flags.json        # Product flags (New Arrival, 50% OFF, etc.)
│   ├── categories.json   # Category hierarchy
│   ├── products.json     # 20 sample products with real data
│   ├── carousel.json     # Homepage banners
│   └── generalInfo.json  # Company information
├── seedSizes.js
├── seedFlags.js
├── seedCategories.js
├── seedProducts.js
├── seedCarousel.js
├── seedGeneralInfo.js
├── seedAll.js           # Main runner
├── unseedAll.js         # Database cleanup
└── README.md
```

## 📊 Seeded Data Overview

### Categories
| Category    | SubCategories                          |
|-------------|----------------------------------------|
| Women       | Ready To Wear, Unstitched, Western Wear|
| Men         | Men's Stitched, Men's Unstitched       |
| Accessories | Women's Bags, Women's Footwear, Fragrances|

### Products (20 Items)
- **Shirts**: Embroidered, Solid, Printed styles
- **Bottoms**: Culottes, Shalwars, Trousers
- **Dresses**: Tier Dress, Midi Dress, Tie-Knot Dress
- **Bags**: Top Handle, Shoulder Bags
- **Men's**: Wool Shawls, Cotton Suits

### Sizes
XS, S, M, L, XL, XXL, Free Size

### Flags/Badges
- New Arrival
- 50% OFF
- 30% OFF
- 70% OFF
- Best Seller
- Sold Out
- Online Exclusive
- Winter Sale

## 🔄 Idempotent Logic

The seeder checks for existing data before inserting:

```javascript
// Example: Check by unique identifier
const existingProduct = await ProductModel.findOne({ 
  productCode: product.productCode 
});

if (existingProduct) {
  console.log('Already exists, skipping...');
  continue;
}
```

This means:
- ✅ Run `npm run seed` multiple times safely
- ✅ No duplicate entries will be created
- ✅ Existing data won't be overwritten

## 💰 Pricing Note

All prices are in **PKR (Pakistani Rupees)** as sourced from Sapphire Pakistan.
If you need different currency, update the `products.json` file.

## 🖼️ Images

Product images use CDN URLs from Sapphire's image server:
```
https://pk.sapphireonline.pk/dw/image/v2/BKSB_PRD/...
```

For local development, you may want to:
1. Download images locally
2. Update URLs in `products.json`
3. Or use placeholder images

## ⚠️ Disclaimer

This seeder is for **demonstration and development purposes only**.
Product data is sourced from Sapphire Online for showcase purposes.
Do not use this data for commercial purposes without proper authorization.

## 📝 Adding More Products

To add more products, edit `data/products.json`:

```json
{
  "name": "Your Product Name",
  "productCode": "UNIQUE_CODE_123",
  "shortDesc": "Short description",
  "longDesc": "Detailed description...",
  "categoryName": "Women",
  "subCategoryName": "Ready To Wear",
  "childCategoryName": "Shirts",
  "flagNames": ["New Arrival", "50% OFF"],
  "finalPrice": 5000,
  "finalDiscount": 2500,
  "finalStock": 50,
  "thumbnailImage": "url_to_thumbnail",
  "images": ["url1", "url2"],
  "searchTags": ["tag1", "tag2"],
  "variants": [
    { "sizeName": "S", "stock": 10, "price": 5000, "discount": 2500 }
  ]
}
```

## 🆘 Troubleshooting

### MongoDB Connection Error
Ensure `MONGO_URI` is set in `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/your_database
```

### Category Not Found Error
Run seeders in order or use `npm run seed` to run all:
1. Sizes → 2. Flags → 3. Categories → 4. Products

### Duplicate Key Error
The seeder is idempotent, but if you modified data manually, you might see conflicts. Use `npm run unseed` to clean and re-seed.
