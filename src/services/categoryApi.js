import api from './api';

/**
 * Fetch all categories with optional pagination.
 * Spring Boot Pageable is 0-indexed.
 * Returns ApiResponse<Page<CategoryResponse>>
 */
export async function getAllCategories(page = 0, size = 20) {
  const response = await api.get('/categories', {
    params: {
      page,
      size,
    },
  });
  return response.data;
}
