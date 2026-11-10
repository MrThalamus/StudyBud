import axios from 'axios'
import { getToken, clearToken } from "./token";

// Create the instance
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
}) 
 
// Add a request interceptor.
client.interceptors.request.use((config) => {
  const token = getToken();
  if (token){
    config.headers.Authorization = `token ${token}`;
  }
  return config;
});

// Add a response interceptor for 401.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export default client;