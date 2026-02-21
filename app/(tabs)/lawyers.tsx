import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { lawyerService } from "@/services/lawyerService";

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  ratePerMinute: number;
  rating: number;
  totalReviews?: number;
  isOnline: boolean;
  profileImage?: string;
};

export default function LawyersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  const [activePill, setActivePill] =
    useState<"All" | "Family" | "Criminal" | "Cyber">("All");

  useEffect(() => {
    if (params.category) {
      const cat = params.category as string;
      // Map "Family" -> "Family", etc.
      if (["Family", "Criminal", "Cyber"].includes(cat)) {
        setActivePill(cat as any);
      }
    }
  }, [params.category]);

  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    onlineOnly: false,
    sort: "rating",
  });

  /* ================= FETCH LAWYERS ================= */

  const fetchLawyers = async () => {
    try {
      setLoading(true);

      const response = await lawyerService.getLawyers({
        specialization:
          activePill === "All" ? undefined : activePill,
        sort: filters.sort,
        minPrice: filters.minPrice
          ? Number(filters.minPrice)
          : undefined,
        maxPrice: filters.maxPrice
          ? Number(filters.maxPrice)
          : undefined,
        onlineOnly: filters.onlineOnly,
        page: 1,
        limit: 20,
      });

      setLawyers(response.lawyers);
    } catch (error) {
      console.log("FETCH LAWYERS ERROR", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [activePill]);

  /* ================= RENDER ================= */

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.webWrapper}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2F5BEA"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={lawyers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.pillsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsContainer}
                >
                  {/* FILTER ICON */}
                  <Pressable
                    style={styles.filterPill}
                    onPress={() => setShowFilter(true)}
                  >
                    <Ionicons
                      name="options-outline"
                      size={18}
                      color="#2F5BEA"
                    />
                  </Pressable>

                  {["All", "Family", "Criminal", "Cyber"].map(
                    (pill) => {
                      const isActive =
                        activePill === pill;

                      return (
                        <Pressable
                          key={pill}
                          onPress={() =>
                            setActivePill(
                              pill as any
                            )
                          }
                          style={[
                            styles.pill,
                            isActive
                              ? styles.pillActive
                              : styles.pillInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pillText,
                              isActive
                                ? styles.pillTextActive
                                : styles.pillTextInactive,
                            ]}
                          >
                            {pill} Lawyer
                          </Text>
                        </Pressable>
                      );
                    }
                  )}
                </ScrollView>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push(
                    `/lawyers/${item._id}`
                  )
                }
                style={styles.card}
              >
                {/* Avatar */}
                {item.profileImage ? (
                  <Image
                    source={{
                      uri: item.profileImage,
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>
                      {item.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Text>
                  </View>
                )}

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {item.name}
                  </Text>
                  <Text style={styles.specialty}>
                    {item.specialization} Lawyer
                  </Text>
                  <Text style={styles.experience}>
                    Exp –{" "}
                    {item.experienceYears} Years
                  </Text>

                  <View style={styles.ratingRow}>
                    {Array.from({
                      length: 5,
                    }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={
                          i < Math.round(item.rating)
                            ? "star"
                            : "star-outline"
                        }
                        size={14}
                        color="#F4B400"
                      />
                    ))}
                    <Text style={styles.reviewCount}>
                      ({item.totalReviews || 0})
                    </Text>
                  </View>
                </View>

                {/* Right */}
                <View style={styles.right}>
                  <Text style={styles.rate}>
                    ₹{item.ratePerMinute}/min
                  </Text>

                  {item.isOnline && (
                    <Text style={styles.online}>
                      ● Online
                    </Text>
                  )}
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      {/* ================= ADVANCED FILTER ================= */}

      {showFilter && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Advanced Filter
            </Text>

            <Text style={styles.label}>
              Min Price
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={filters.minPrice}
              onChangeText={(text) =>
                setFilters({
                  ...filters,
                  minPrice: text,
                })
              }
              placeholder="₹ 0"
            />

            <Text style={styles.label}>
              Max Price
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={filters.maxPrice}
              onChangeText={(text) =>
                setFilters({
                  ...filters,
                  maxPrice: text,
                })
              }
              placeholder="₹ 50"
            />

            <Pressable
              style={styles.checkboxRow}
              onPress={() =>
                setFilters({
                  ...filters,
                  onlineOnly:
                    !filters.onlineOnly,
                })
              }
            >
              <Ionicons
                name={
                  filters.onlineOnly
                    ? "checkbox"
                    : "square-outline"
                }
                size={22}
                color="#2F5BEA"
              />
              <Text>
                Online Only
              </Text>
            </Pressable>

            <Text style={styles.label}>
              Sort By
            </Text>

            {[
              {
                label: "Rating",
                value: "rating",
              },
              {
                label: "Low Price",
                value: "price_low",
              },
              {
                label: "High Price",
                value: "price_high",
              },
              {
                label: "Experience",
                value: "experience",
              },
            ].map((item) => (
              <Pressable
                key={item.value}
                style={styles.sortRow}
                onPress={() =>
                  setFilters({
                    ...filters,
                    sort: item.value,
                  })
                }
              >
                <Text>
                  {item.label}
                </Text>
                {filters.sort ===
                  item.value && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#2F5BEA"
                    />
                  )}
              </Pressable>
            ))}

            <View
              style={styles.modalButtons}
            >
              <Pressable
                onPress={() =>
                  setShowFilter(false)
                }
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.applyBtn}
                onPress={() => {
                  setShowFilter(false);
                  fetchLawyers();
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                  }}
                >
                  Apply
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F7FF",
  },

  webWrapper: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth:
      Platform.OS === "web"
        ? 420
        : "100%",
  },

  pillsWrapper: {
    paddingBottom: 8,
  },

  pillsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    alignItems: "center",
  },

  filterPill: {
    width: 44,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#2F5BEA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  pill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
  },

  pillActive: {
    backgroundColor: "#2F5BEA",
    borderColor: "#2F5BEA",
  },

  pillInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#2F5BEA",
  },

  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },

  pillTextActive: {
    color: "#FFFFFF",
  },

  pillTextInactive: {
    color: "#2F5BEA",
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#EAF0FF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },

  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2F5BEA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  info: { flex: 1 },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  specialty: {
    fontSize: 14,
    color: "#2563EB",
    marginTop: 2,
  },

  experience: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  ratingRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 2,
    alignItems: "center",
  },

  reviewCount: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
  },

  right: {
    alignItems: "flex-end",
  },

  rate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  online: {
    marginTop: 4,
    color: "green",
    fontSize: 12,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },

  label: { marginTop: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },

  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  applyBtn: {
    backgroundColor: "#2F5BEA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
