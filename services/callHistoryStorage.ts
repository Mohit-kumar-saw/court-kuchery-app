import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY_PREFIX = "call_history_";

export type CallLog = {
  id: string;
  lawyerId: string;
  type: "voice" | "video";
  duration?: number; // seconds
  timestamp: number;
  initiator: "me" | "lawyer";
  status: "completed" | "missed";
};

async function getStored(lawyerId: string): Promise<CallLog[]> {
  const key = `${KEY_PREFIX}${lawyerId}`;
  try {
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    }
    const raw = await SecureStore.getItemAsync(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setStored(lawyerId: string, logs: CallLog[]): Promise<void> {
  const key = `${KEY_PREFIX}${lawyerId}`;
  if (Platform.OS === "web") {
    localStorage.setItem(key, JSON.stringify(logs));
  } else {
    await SecureStore.setItemAsync(key, JSON.stringify(logs));
  }
}

export const callHistoryStorage = {
  async getCallHistory(lawyerId: string): Promise<CallLog[]> {
    return getStored(lawyerId);
  },

  async addCall(log: Omit<CallLog, "id">): Promise<void> {
    const logs = await getStored(log.lawyerId);
    const newLog: CallLog = {
      ...log,
      id: `call_${Date.now()}`,
    };
    logs.push(newLog);
    await setStored(log.lawyerId, logs);
  },
};
