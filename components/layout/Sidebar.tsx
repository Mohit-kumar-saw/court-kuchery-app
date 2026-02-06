import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
};

const MENU_ITEMS: { id: string; label: string; icon: string; route: string }[] = [
  { id: 'my-cases', label: 'My Cases', icon: 'document-text-outline', route: ROUTES.TABS.MY_CASES },
  { id: 'chat-history', label: 'Chat History', icon: 'chatbubble-ellipses-outline', route: ROUTES.TABS.CHAT_HISTORY },
  { id: 'wallet', label: 'Wallet', icon: 'wallet-outline', route: ROUTES.TABS.WALLET },
  { id: 'change-password', label: 'Change Password', icon: 'lock-closed-outline', route: ROUTES.TABS.CHANGE_PASSWORD },
  { id: 'about', label: 'About App', icon: 'information-circle-outline', route: ROUTES.TABS.ABOUT },
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
    router.replace(ROUTES.AUTH.LOGIN);
  };

  // NOTE: `Modal` on web uses portals and can occasionally throw DOM `removeChild` errors
  // during rapid mount/unmount. For web, render an in-tree overlay instead.
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={styles.webOverlay} pointerEvents="box-none">
        <Pressable style={styles.webBackdrop} onPress={onClose} />
        <View style={styles.panel}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
              </View>
              <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={AppColors.primary} />
            </TouchableOpacity>
          </View >

          {/* line */}
          <View style={styles.line} >
          </View>
          <View style={styles.menu}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={22} color={AppColors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color={AppColors.primary} />
              <Text style={styles.menuLabel}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.panel}>
          <TouchableOpacity onPress={onClose} style={styles.closeArea} />
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
              </View>
              <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={AppColors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.menu}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={22} color={AppColors.primary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color={AppColors.primary} />
              <Text style={styles.menuLabel}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  webOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  webBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ebf2ff',
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ebf2ff',
  },
  closeArea: {
    flex: 1,
  },
  panel: {
    width: '100%',
    backgroundColor: "#ebf2ff",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  line:{
    height:0.2,
    backgroundColor:"#184eb2",
    marginBottom:20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.primary,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
  },
  closeButton: {
    padding: 4,
  },
  menu: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  menuLabel: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '500',
  },
  logoutItem: {
    marginTop: 16,
  },
});
