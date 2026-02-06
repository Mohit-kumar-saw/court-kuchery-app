import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>About App</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoOval}>
            <Ionicons name="scale-outline" size={48} color={AppColors.gold} />
            <View>
              <Text style={styles.logoCourt}>COURT</Text>
              <Text style={styles.logoKutchery}>Kutchery</Text>
            </View>
          </View>
        </View>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.description}>
          COURT Kutchery connects you with verified lawyers for legal advice. Chat or call
          experienced legal experts anytime, anywhere.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
    gap: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  logoSection: {
    marginBottom: 24,
  },
  logoOval: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: AppColors.primary,
    gap: 16,
  },
  logoCourt: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  logoKutchery: {
    fontSize: 18,
    fontStyle: 'italic',
    color: AppColors.primary,
  },
  version: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: AppColors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
});
