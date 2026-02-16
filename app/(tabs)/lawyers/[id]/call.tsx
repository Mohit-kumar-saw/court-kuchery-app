import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { callHistoryStorage } from "@/services/callHistoryStorage";
import { lawyerService } from "@/services/lawyerService";
import { AppColors } from "@/constants/theme";

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  isOnline: boolean;
  profileImage?: string;
};

export default function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [callState, setCallState] = useState<"calling" | "in-call" | "ended">("calling");
  const callStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        if (!id) return;
        const res = await lawyerService.getLawyerById(id);
        setLawyer(res.lawyer);
        // Simulate call connecting
        const t = setTimeout(() => {
          setCallState("in-call");
          callStartTimeRef.current = Date.now();
        }, 2000);
        return () => clearTimeout(t);
      } catch (error) {
        console.log("CALL LAWYER ERROR", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [id]);

  const endCall = async () => {
    setCallState("ended");
    if (id && lawyer) {
      const duration = callStartTimeRef.current
        ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        : 0;
      await callHistoryStorage.addCall({
        lawyerId: id,
        type: "voice",
        duration,
        timestamp: Date.now(),
        initiator: "me",
        status: "completed",
      });
    }
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lawyer not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Gradient-like dark background (WhatsApp call style) */}
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {lawyer.profileImage ? (
            <Image
              source={{ uri: lawyer.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {lawyer.name.split(" ").map((n) => n[0]).join("")}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{lawyer.name}</Text>
        <Text style={styles.specialty}>{lawyer.specialization} Lawyer</Text>
        <Text style={styles.status}>
          {callState === "calling" && "Calling..."}
          {callState === "in-call" && "00:00"}
          {callState === "ended" && "Call ended"}
        </Text>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn}>
            <View style={styles.actionCircle}>
              <Ionicons name="mic" size={28} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Mute</Text>
          </Pressable>

          <Pressable style={styles.actionBtn}>
            <View style={styles.actionCircle}>
              <Ionicons name="keypad" size={28} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Keypad</Text>
          </Pressable>

          <Pressable style={styles.actionBtn}>
            <View style={styles.actionCircle}>
              <Ionicons name="volume-high" size={28} color="#fff" />
            </View>
            <Text style={styles.actionLabel}>Speaker</Text>
          </Pressable>
        </View>

        {/* End call button */}
        <Pressable style={styles.endCallBtn} onPress={endCall}>
          <Ionicons name="call" size={32} color="#fff" />
        </Pressable>
        <Text style={styles.endCallLabel}>End Call</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1f17",
  },
  loader: { marginTop: 100 },
  errorText: { color: "#fff", fontSize: 16 },
  backLink: { marginTop: 16, padding: 12 },
  backLinkText: { color: AppColors.primary, fontSize: 16 },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  avatarWrapper: { marginBottom: 24 },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarFallback: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#128c7e",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 48 },

  name: { color: "#fff", fontSize: 28, fontWeight: "700" },
  specialty: { color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 6 },
  status: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    marginTop: 12,
  },

  actions: {
    flexDirection: "row",
    marginTop: 60,
    gap: 40,
  },
  actionBtn: { alignItems: "center" },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8 },

  endCallBtn: {
    marginTop: 50,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#dc3545",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "135deg" }],
  },
  endCallLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 12,
  },
});
