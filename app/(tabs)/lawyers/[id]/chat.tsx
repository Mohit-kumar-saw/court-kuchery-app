import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { lawyerService } from "@/services/lawyerService";
import { consultService } from "@/services/consultService";
import { initializeSocket, getSocket } from "@/services/socket";
import { AppColors } from "@/constants/theme";

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  isOnline: boolean;
  profileImage?: string;
};

type Message = {
  id: string;
  type: "message";
  text: string;
  sender: "me" | "lawyer";
  timestamp: Date;
};

export default function ChatScreen() {
  const { id, sessionId } = useLocalSearchParams<{
    id: string;
    sessionId?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatItems, setChatItems] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  const [summaryVisible, setSummaryVisible] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(true);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionId ?? null
  );

  /* ================= FETCH LAWYER ================= */

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        if (!id) return;

        const res = await lawyerService.getLawyerById(id);
        setLawyer(res.lawyer);

        const welcomeMsg: Message = {
          id: "1",
          type: "message",
          text: `Hi! I'm ${res.lawyer.name}. How can I help you with your legal matter today?`,
          sender: "lawyer",
          timestamp: new Date(),
        };

        setChatItems([welcomeMsg]);
      } catch (error) {
        console.log("CHAT LAWYER ERROR", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyer();
  }, [id]);

  /* ================= INIT & JOIN SOCKET ================= */

  useEffect(() => {
    let socketInstance: any;

    const setupSocket = async () => {
      try {
        socketInstance = await initializeSocket();

        if (!socketInstance) {
          console.log("❌ Socket init failed");
          return;
        }

        console.log("🟢 Socket Connected ID:", socketInstance.id);

        // 1. Remove old listeners
        socketInstance.off("RECEIVE_MESSAGE");
        socketInstance.off("SESSION_FORCE_ENDED");
        socketInstance.off("SESSION_ENDED");

        // 2. Add Listeners
        socketInstance.on("RECEIVE_MESSAGE", (msg: any) => {
          setChatItems((prev) => [
            ...prev,
            {
              id: msg._id,
              type: "message",
              text: msg.content,
              sender: msg.senderRole === "USER" ? "me" : "lawyer",
              timestamp: new Date(msg.createdAt),
            },
          ]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });

        socketInstance.on("SESSION_FORCE_ENDED", (data: any) => {
          console.log("⚠️ SESSION FORCE ENDED", data);
          setSessionActive(false);
          setSummary(data);
          setSummaryVisible(true);
          setActiveSessionId(null);
        });

        socketInstance.on("SESSION_ENDED", (data: any) => {
          console.log("ℹ️ SESSION ENDED", data);
          setSessionActive(false);
          setSummary(data);
          setSummaryVisible(true);
          setActiveSessionId(null);
        });

        // 3. Join Room (Only if we have a session ID)
        if (activeSessionId) {
          console.log("📌 Joining Session Room:", activeSessionId);
          socketInstance.emit("JOIN_SESSION", { sessionId: activeSessionId });
        }

      } catch (err) {
        console.error("Socket Setup Error:", err);
      }
    };

    setupSocket();

    // Cleanup
    return () => {
      if (socketInstance) {
        console.log("🧹 Cleaning up socket listeners");
        socketInstance.off("RECEIVE_MESSAGE");
        socketInstance.off("SESSION_FORCE_ENDED");
        socketInstance.off("SESSION_ENDED");

        if (activeSessionId) {
          console.log("� Leaving Session Room:", activeSessionId);
          socketInstance.emit("LEAVE_SESSION", { sessionId: activeSessionId });
        }
      }
    };
  }, [activeSessionId]); // Re-run if sessionId changes

  // Remove the separate JOIN ROOM useEffect as it's now merged above
  /* ================= JOIN ROOM (REMOVED - MERGED ABOVE) ================= */

  /* ================= SYNC SESSION ================= */

  useEffect(() => {
    if (sessionId) {
      setActiveSessionId(sessionId);
      setSessionActive(true);
    }
  }, [sessionId]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !activeSessionId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("SEND_MESSAGE", {
      sessionId: activeSessionId,
      content: inputText,
      messageType: "TEXT",
    });

    setInputText("");
  }, [inputText, activeSessionId]);

  /* ================= END CONSULT ================= */

  const handleEndConsult = async () => {
    if (!activeSessionId) return;

    try {
      const res = await consultService.endSession(activeSessionId);

      setSessionActive(false);
      setSummary(res);
      setSummaryVisible(true);
      setActiveSessionId(null);
    } catch (err) {
      console.log("END ERROR", err);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={styles.center}>
        <Text>Lawyer not found</Text>
      </View>
    );
  }

  const safeLawyer = lawyer;

  /* ================= UI (UNCHANGED) ================= */

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <View style={styles.headerCenter}>
          {safeLawyer.profileImage ? (
            <Image
              source={{ uri: safeLawyer.profileImage }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarText}>
                {safeLawyer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{safeLawyer.name}</Text>
            <Text style={styles.headerStatus}>
              {safeLawyer.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {activeSessionId && (
          <Pressable onPress={handleEndConsult} style={styles.headerIconBtn}>
            <Ionicons name="stop-circle" size={22} color="#ff4d4f" />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={chatItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubbleWrapper,
                item.sender === "me"
                  ? styles.bubbleRight
                  : styles.bubbleLeft,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.sender === "me"
                    ? styles.bubbleMe
                    : styles.bubbleThem,
                ]}
              >
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={sessionActive}
          />

          <Pressable onPress={sendMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {summaryVisible && summary && (
        <View style={styles.summaryOverlay}>
          <View style={styles.summaryModal}>
            <Text style={styles.summaryTitle}>Consultation Summary</Text>

            <Text>Consult Fee: ₹{summary.totalAmount}</Text>
            <Text>Remaining Balance: ₹{summary.remainingBalance}</Text>
            <Text>Platform Commission: ₹{summary.commission}</Text>
            <Text>Lawyer Earned: ₹{summary.lawyerEarning}</Text>

            <Pressable
              style={styles.summaryBtn}
              onPress={() => {
                setSummaryVisible(false);
                router.back();
              }}
            >
              <Text style={{ color: "#fff" }}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}


/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e5ddd5" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: "#2762ea",
  },

  headerBtn: { padding: 8 },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "orange",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  headerInfo: { flex: 1 },
  headerName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  headerStatus: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: { flexDirection: "row" },
  headerIconBtn: { padding: 8 },

  keyboardView: { flex: 1 },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },

  bubbleWrapper: { marginBottom: 6, maxWidth: "80%" },
  bubbleLeft: { alignSelf: "flex-start" },
  bubbleRight: { alignSelf: "flex-end" },

  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  bubbleMe: {
    backgroundColor: "#e3efff",
    borderTopRightRadius: 4,
  },

  bubbleThem: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 4,
  },

  bubbleText: { fontSize: 15 },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f0f2f5",
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingLeft: 20,
    paddingTop: 10,
    maxHeight: 100,
    fontSize: 15,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2762ea",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  summaryOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  summaryModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  summaryBtn: {
    marginTop: 20,
    backgroundColor: "#2762ea",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
