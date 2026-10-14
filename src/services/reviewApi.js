import api from './api';

/**
 * Submit a new product review.
 * Endpoint: POST /reviews
 */
export async function createReview(data) {
  const response = await api.post('/reviews', data);
  return response.data;
}

/**
 * Fetch paginated reviews for a specific product.
 * Endpoint: GET /reviews/product/{productId}?page=0&size=10&sort=createdAt,desc
 *
 * Backend now returns Page<ReviewResponse>:
 *   { data: { content: [...], totalPages, totalElements, ... } }
 */
export async function getReviewsByProduct(productId, page = 0, size = 10) {
  const response = await api.get(
    `/reviews/product/${productId}?page=${page}&size=${size}&sort=createdAt,desc`
  );
  return response.data;
}

