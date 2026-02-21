import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
} from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';
import { lawyerService } from '@/services/lawyerService';

const DUMMY_LAWYERS = [
  { id: '1', name: 'Amar', rate: '₹13/min', avatar: 'A' },
  { id: '2', name: 'Amrita', rate: '₹08/min', avatar: 'A' },
  { id: '3', name: 'Prerna', rate: '₹12/min', avatar: 'P' },
  { id: '4', name: 'Rake', rate: '₹10/min', avatar: 'R' },
];

const DUMMY_CATEGORIES = [
  { id: '1', title: 'Family Lawyer', icon: 'people' },
  { id: '2', title: 'Criminal Lawyer', icon: 'shield-checkmark' },
  { id: '3', title: 'Corporate Lawyer', icon: 'business' },
  { id: '4', title: 'Property Lawyer', icon: 'home' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loadingLawyers, setLoadingLawyers] = useState(true);

  useEffect(() => {
    const fetchTopLawyers = async () => {
      try {
        const res = await lawyerService.getLawyers({ limit: 6 });
        setLawyers(res.lawyers || []);
      } catch (err) {
        console.error("FETCH TOP LAWYERS ERR", err);
      } finally {
        setLoadingLawyers(false);
      }
    };
    fetchTopLawyers();
  }, []);

  const handleCategoryPress = (category: string) => {
    const pill = category.split(' ')[0]; // Convert "Family Lawyer" to "Family"
    router.push({
      pathname: ROUTES.TABS.LAWYERS,
      params: { category: pill }
    });
  };

  return (
    <View style={styles.container}>


      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <View>
            <Text style={styles.welcomeText}>
              Hi, {user?.name ?? 'User'} 👋
            </Text>
            <Text style={styles.tagline}>Legal Advice, Simplified</Text>
          </View>
          <View style={styles.scaleIcon}>
            <Image source={require('@/assets/court/scale2.png')} style={styles.logo} />
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={AppColors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by lawyer, city or case"
            placeholderTextColor={AppColors.textSecondary}
            editable={false}
          />
          <Ionicons name="mic-outline" size={22} color={AppColors.textSecondary} />
        </View>

        <View style={styles.actionCards}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push(ROUTES.TABS.LAWYERS)}
          >
            <Ionicons name="call" size={28} color={AppColors.primary} />
            <Text style={styles.actionCardText}>Call to Lawyers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => router.push(ROUTES.TABS.LAWYERS)}
          >
            <Ionicons name="chatbubble-ellipses" size={28} color={AppColors.primary} />
            <Text style={styles.actionCardText}>Chat with Lawyers</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lawyers</Text>
            <TouchableOpacity onPress={() => router.push(ROUTES.TABS.LAWYERS)}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          {loadingLawyers ? (
            <ActivityIndicator color={AppColors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {lawyers.map((lawyer) => (
                <TouchableOpacity
                  key={lawyer._id}
                  style={styles.lawyerCard}
                  onPress={() => router.push(`/lawyers/${lawyer._id}`)}
                >
                  <View style={styles.lawyerAvatar}>
                    <Text style={styles.lawyerAvatarText}>
                      {lawyer.name?.charAt(0) || 'L'}
                    </Text>
                  </View>
                  <Text style={styles.lawyerName} numberOfLines={1}>{lawyer.name}</Text>
                  <Text style={styles.lawyerRate}>₹{lawyer.ratePerMinute}/min</Text>
                  <TouchableOpacity
                    style={styles.chatButton}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/lawyers/${lawyer._id}`)}
                  >
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              {lawyers.length === 0 && <Text style={{ color: AppColors.textSecondary }}>No lawyers available</Text>}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => router.push(ROUTES.TABS.LAWYERS)}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {DUMMY_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                activeOpacity={0.8}
                onPress={() => handleCategoryPress(cat.title)}
              >
                <View style={styles.categoryIconWrap}>
                  <Ionicons name={cat.icon as any} size={32} color={AppColors.primary} />
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#ebf2ff',
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  logo: {
    width: 80,
    height: 70,
    borderRadius: 100,
    marginRight: 20,
  },
  scaleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
  },
  actionCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: AppColors.white,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  viewAll: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '500',
  },
  horizontalList: {
    gap: 12,
    paddingRight: 16,
  },
  lawyerCard: {
    width: 140,
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  lawyerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  lawyerAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.primary,
  },
  lawyerName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 2,
  },
  lawyerRate: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  chatButton: {
    backgroundColor: AppColors.success,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.white,
  },
  categoryCard: {
    width: 140,
    height: 140,
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  categoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#b7d2ff",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.text,
    textAlign: 'center',
  },
});
