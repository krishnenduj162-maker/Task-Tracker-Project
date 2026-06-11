import axios from "axios";

const BASE_URL = "https://your-backend.up.railway.app";
// GET all tasks
export const getTasks = () => {
  return axios.get(`${BASE_URL}/tasks`);
};

// CREATE task
export const createTask = (task) => {
  return axios.post(`${BASE_URL}/tasks`, task);
};

// DELETE task
export const deleteTaskApi = (id) => {
  return axios.delete(`${BASE_URL}/tasks/${id}`);
};

// UPDATE task
export const updateTaskApi = (id, task) => {
  return axios.put(`${BASE_URL}/tasks/${id}`, task);
};

// AI Priority Suggestion
export const getAiPriority = (task) => {
  return axios.post(`${BASE_URL}/ai-priority`, {
    task: task,
  });
};