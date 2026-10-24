import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

export const getSpots = (params = {}) => api.get("/spots", { params }).then((r) => r.data);
export const getSpot = (id) => api.get(`/spots/${id}`).then((r) => r.data.data);
export const createSpot = (payload) => api.post("/spots", payload).then((r) => r.data.data);
export const updateSpot = (id, payload) => api.put(`/spots/${id}`, payload).then((r) => r.data.data);
export const deleteSpot = (id) => api.delete(`/spots/${id}`);
export const addCondition = (payload) => api.post("/conditions", payload).then((r) => r.data);
