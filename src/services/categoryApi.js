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

/**
 * Create a new category.
 * Returns ApiResponse<CategoryResponse>
 */
export async function createCategory(data) {
  const response = await api.post('/categories', data);
  return response.data;
}

/**
 * Update an existing category.
 * Returns ApiResponse<CategoryResponse>
 */
export async function updateCategory(id, data) {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
}

/**
 * Delete a category by ID.
 * Returns ApiResponse<Void>
 */
export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}
