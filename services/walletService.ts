import { api } from './api';

export const walletService = {
  async getBalance() {
    const response = await api.get('/wallet/balance');
    return response.data; // { balance: number }
  },

  async getTransactions() {
    const response = await api.get('/wallet/transactions');
    return response.data;
  },

  async recharge(amount: number) {
    const response = await api.post('/wallet/recharge', {
      amount,
    });
    return response.data;
  },
};
