import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.SERVER,
  withCredentials: true, // CRITICAL: This allows Axios to send and receive HTTP-Only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;