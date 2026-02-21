import { api } from "./api";

type StartSessionResponse = {
  message: string;
  sessionId: string;
  ratePerMinute: number;
  startedAt: string;
};

type EndSessionResponse = {
  message: string;
  totalAmount: number;
  remainingBalance: number;
  commission: number;
  lawyerEarning: number;
};

export const consultService = {
  async startSession(
    lawyerId: string,
    type: "CHAT" | "CALL" = "CHAT"
  ): Promise<StartSessionResponse> {
    const res = await api.post("/consult/start", {
      lawyerId,
      type,
    });

    return res.data;
  },

  async endSession(
    sessionId: string
  ): Promise<EndSessionResponse> {
    const res = await api.post(`/consult/${sessionId}/end`);
    return res.data;
  },

  async getSessionMessages(sessionId: string) {
    const res = await api.get(`/chat/${sessionId}`);
    return res.data;
  },

  async cancelSession(sessionId: string) {
    const res = await api.post(`/consult/cancel/${sessionId}`);
    return res.data;
  },
};
