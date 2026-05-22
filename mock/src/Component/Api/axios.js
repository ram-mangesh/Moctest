import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8089/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔐 Automatically attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  res => res,
  error => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
  
export default api;