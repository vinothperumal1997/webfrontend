import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import TokenService from './tokenService';

const API_URL = 'https://websocketbackend.vercel.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

const addTokenToRequest = (config: InternalAxiosRequestConfig) => {
  const token = TokenService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addTokenToRequest);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If refresh token is missing, logout
    const refreshToken = TokenService.getRefreshToken();
    if (!refreshToken) {
      authService.logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const response = await authService.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        TokenService.setTokens(accessToken, newRefreshToken);
        onTokenRefreshed(accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        authService.logout();
        return Promise.reject(refreshError);
      }
    }

    // If refresh is in progress, wait for new token
    return new Promise(resolve => {
      subscribeTokenRefresh(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(api(originalRequest));
      });
    });
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    TokenService.setTokens(accessToken, refreshToken);
    return { user };
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    return api.post('/auth/refresh', { refreshToken });
  },

  logout: () => {
    TokenService.clearTokens();
    window.location.href = '/login';
  },
};

export default api;