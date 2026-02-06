import type { LoginCredentials, SignUpCredentials, User } from '@/types';

/**
 * Auth service layer - handles auth logic separately from UI state.
 * Replace with real API calls (e.g. fetch, axios) when backend is ready.
 */

const DEMO_USER: User = {
  id: 'demo-1',
  name: 'Nilesh Soni',
  phone: '9876543210',
  email: 'nilesh@example.com',
};

export const authService = {
  async login(_credentials: LoginCredentials): Promise<User> {
    // Dummy: always return demo user. Replace with:
    // const res = await api.post('/auth/login', credentials);
    // return res.data.user;
    return DEMO_USER;
  },

  async signUp(credentials: SignUpCredentials): Promise<User> {
    // Dummy: create user from form. Replace with API call.
    return {
      id: Date.now().toString(),
      name: credentials.name,
      phone: credentials.phone,
      email: credentials.email,
    };
  },

  logout(): void {
    // Dummy: no-op. Replace with: clear tokens, invalidate session.
  },
};
