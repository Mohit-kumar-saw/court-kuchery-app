import { api } from './api';
import { tokenStorage } from './tokenStorage';
import type { LoginCredentials, SignUpCredentials } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);

    const { accessToken, refreshToken, user } = response.data;

    await tokenStorage.setTokens(accessToken, refreshToken);

    return user;
  },

  async signUp(credentials: SignUpCredentials) {
    const response = await api.post('/auth/register', credentials);

    const { accessToken, refreshToken, user } = response.data;

    await tokenStorage.setTokens(accessToken, refreshToken);

    return user;
  },

  async logout() {
    await tokenStorage.clear();
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },
};
