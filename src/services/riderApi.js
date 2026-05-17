import api from './api';

export async function getRiderProfile(id) {
  const response = await api.get(`/riders/${id}`);
  return response.data;
}

export async function getRiderOrders(riderId, page = 0, size = 10) {
  const response = await api.get(`/riders/orders/${riderId}?page=${page}&size=${size}`);
  return response.data;
}

export async function updateDeliveryStatus(orderId, riderId, status) {
  const response = await api.put(`/riders/status/${orderId}?riderId=${riderId}`, { status });
  return response.data;
}
