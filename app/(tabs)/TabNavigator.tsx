// app/(tabs)/TabNavigator.tsx
import React from 'react';
import { useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Promos from './Promos';
import FeedTab from './FeedTab';
import FavoritesTab from './FavoritesTab';
import AboutTab from './AboutTab';
import { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  return (
    <Tab.Navigator
      initialRouteName="Promos"
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#FF5252' : '#B71C1C',
        tabBarInactiveTintColor: isDarkMode ? '#BDBDBD' : '#757575',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#2C2C2E' : '#E0E0E0',
          height: 90,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginTop: 4 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Promos"
        component={Promos}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="pricetag" size={size} color={color} />,
          tabBarLabel: 'Promos',
        }}
      />

      <Tab.Screen
        name="Feed"
        component={FeedTab}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
          tabBarLabel: 'Food Log',
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesTab}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          tabBarLabel: 'Favorites',
        }}
      />

      <Tab.Screen
        name="About"
        component={AboutTab}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" size={size} color={color} />,
          tabBarLabel: 'About',
        }}
      />
    </Tab.Navigator>
  );
}