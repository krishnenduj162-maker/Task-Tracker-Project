console.log("TASK API LOADED");

import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export const getTasks = () => {
  return axios.get(`${BASE_URL}/tasks`);
};

export const createTask = (task) => {
  return axios.post(`${BASE_URL}/tasks`, task);
};

export const deleteTaskApi = (id) => {
  return axios.delete(`${BASE_URL}/tasks/${id}`);
};

export const updateTaskApi = (id, task) => {
  return axios.put(`${BASE_URL}/tasks/${id}`, task);
};