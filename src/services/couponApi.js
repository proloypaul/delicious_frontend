import api from './api';

/**
 * Validate a promotional coupon code against backend Coupon API
 * @param {string} code - The promo code
 * @param {number} orderAmount - Current cart subtotal
 * @returns {Promise<object>} API response with valid status and discount amount
 */
export async function validateCoupon(code, orderAmount = 0) {
  const response = await api.get(`/coupons/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`);
  return response.data;
}

/**
 * Admin: Get paginated list of all coupons
 * Endpoint: GET /coupons?page=0&size=20
 */
export async function getAllCoupons(page = 0, size = 20) {
  const response = await api.get(`/coupons?page=${page}&size=${size}`);
  return response.data;
}

/**
 * Admin: Create a new coupon
 * Endpoint: POST /coupons?code=...&discountAmount=...&minOrderAmount=...
 */
export async function createCoupon(code, discountAmount, minOrderAmount) {
  const response = await api.post(
    `/coupons?code=${encodeURIComponent(code)}&discountAmount=${discountAmount}&minOrderAmount=${minOrderAmount}`
  );
  return response.data;
}

