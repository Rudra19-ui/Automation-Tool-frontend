import axios from "axios";

const baseURL = "/api";

const api = axios.create({
  baseURL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const listWorkflows = () => api.get("/workflows/");
export const getWorkflow = (id) => api.get(`/workflows/${id}/`);
export const createWorkflow = (payload) => api.post("/workflows/", payload);
export const updateWorkflow = (id, payload) => api.put(`/workflows/${id}/`, payload);
export const deleteWorkflow = (id) => api.delete(`/workflows/${id}/`);
export const runWorkflow = (id) => api.post(`/workflows/${id}/run/`);
export const getLogs = (id) => api.get(`/workflows/${id}/logs/`);
export const aiGenerateWorkflow = (prompt) => api.post(`/ai/generate-workflow/`, { prompt });
export const aiNode = (config, input) => api.post(`/ai/node/`, { config, input });

export default api;
