import { http, getWithRetry } from "./httpClient";

// Endpoint data pantai dan log kondisi harian.
export const getSpots = (params = {}) => getWithRetry("/spots", { params }).then((r) => r.data);
export const getSpot = (id) => getWithRetry(`/spots/${id}`).then((r) => r.data.data);
export const createSpot = (payload) => http.post("/spots", payload).then((r) => r.data.data);
export const updateSpot = (id, payload) => http.put(`/spots/${id}`, payload).then((r) => r.data.data);
export const deleteSpot = (id) => http.delete(`/spots/${id}`);
export const addCondition = (payload) => http.post("/conditions", payload).then((r) => r.data);
