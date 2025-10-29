// src/utils/api.js
import axios from "axios";

export const BASE_URL = "https://magistory-backend-production.up.railway.app";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

export async function generateVideoScript(config) {
  const res = await api.post("/api/generate", config);
  return res.data.timeline;
}

export async function saveProject(project) {
  const res = await api.post("/api/saveProject", project);
  return res.data;
}