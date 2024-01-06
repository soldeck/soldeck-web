import axios, { AxiosInstance } from "axios";

export const axiosInstance = axios.create({
  headers: {
    "content-type": "application/json;charset=utf-8",
    Accept: "application/json",
  },
  maxRedirects: 0,
  timeout: 5000,
  validateStatus: (status) => {
    return status < 300;
  },
}) as AxiosInstance;
