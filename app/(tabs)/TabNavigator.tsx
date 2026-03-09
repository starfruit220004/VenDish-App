import React from 'react';
import { Platform, useColorScheme, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Promos from './Promos';
import FeedTab from './FeedTab';
import FavoritesTab from './FavoritesTab';
import LocationTab from './LocationTab';
import ShopReviewsTab from './ShopReviewsTab';
import { getTheme, layout, spacing, typography } from '../../constants/theme';

type TabParamList = {
  Promos: undefined;
  Feed: undefined;
  Favorites: undefined;
  Location: undefined;
  ShopReviews: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

/** Pill-shaped active indicator behind the icon */
function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme === 'dark');

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 32,
          borderRadius: 16,
        },
        focused && {
          backgroundColor: theme.accentSoft,
        },
      ]}
    >
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  return (
    <Tab.Navigator
      initialRouteName="Promos"
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          height: layout.tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.md,
          paddingTop: spacing.xs,
          ...theme.cardShadow,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          ...typography.labelSm,
          marginTop: spacing.xxs,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Promos"
        component={Promos}
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="pricetag" color={color} focused={focused} />,
          tabBarLabel: 'Promos',
        }}
      />

      <Tab.Screen
        name="Feed"
        component={FeedTab}
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="restaurant" color={color} focused={focused} />,
          tabBarLabel: 'Food',
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesTab}
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="heart" color={color} focused={focused} />,
          tabBarLabel: 'Favorites',
        }}
      />

      <Tab.Screen
        name="Location"
        component={LocationTab}
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="location" color={color} focused={focused} />,
          tabBarLabel: 'Location',
        }}
      />

      <Tab.Screen
        name="ShopReviews"
        component={ShopReviewsTab}
        options={{
          tabBarIcon: ({ color, focused }) => <TabIcon name="star" color={color} focused={focused} />,
          tabBarLabel: 'Reviews',
        }}
      />
    </Tab.Navigator>
  );
}