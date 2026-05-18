import api from './api';

/**
 * Create a new order for a customer.
 * Endpoint: POST /orders?customerId={customerId}
 * Payload: { phone, address, discount, items: [{ productId, quantity }] }
 */
export async function createOrder(customerId, data) {
  const response = await api.post('/orders', data, {
    params: { customerId }
  });
  return response.data;
}

/**
 * Fetch all orders for a customer.
 * Endpoint: GET /orders/customer?customerId={customerId}
 */
export async function getOrdersByCustomer(customerId, { page = 1, size = 10 } = {}) {
  const pageParam = Math.max(0, page - 1);
  const response = await api.get('/orders/customer', {
    params: {
      customerId,
      page: pageParam,
      size
    }
  });
  return response.data;
}
