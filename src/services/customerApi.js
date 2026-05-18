import api from './api';

/**
 * Get all registered customers (Admin mode).
 * Endpoint: GET /customers
 */
export async function getAllCustomers({ page = 1, size = 10 } = {}) {
  // Spring Boot matches 0-based page parameters
  const response = await api.get('/customers', {
    params: {
      page: page - 1,
      size,
    },
  });
  return response.data;
}

/**
 * Get single customer profile.
 * Endpoint: GET /customers/profile?userId={userId}
 */
export async function getCustomerProfile(userId) {
  const response = await api.get('/customers/profile', {
    params: { userId },
  });
  return response.data;
}

/**
 * Update single customer profile details.
 * Endpoint: PUT /customers/profile?userId={userId}
 */
export async function updateCustomerProfile(userId, payload) {
  const response = await api.put('/customers/profile', payload, {
    params: { userId },
  });
  return response.data;
}
