import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Navbar, Sidebar } from '@/components/layout';
import { AppColors } from '@/constants/theme';

export default function TabLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'web' ? 0 : 0,

        },
      ]}
    >
      {/* 🔹 Global Navbar */}
      <Navbar onMenuPress={() => setSidebarOpen(true)} />

      {/* 🔹 Tabs */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: AppColors.primary,
          tabBarInactiveTintColor: AppColors.textSecondary,
          tabBarStyle: {
            backgroundColor: '#cadcff',
            borderTopColor: AppColors.border,

            // 🔥 FIXED TAB BAR HEIGHT
            height: 60 + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom,
          },
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="lawyers"
          options={{
            title: 'Lawyers',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        {/* 🔒 Hidden routes */}
        <Tabs.Screen name="my-cases" options={{ href: null }} />
        <Tabs.Screen name="chat-history" options={{ href: null }} />
        <Tabs.Screen name="change-password" options={{ href: null }} />
        <Tabs.Screen name="about" options={{ href: null }} />
        <Tabs.Screen name="lawyers/[id]" options={{ href: null }} />
        <Tabs.Screen name="lawyers/[id]/chat" options={{ href: null }} />
        <Tabs.Screen name="lawyers/[id]/call" options={{ href: null }} />
      </Tabs>

      {/* 🔹 Global Sidebar */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FF',

    // 🌐 Web breathing space
    ...(Platform.OS === 'web' && {
      paddingTop: 12,
      paddingBottom: 12,
    }),
  },
});
