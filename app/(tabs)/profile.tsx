import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';

const MENU_ITEMS = [
  { id: 'my-cases', label: 'My Cases', icon: 'document-text-outline', route: ROUTES.TABS.MY_CASES },
  { id: 'chat-history', label: 'Chat History', icon: 'chatbubble-ellipses-outline', route: ROUTES.TABS.CHAT_HISTORY },
  { id: 'wallet', label: 'Wallet', icon: 'wallet-outline', route: ROUTES.TABS.WALLET },
  { id: 'change-password', label: 'Change Password', icon: 'lock-closed-outline', route: ROUTES.TABS.CHANGE_PASSWORD },
  { id: 'about', label: 'About App', icon: 'information-circle-outline', route: ROUTES.TABS.ABOUT },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
     
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email ?? 'user@example.com'}</Text>
        <Text style={styles.phone}>{user?.phone ?? '—'}</Text>
      </View>
      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon as any} size={22} color={AppColors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
          </TouchableOpacity>
        ))}
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
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    padding: 24,
    borderRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: AppColors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  menu: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: AppColors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
    fontWeight: '500',
  },
});
