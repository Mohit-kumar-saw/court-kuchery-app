import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const LAWYERS = [
  {
    id: '1',
    name: 'Rakesh Singh',
    specialty: 'Criminal Lawyer',
    experience: '10 Years',
    rate: '₹10/min',
    rating: 4,
    image: require('@/assets/court/lawyer1.jpeg'),
    category: 'Criminal',
  },
  {
    id: '2',
    name: 'Amrita Ghosh',
    specialty: 'Family Lawyer',
    experience: '5 Years',
    rate: '₹08/min',
    rating: 4,
    image: require('@/assets/court/lawyer2.jpeg'),
    category: 'Family',
  },
  {
    id: '3',
    name: 'Sharika Chauhan',
    specialty: 'Cyber Lawyer',
    experience: '7 Years',
    rate: '₹15/min',
    rating: 4,
    image: require('@/assets/court/lawyer3.jpeg'),
    category: 'Cyber',
  },
];

const PILLS = [
  { key: 'filter', type: 'icon' },
  { key: 'All', label: 'All Lawyer' },
  { key: 'Family', label: 'Family Lawyer' },
  { key: 'Criminal', label: 'Criminal Lawyer' },
  { key: 'Cyber', label: 'Cyber Lawyer' },
];

export default function LawyersScreen() {
  const router = useRouter();
  const [activePill, setActivePill] =
    useState<'All' | 'Family' | 'Criminal' | 'Cyber'>('All');

  const filteredLawyers = useMemo(() => {
    if (activePill === 'All') return LAWYERS;
    return LAWYERS.filter((l) => l.category === activePill);
  }, [activePill]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 👇 This wrapper is THE web fix */}
      <View style={styles.webWrapper}>
        <FlatList
          data={filteredLawyers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.pillsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsContainer}
              >
                {PILLS.map((pill) => {
                  if (pill.type === 'icon') {
                    return (
                      <Pressable
                        key="filter"
                        style={styles.filterPill}
                      >
                        <Ionicons
                          name="options-outline"
                          size={18}
                          color="#2F5BEA"
                        />
                      </Pressable>
                    );
                  }

                  const isActive = activePill === pill.key;

                  return (
                    <Pressable
                      key={pill.key}
                      onPress={() => setActivePill(pill.key as any)}
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
                        {pill.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/lawyers/${item.id}`)}
              style={({ pressed, hovered }) => [
                styles.card,
                pressed && { opacity: 0.9 },
                hovered &&
                  Platform.OS === 'web' && {
                    transform: [{ scale: 1.01 }],
                  },
              ]}
            >
              {/* Avatar */}
              <Image source={item.image} style={styles.avatar} />

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.specialty}>{item.specialty}</Text>
                <Text style={styles.experience}>
                  Exp – {item.experience}
                </Text>

                <View style={styles.ratingRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < item.rating ? 'star' : 'star-outline'}
                      size={14}
                      color="#F4B400"
                    />
                  ))}
                </View>
              </View>

              {/* Right */}
              <View style={styles.right}>
                <Text style={styles.rate}>{item.rate}</Text>

                <View style={styles.actions}>
                  <View style={styles.iconBtn}>
                    <Ionicons name="call" size={18} color="#2F5BEA" />
                  </View>
                  <View style={styles.iconBtn}>
                    <Ionicons
                      name="chatbubble-ellipses"
                      size={18}
                      color="#2F5BEA"
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F7FF',
  },

  /* 🔥 WEB FIX */
  webWrapper: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 420 : '100%',
  },

  /* Pills */
  pillsWrapper: {
    paddingBottom: 8,
  },
  pillsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    alignItems: 'center',
  },
  filterPill: {
    width: 44,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#2F5BEA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: '#2F5BEA',
    borderColor: '#2F5BEA',
  },
  pillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#2F5BEA',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: '#2F5BEA',
  },

  /* List */
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#EAF0FF',
    borderRadius: 16,
    padding: Platform.OS === 'web' ? 18 : 14,
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatar: {
    width: Platform.OS === 'web' ? 64 : 56,
    height:Platform.OS === 'web' ? 64 : 56,
    aspectRatio: 1,
    borderRadius: Platform.OS === 'web' ? 32 : 28,
    marginRight: 12,
    overflow: 'hidden',
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },

  specialty: {
    fontSize: 14,
    color: '#2563EB',
    marginTop: 2,
  },

  experience: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  ratingRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 2,
  },

  right: {
    alignItems: 'flex-end',
  },

  rate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
