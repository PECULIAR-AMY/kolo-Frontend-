// If TypeScript can't find axios types in this environment, provide a minimal
// ambient declaration to avoid the "Cannot find module 'axios'" error.
// Remove this declaration once @types/axios or axios' built-in types are available.
declare module "axios";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;