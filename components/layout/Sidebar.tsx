import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';
import { api } from '@/services/api';
import { tokenStorage } from '@/services/tokenStorage';

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
};

async function logoutBackend() {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.log("logout not possible....",err);
    
  }

  await tokenStorage.clear();
}

const MENU_ITEMS = [
  {
    id: 'my-cases',
    label: 'My Cases',
    icon: 'document-text-outline',
    route: ROUTES.TABS.MY_CASES,
  },
  {
    id: 'chat-history',
    label: 'Chat History',
    icon: 'chatbubble-ellipses-outline',
    route: ROUTES.TABS.CHAT_HISTORY,
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: 'wallet-outline',
    route: ROUTES.TABS.WALLET,
  },
  {
    id: 'change-password',
    label: 'Change Password',
    icon: 'lock-closed-outline',
    route: ROUTES.TABS.CHANGE_PASSWORD,
  },
  {
    id: 'about',
    label: 'About App',
    icon: 'information-circle-outline',
    route: ROUTES.TABS.ABOUT,
  },
];



export function Sidebar({ visible, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = () => {
    onClose();
    logout();
    logoutBackend();
    router.replace(ROUTES.AUTH.LOGIN);
  };

  /* ---------------- WEB (no Modal issues) ---------------- */
  if (Platform.OS === 'web') {
    if (!visible) return null;

    return (
      <View style={styles.webOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView style={styles.panel}>
          <Header user={user} onClose={onClose} />
          <Divider />
          <Menu
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </SafeAreaView>
      </View>
    );
  }

  /* ---------------- MOBILE ---------------- */
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <SafeAreaView style={styles.panel}>
          <Header user={user} onClose={onClose} />
          <Divider />
          <Menu
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

/* ================= SUB COMPONENTS ================= */

function Header({ user, onClose }: any) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) ?? 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
      </View>

      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={26} color={AppColors.primary} />
      </TouchableOpacity>
    </View>
  );
}

function Menu({ onNavigate, onLogout }: any) {
  return (
    <View style={styles.menu}>
      {MENU_ITEMS.map((item: any) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => onNavigate(item.route)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={AppColors.primary}
          />
          <Text style={styles.menuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.menuItem, styles.logoutItem]}
        onPress={onLogout}
        activeOpacity={0.7}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color={AppColors.primary}
        />
        <Text style={styles.menuLabel}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  /* Overlay */
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  webOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  /* Sidebar panel */
  panel: {
    flex: 1,
    backgroundColor: '#ebf2ff',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.primary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: '#184eb2',
    marginBottom: 20,
  },

  /* Menu */
  menu: {
    gap: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.primary,
  },
  logoutItem: {
    marginTop: 20,
  },
});
