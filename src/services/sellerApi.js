import api from './api';

export async function getSellerProfile(userId) {
  const response = await api.get(`/sellers/profile?userId=${userId}`);
  return response.data;
}

export async function updateSellerProfile(userId, data) {
  const response = await api.put(`/sellers/profile?userId=${userId}`, data);
  return response.data;
}

export async function getSellerProducts(userId, page = 0, size = 10) {
  const response = await api.get(`/sellers/products?userId=${userId}&page=${page}&size=${size}`);
  return response.data;
}
