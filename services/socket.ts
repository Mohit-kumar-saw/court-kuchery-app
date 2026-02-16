import { io, Socket } from "socket.io-client";
import { BASE_URL } from "./api";
import { tokenStorage } from "./tokenStorage";

let socket: Socket | null = null;

export const initializeSocket = async () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = await tokenStorage.getAccessToken();

  socket = io(BASE_URL, {
    transports: ["websocket"],
    auth: {
      token, // 🔐 REQUIRED
    },
  });

  socket.on("connect", () => {
    console.log("🟢 Socket Connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket Error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;
