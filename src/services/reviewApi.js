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
 * Fetch reviews for a specific product.
 * Endpoint: GET /reviews/product/{productId}
 */
export async function getReviewsByProduct(productId) {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
}
