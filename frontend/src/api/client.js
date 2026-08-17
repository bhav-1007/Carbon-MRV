import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("carbon_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.error?.message || error?.message || fallback;
}

export function getApiOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "http://localhost:5000";
  }
}

export function getFileUrl(path) {
  if (!path) return "#";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getApiOrigin()}${path}`;
}
