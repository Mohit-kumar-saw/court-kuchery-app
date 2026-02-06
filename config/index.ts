/**
 * App configuration
 * Use env vars in production (e.g. EXPO_PUBLIC_API_URL)
 */

export const APP_CONFIG = {
  appName: 'COURT Kutchery',
  version: '1.0.0',
  /** Enable dummy auth; set false when wiring real API */
  useDummyAuth: true,
} as const;
