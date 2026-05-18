import api from './api';

/**
 * Fetch all orders assigned to a specific rider.
 * Endpoint: GET /riders/orders/{riderId}
 */
export async function getRiderOrders(riderId, { page = 1, size = 10 } = {}) {
  const pageParam = Math.max(0, page - 1);
  const response = await api.get(`/riders/orders/${riderId}`, {
    params: {
      page: pageParam,
      size
    }
  });
  return response.data;
}

/**
 * Update delivery status for an order by a rider.
 * Endpoint: PUT /riders/status/{orderId}?riderId={riderId}
 * Payload: { status }
 */
export async function updateDeliveryStatus(orderId, status, riderId) {
  const response = await api.put(`/riders/status/${orderId}`, { status }, {
    params: { riderId }
  });
  return response.data;
}

/**
 * Fetch rider profile details by their user ID.
 * Endpoint: GET /riders/{id}
 */
export async function getRiderById(id) {
  const response = await api.get(`/riders/${id}`);
  return response.data;
}

/**
 * Fetch all registered riders in the system.
 * Endpoint: GET /riders
 */
export async function getAllRiders({ page = 1, size = 10 } = {}) {
  const pageParam = Math.max(0, page - 1);
  const response = await api.get('/riders', {
    params: {
      page: pageParam,
      size
    }
  });
  return response.data;
}
