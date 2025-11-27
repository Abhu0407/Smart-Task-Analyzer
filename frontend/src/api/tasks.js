import { axiosInstance } from "../lib/axios";

const BASE_URL = "/tasks";

/**
 * Get all tasks
 */
export const getAllTasks = async () => {
  const response = await axiosInstance.get(BASE_URL);
  return response.data;
};

/**
 * Get incomplete tasks (pending tasks)
 */
export const getIncompleteTasks = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/pending/`);
  return response.data;
};

/**
 * Get completed tasks
 */
export const getCompletedTasks = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/completed/`);
  return response.data;
};

/**
 * Get circular tasks
 */
export const getCircularTasks = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/circular/`);
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (taskData) => {
  const response = await axiosInstance.post(`${BASE_URL}/`, taskData);
  return response.data;
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId) => {
  const response = await axiosInstance.delete(`${BASE_URL}/delete/${taskId}/`);
  return response.data;
};

/**
 * Mark task as completed/incomplete
 */
export const toggleTaskCompleted = async (taskId) => {
  const response = await axiosInstance.post(`${BASE_URL}/toggle/${taskId}/`);
  return response.data;
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (taskId) => {
  const response = await axiosInstance.get(`${BASE_URL}/`);
  const tasks = response.data;
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error("Task not found");
  }
  return task;
};

/**
 * Update a task
 */
export const updateTask = async (taskId, taskData) => {
  const response = await axiosInstance.put(`${BASE_URL}/update/${taskId}/`, taskData);
  return response.data;
};

