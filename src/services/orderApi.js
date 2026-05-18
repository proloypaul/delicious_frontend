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

/**
 * Fetch all system orders for admin users.
 * Endpoint: GET /orders
 */
export async function getAllOrders({ page = 1, size = 10 } = {}) {
  const pageParam = Math.max(0, page - 1);
  const response = await api.get('/orders', {
    params: {
      page: pageParam,
      size
    }
  });
  return response.data;
}

/**
 * Fetch a single order detailed break-down by database ID.
 * Endpoint: GET /orders/{id}
 */
export async function getOrderById(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

/**
 * Update system order status.
 * Endpoint: PUT /orders/status
 * Payload: { orderId, status }
 */
export async function updateOrderStatus(orderId, status) {
  const response = await api.put('/orders/status', {
    orderId,
    status
  });
  return response.data;
}
