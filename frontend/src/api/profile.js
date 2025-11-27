import { axiosInstance } from "../lib/axios";

const BASE_URL = "/api/auth";

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/`);
  return response.data.user;
};

/**
 * Update user profile (name, email, phone)
 */
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.post(`${BASE_URL}/profile/`, profileData);
  return response.data.user;
};

