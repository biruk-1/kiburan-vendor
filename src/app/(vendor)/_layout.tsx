import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamilies, sizes } from '@/theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

function tabIcon(name: FeatherName) {
  return function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Feather name={name} color={typeof color === 'string' ? color : undefined} size={size - 2} />;
  };
}

/** Each tab is its own stack, so detail screens keep the tab bar as the design shows. */
export default function VendorTabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarLabelStyle: { fontFamily: fontFamilies.medium, fontSize: 11, lineHeight: 14 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: sizes.tabBarHeight + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: tabIcon('calendar') }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: tabIcon('star') }} />
      <Tabs.Screen name="messages" options={{ title: 'Inquiries', tabBarIcon: tabIcon('message-square') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}
