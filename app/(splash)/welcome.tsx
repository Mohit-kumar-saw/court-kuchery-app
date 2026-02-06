import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOADING_AUTO_ADVANCE_MS = 2500;

const SPLASH_DATA = [
  { id: '1' },
  {
    id: '2',
    title: 'Talk to Verified Lawyers',
    subtitle:
      'Find experienced and verified legal experts for your legal problems.',
    buttonText: 'Next',
    showIllustration: true,
  },
  {
    id: '3',
    title: 'Chat & Call Consultations',
    subtitle: 'Connect with lawyers through\nCall & Chat anytime anywhere!',
    buttonText: 'Get Started',
    showIllustration: true,
  },
];

export default function WelcomeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const hasAutoAdvancedRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { completeSplash, isLoggedIn } = useAuth();
  const router = useRouter();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  // Auto advance from loading slide
  useEffect(() => {
    if (hasAutoAdvancedRef.current) return;

    const id = setTimeout(() => {
      hasAutoAdvancedRef.current = true;
      scrollRef.current?.scrollTo({
        x: SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(1);
    }, LOADING_AUTO_ADVANCE_MS);

    return () => clearTimeout(id);
  }, []);

  const handleNext = (idx: number) => {
    if (idx < SPLASH_DATA.length - 1) {
      const nextIndex = idx + 1;
      scrollRef.current?.scrollTo({
        x: SCREEN_WIDTH * nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      completeSplash();
      router.replace(isLoggedIn ? ROUTES.TABS.ROOT : ROUTES.AUTH.LOGIN);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        bounces={false}
      >
        {SPLASH_DATA.map((slide, idx) => {
          /* ---------------- SLIDE 0 (IMAGE + OVERLAY) ---------------- */
          if (idx === 0) {
            return (
              <View
                key={slide.id}
                style={[styles.slide, { width: SCREEN_WIDTH }]}
              >
                {/* Background image */}
                <Image
                  source={require('@/assets/court/law.avif')}
                  style={styles.bgImage}
                />

                {/* Blue overlay */}
                <View style={styles.overlay} />

                {/* Content */}
                <View style={styles.centerContent}>
                  <Image
                    source={require('@/assets/court/court-k-logo.png')}
                    style={styles.logo}
                  />
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              </View>
            );
          }

          /* ---------------- SLIDE 1 & 2 (GRADIENT) ---------------- */
          return (
            <LinearGradient
              key={slide.id}
              colors={['#aac5ff', '#2f74f3']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.slide,styles.slide1, { width: SCREEN_WIDTH }]}
            >
              {idx === 1 && slide.showIllustration && (
                <Image
                  source={require('@/assets/court/lawyer.png')}
                  style={styles.image}
                />
              )}

              {idx === 2 && slide.showIllustration && (
                <Image
                  source={require('@/assets/court/videocall.png')}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}

              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleNext(idx)}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {slide.buttonText}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dots}>
        {SPLASH_DATA.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex
                ? styles.dotActive
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slide1: {
    paddingBottom: 120,
  },

  /* Slide 0 */
  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(170, 197, 255, 0.88)',
  },

  centerContent: {
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 24,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },

  /* Shared */
  logo: {
    width: 380,
    height: 270,
    resizeMode: 'contain',
  },

  image: {
    width: 380,
    height: 380,
    marginBottom: 32,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  button: {
    backgroundColor: '#184eb2',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 100,
    minWidth: 200,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  dots: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  dotActive: {
    backgroundColor: '#fff',
  },

  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
