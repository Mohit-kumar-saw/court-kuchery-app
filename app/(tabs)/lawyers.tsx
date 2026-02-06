import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';


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
    <View style={styles.container}>
      {/* Pills Wrapper */}
      <View style={styles.pillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {PILLS.map((pill) => {
            // Filter icon pill
            if (pill.type === 'icon') {
              return (
                <Pressable
                  key="filter"
                  style={styles.filterPill}
                  onPress={() => console.log('Open filters')}
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
                  isActive ? styles.pillActive : styles.pillInactive,
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

      {/* Lawyers List */}
      <FlatList
      
        data={filteredLawyers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
          onPress={() => router.push(`/lawyers/${item.id}`)}
          style={({ pressed }) => [
            styles.card,
            pressed && { opacity: 0.9 },
          ]}
        >
            {/* Left */}
            <Image source={item.image} style={styles.avatar} />

            {/* Center */}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.specialty}>{item.specialty}</Text>
              <Text style={styles.experience}>
                Exp - {item.experience}
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
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FF',
  },

  /* Pills */
  pillsWrapper: {
    backgroundColor: '#F3F7FF',
    paddingBottom: 6,
  },

  pillsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
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
    lineHeight: 18,
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
    paddingTop: 0,
    gap: 14,
    paddingBottom: 20,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#EAF0FF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
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
    justifyContent: 'space-between',
    height: '100%',
  },

  rate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
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


