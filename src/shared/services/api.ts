import axios from "axios" ; 

export const API_URL = "https://maverick-manned-freebee.ngrok-free.dev";

export const api = axios.create({
  baseURL: "https://maverick-manned-freebee.ngrok-free.dev",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); 
    if(token) {
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config
})