import api from './api';

export async function getCustomerProfile(userId) {
  const response = await api.get(`/customers/profile?userId=${userId}`);
  return response.data;
}

export async function updateCustomerProfile(userId, data) {
  const response = await api.put(`/customers/profile?userId=${userId}`, data);
  return response.data;
}
