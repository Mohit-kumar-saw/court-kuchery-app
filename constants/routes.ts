/**
 * Route path constants for type-safe navigation
 */

export const ROUTES = {
  ROOT: '/',
  SPLASH: {
    // (splash) is a route group; the URL path is just /welcome
    WELCOME: '/welcome',
  },
  AUTH: {
    // (auth) is a route group; the URL paths are /login and /signup
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  TABS: {
    ROOT: '/(tabs)',
    HOME: '/(tabs)',
    LAWYERS: '/(tabs)/lawyers',
    WALLET: '/(tabs)/wallet',
    PROFILE: '/(tabs)/profile',
    MY_CASES: '/(tabs)/my-cases',
    CHAT_HISTORY: '/(tabs)/chat-history',
    CHANGE_PASSWORD: '/(tabs)/change-password',
    ABOUT: '/(tabs)/about',
  },
} as const;

export type AuthRoute = (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH];
export type TabRoute = (typeof ROUTES.TABS)[keyof typeof ROUTES.TABS];
