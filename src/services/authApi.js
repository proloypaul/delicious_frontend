import api from './api';

/**
 * Register a new customer
 * Payload: { name, email, phone, password, role: 'CUSTOMER' }
 */
export async function registerCustomer(data) {
  const payload = {
    ...data,
    role: 'CUSTOMER',
  };
  const response = await api.post('/auth/register', payload);
  return response.data;
}

/**
 * Register a new admin
 * Payload: { name, email, phone, password, role: 'ADMIN' }
 */
export async function registerAdmin(data) {
  const payload = {
    ...data,
    role: 'ADMIN',
  };
  const response = await api.post('/auth/register', payload);
  return response.data;
}

/**
 * Register a new seller
 * Endpoint: /sellers/register
 * Payload: { name, email, phone, password, storeName, role: 'SELLER' }
 */
export async function registerSeller(data) {
  const payload = {
    ...data,
    role: 'SELLER',
  };
  const response = await api.post('/sellers/register', payload);
  return response.data;
}

/**
 * Register a new rider
 * Endpoint: /riders
 * Payload: { name, email, phone, password, vehicleType, vehicleRegistrationNumber, role: 'RIDER' }
 */
export async function registerRider(data) {
  const payload = {
    ...data,
    role: 'RIDER',
  };
  const response = await api.post('/riders', payload);
  return response.data;
}

/**
 * Login a user (Customer, Seller, Rider, or Admin)
 * Endpoint: /auth/login
 * Payload: { email, password }
 */
export async function loginUser(data) {
  const response = await api.post('/auth/login', data);
  return response.data;
}
