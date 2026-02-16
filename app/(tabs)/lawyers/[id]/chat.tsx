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
import { reviewService } from "@/services/reviewService";
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

  /* ================= REVIEW SUBMISSION STATE ================= */
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

  /* ================= REVIEW SUBMISSION ================= */

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      setIsSubmittingReview(true);
      await reviewService.createReview(sessionId!, rating, reviewComment);
      alert("Review submitted successfully!");
      setSummaryVisible(false);
      router.back();
    } catch (error: any) {
      console.log("REVIEW ERROR", error);
      alert(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  /* ================= UI (UNCHANGED) ================= */

  return (
    <View style={styles.container}>
      {/* ... Header & Chat List (UNCHANGED) ... */}
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

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Consult Fee:</Text>
              <Text style={styles.summaryValue}>₹{summary.totalAmount?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{Math.ceil((summary.durationSeconds || 0) / 60)} mins</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.rateTitle}>Rate your experience</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#F4B400"
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Write a review (optional)"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />

            <Pressable
              style={styles.summaryBtn}
              onPress={handleSubmitReview}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>Submit Review</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.skipBtn}
              onPress={() => {
                setSummaryVisible(false);
                router.back();
              }}
            >
              <Text style={{ color: "#64748B" }}>Skip</Text>
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
    padding: 24,
    width: "85%",
    alignSelf: 'center',
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { color: "#64748B", fontSize: 15 },
  summaryValue: { fontWeight: "600", fontSize: 15 },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  rateTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },

  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },

  reviewInput: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  summaryBtn: {
    backgroundColor: "#2762ea",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  skipBtn: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
});
