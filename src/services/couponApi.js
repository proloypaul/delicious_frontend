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
