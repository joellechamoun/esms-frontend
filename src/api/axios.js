import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://esms-backend-wchs.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let sessionExpiredHandled = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest && !sessionExpiredHandled) {
      sessionExpiredHandled = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Your session has expired. Please log in again.");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
