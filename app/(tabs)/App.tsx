import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import FeedTab from './FeedTab';
import FavoritesTab from './FavoritesTab';
import AboutTab from './AboutTab';
import { FavoritesProvider } from './FavoritesContext';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <FavoritesProvider>
      
        <Tab.Navigator
          initialRouteName="Feed"
          screenOptions={{
            tabBarActiveTintColor: '#B71C1C',
            tabBarInactiveTintColor: '#757575',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: '#B71C1C',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        >
          <Tab.Screen
            name="Feed"
            component={FeedTab}
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="restaurant" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesTab}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="heart" size={size} color={color} />
              ),
              headerStyle: {
                backgroundColor: '#B71C1C',
              },
              headerTintColor: '#FFFFFF',
            }}
          />
          <Tab.Screen
            name="About"
            component={AboutTab}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="information-circle" size={size} color={color} />
              ),
              headerStyle: {
                backgroundColor: '#E65100',
              },
              headerTintColor: '#FFFFFF',
            }}
          />
        </Tab.Navigator>
      
    </FavoritesProvider>
  );
}
export default App;