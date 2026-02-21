import axios from 'axios';
import { tokenStorage } from './tokenStorage';

export const BASE_URL = 'https://court-kuchery-backend.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Attach Access Token Automatically
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔁 Auto Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await tokenStorage.getRefreshToken();

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        await tokenStorage.setTokens(newAccessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        await tokenStorage.clear();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
