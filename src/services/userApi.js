import api from './api';

/**
 * Update user status (ACTIVE/INACTIVE).
 * Endpoint: PUT /users/{id}/status?status={status}
 */
export async function updateUserStatus(userId, status) {
  const response = await api.put(`/users/${userId}/status?status=${status}`);
  return response.data;
}
