import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } else {
      await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
    }
  },

  async getAccessToken() {
    if (Platform.OS === 'web') {
      return localStorage.getItem(ACCESS_KEY);
    }
    return SecureStore.getItemAsync(ACCESS_KEY);
  },

  async getRefreshToken() {
    if (Platform.OS === 'web') {
      return localStorage.getItem(REFRESH_KEY);
    }
    return SecureStore.getItemAsync(REFRESH_KEY);
  },

  async clear() {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
    }
  },

  async setActiveSessionData(data: string) {
    const key = 'active_session_data';
    if (Platform.OS === 'web') {
      localStorage.setItem(key, data);
    } else {
      await SecureStore.setItemAsync(key, data);
    }
  },

  async getActiveSessionData() {
    const key = 'active_session_data';
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },

  async clearActiveSessionData() {
    const key = 'active_session_data';
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};
