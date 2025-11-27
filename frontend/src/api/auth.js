// authApi.js
import { axiosInstance } from "../lib/axios";

// Note: axiosInstance already has baseURL="/api" so we only need "/auth"
const BASE_URL = "/auth";

/**
 * Register user
 */
export const signup = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/register/`, {
    email: data.email,
    password: data.password,
    name: data.name || data.fullName,
    phone: data.phone,
  });
  return response.data;
};

/**
 * Login user
 */
export const login = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/login/`, data);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await axiosInstance.post(`${BASE_URL}/logout/`);
  return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/`);
  return response.data.user;
};

/**
 * Update user profile
 */
export const updateProfile = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/profile/`, data);
  return response.data.user;
};

