import axios from 'axios';
import 'dotenv/config';

const VITE_API_URL = process.env.VITE_API_URL;
if (!VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined in your environment variables');
}

// Ensure the API URL ends without a trailing slash for consistency
const apiUrl = VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL;

/**
 * Fetches all items from a paginated API endpoint.
 * @param {string} endpoint - The API endpoint to fetch data from (e.g., '/getAllProducts').
 * @param {string} dataKey - The key in the response that holds the array of items.
 * @returns {Promise<Array>} - A promise that resolves to an array of all items.
 */
async function fetchAllPaginatedData(endpoint, dataKey) {
  let items = [];
  let page = 1;
  const limit = 100; // Fetch 100 items per page
  let hasMore = true;

  while (hasMore) {
    try {
      const { data } = await axios.get(`${apiUrl}${endpoint}`, {
        params: { page, limit },
      });
      
      const fetchedItems = data[dataKey] || [];
      if (fetchedItems.length > 0) {
        items = items.concat(fetchedItems);
        page++;
        if (fetchedItems.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching from ${endpoint} on page ${page}:`, error.message);
      hasMore = false; // Stop fetching on error
    }
  }
  return items;
}

/**
 * Generates all dynamic routes for the sitemap.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of URL paths.
 */
export async function getDynamicRoutes() {
  // Fetch all active products and map them to their URL paths
  const products = await fetchAllPaginatedData('/getAllProducts?isActive=true', 'products');
  const productRoutes = products.map((product) => `/product/${product.slug}`);

  // Fetch all active blogs and map them to their URL paths
  const blogs = await fetchAllPaginatedData('/activeblog', 'data');
  const blogRoutes = blogs.map((blog) => `/blogs/${blog.slug}`);
  
  // Combine all dynamic routes into a single array
  const allDynamicRoutes = [...productRoutes, ...blogRoutes];
  
  return allDynamicRoutes;
}