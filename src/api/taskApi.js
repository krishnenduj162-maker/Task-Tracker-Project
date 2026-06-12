import axios from "axios";

const BASE_URL = "https://task-tracker-project-production-e42c.up.railway.app/tasks";
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

export const getAiPriority = (task) => {
  return axios.post(`${BASE_URL}/ai-priority`, {
    task: task,
  });
};