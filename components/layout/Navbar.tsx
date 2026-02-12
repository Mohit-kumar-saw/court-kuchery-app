import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View ,Image} from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';


type NavbarProps = {
  onMenuPress?: () => void;
};

export function Navbar({ onMenuPress }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress} hitSlop={12}>
        <Ionicons name="menu" size={28} color={AppColors.text} />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
      <Image source={require('@/assets/court/logo2.png')} style={styles.logo} />
      </View>
      <View style={styles.rightRow}>
        <TouchableOpacity style={styles.iconButton} hitSlop={12}>
          <Ionicons name="notifications-outline" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push(ROUTES.TABS.PROFILE)}
          hitSlop={12}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#cadcff",
    paddingTop:40,
  },
  iconButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft:30
  },
  logo: {
    width: 100,
    height: 37,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
});
