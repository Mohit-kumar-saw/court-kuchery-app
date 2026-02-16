import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useEffect, useState } from "react";

import { lawyerService } from "@/services/lawyerService";
import { walletService } from "@/services/walletService";
import { consultService } from "@/services/consultService";

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  ratePerMinute: number;
  rating: number;
  isOnline: boolean;
  bio: string;
};

export default function LawyerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [consultType, setConsultType] = useState<"CHAT" | "CALL">("CHAT");

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  const MIN_BALANCE = 50;

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        if (!id) return;
        const res = await lawyerService.getLawyerById(id);
        setLawyer(res.lawyer);
      } catch (error) {
        console.log("DETAIL ERROR", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyer();
  }, [id]);

  const fetchBalance = async () => {
    try {
      setCheckingBalance(true);
      const res = await walletService.getBalance();
      setWalletBalance(res.balance);
    } catch (err) {
      console.log("BALANCE ERROR", err);
    } finally {
      setCheckingBalance(false);
    }
  };

  const openConsultModal = (type: "CHAT" | "CALL") => {
    setConsultType(type);
    setShowModal(true);
    fetchBalance();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
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

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lawyer Details</Text>
        <Ionicons name="ellipsis-vertical" size={22} color="#2563EB" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <Image
            source={require("@/assets/court/lawyer1.jpeg")}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{lawyer.name}</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: lawyer.isOnline
                      ? "#16A34A"
                      : "#9CA3AF",
                  },
                ]}
              />
            </View>
            <Text style={styles.specialty}>
              {lawyer.specialization} Lawyer
            </Text>
            <Text style={styles.exp}>
              Exp – {lawyer.experienceYears} Years
            </Text>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < lawyer.rating ? "star" : "star-outline"}
                  size={16}
                  color="#F4B400"
                />
              ))}
            </View>
          </View>
        </View>

        {/* STATS ROW */}
        <View style={styles.stats}>
          <Stat icon="chatbubble-ellipses" label="7.5K+ min" />
          <Stat
            icon="time"
            label={`₹${lawyer.ratePerMinute}/min`}
          />
          <Stat icon="hammer" label="250+ Cases Won" />
        </View>

        {/* ABOUT */}
        <Text style={styles.about}>
          {lawyer.bio}...
          <Text style={{ color: "#2563EB" }}> More</Text>
        </Text>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => openConsultModal("CALL")}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.btnText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => openConsultModal("CHAT")}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <Text style={styles.btnText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* CONSULTATION MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Start {consultType === "CHAT" ? "CHAT" : "CALL"} Consultation?
            </Text>

            <Text style={{ marginTop: 8 }}>
              Rate: ₹{lawyer.ratePerMinute}/min
            </Text>

            <Text style={{ marginTop: 8 }}>
              Your Balance: ₹{walletBalance ?? 0}
            </Text>

            {checkingBalance ? (
              <ActivityIndicator
                color="#2563EB"
                style={{ marginTop: 20 }}
              />
            ) : walletBalance !== null &&
              walletBalance < MIN_BALANCE ? (
              <TouchableOpacity
                style={[styles.callBtn, { marginTop: 20 }]}
                onPress={() => {
                  setShowModal(false);
                  router.push("/wallet");
                }}
              >
                <Text style={styles.btnText}>Recharge Wallet</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.chatBtn, { marginTop: 20 }]}
                onPress={async () => {
                  try {
                    const session =
                      await consultService.startSession(
                        lawyer._id
                      );

                    setShowModal(false);

                    router.push(
                      consultType === "CHAT"
                        ? `/lawyers/${lawyer._id}/chat?sessionId=${session.sessionId}`
                        : `/lawyers/${lawyer._id}/call?sessionId=${session.sessionId}`
                    );
                  } catch (error: any) {
                    alert(
                      error?.response?.data?.message ||
                        "Unable to start consultation"
                    );
                  }
                }}
              >
                <Text style={styles.btnText}>
                  Start Consultation
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{ marginTop: 12 }}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: "#64748B" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* STAT COMPONENT */
function Stat({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color="#2563EB" />
      <Text style={styles.statText}>{label}</Text>
    </View>
  );
}

/* STYLES (UNCHANGED UI) */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F7FF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EAF0FF",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#1E3A8A",
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#EAF0FF",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: "700" },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  specialty: { color: "#2563EB", marginTop: 2 },
  exp: { color: "#64748B", marginTop: 2 },
  ratingRow: { flexDirection: "row", gap: 2, marginTop: 6 },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#EAF0FF",
  },
  statItem: { flexDirection: "row", gap: 6, alignItems: "center" },
  statText: { fontSize: 13, color: "#2563EB", fontWeight: "600" },
  about: {
    padding: 16,
    fontSize: 14,
    color: "#0F172A",
    lineHeight: 22,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
  },
  callBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: "#1E40AF",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
});
