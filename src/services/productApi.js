import api from './api';

/**
 * Fetch all products with optional category-wise filtering and pagination.
 * Spring Boot Pageable is 0-indexed, so we subtract 1 from frontendPage.
 * Returns ApiResponse<Page<ProductResponse>>
 */
export async function getAllProducts({ categoryName = '', page = 1, size = 10 } = {}) {
  const pageParam = Math.max(0, page - 1);
  const params = {
    page: pageParam,
    size,
  };
  
  if (categoryName && categoryName !== 'All') {
    params.categoryName = categoryName;
  }
  
  const response = await api.get('/products', { params });
  return response.data;
}

/**
 * Fetch a single product by its database ID.
 * Returns ApiResponse<ProductResponse>
 */
export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}
