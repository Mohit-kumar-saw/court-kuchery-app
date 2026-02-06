import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';

export default function IndexScreen() {
  const router = useRouter();
  const { hasCompletedSplash, isLoggedIn } = useAuth();

  useEffect(() => {
    // Defer navigation until after Root Layout's navigator has mounted
    const id = setTimeout(() => {
      if (!hasCompletedSplash) {
        router.replace(ROUTES.SPLASH.WELCOME);
        return;
      }
      if (!isLoggedIn) {
        router.replace(ROUTES.AUTH.LOGIN);
        return;
      }
      router.replace(ROUTES.TABS.ROOT);
    }, 0);
    return () => clearTimeout(id);
  }, [hasCompletedSplash, isLoggedIn, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={AppColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
});
