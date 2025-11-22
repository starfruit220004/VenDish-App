import React, { useState, createContext, useEffect } from 'react';
import { useColorScheme, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {createDrawerNavigator,DrawerContentScrollView,DrawerContentComponentProps} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigator from './TabNavigator';
import FAQScreen from './FAQ';
import Profile from './Profile';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ForgotPassword from './Auth/ForgotPassword';
import PrivacyPolicy from '../(tabs)/PrivacyPolicy';
import TermsAndConditions from '../(tabs)/TermsAndConditions';
import AboutTab from '../(tabs)/AboutTab';

const AUTH_KEY = '@user_authenticated';
const USER_DATA_KEY = '@user_data';

type DrawerParamList = {
  Tabs: undefined;
  Profile: undefined;
  FAQ: undefined;
  Login: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  Signup: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  ForgotPassword: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  About: undefined;
};

export interface UserData {
  username: string;
  email: string;
  phone: string;
  profilePic?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  login: (user: UserData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (user: UserData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  login: async () => {},
  logout: async () => {},
  updateUserData: async () => {},
});

const Drawer = createDrawerNavigator<DrawerParamList>();

// DRAWER SIDEBAR
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const { isLoggedIn, logout, userData } = React.useContext(AuthContext);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettings = () => setSettingsOpen(!settingsOpen);

  const handleMenuPress = async (screen: string) => {
    if (screen === 'FAQ') props.navigation.navigate('FAQ' as never);
    else if (screen === 'Profile') props.navigation.navigate('Profile' as never);
    else if (screen === 'PrivacyPolicy') props.navigation.navigate('PrivacyPolicy' as never);
    else if (screen === 'TermsAndConditions') props.navigation.navigate('TermsAndConditions' as never);
    else if (screen === 'About') props.navigation.navigate('About' as never);
    else if (screen === 'Logout') {
      await logout();
      alert('Logged out successfully!');
      props.navigation.navigate('Tabs' as never);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.drawerContent,
        { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
      ]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.drawerHeader,
          { backgroundColor: isDarkMode ? '#2C2C2E' : '#B71C1C' }
        ]}
      >
        <Ionicons name="restaurant" size={48} color="#FFFFFF" />
        <Text style={styles.drawerHeaderText}>Kuya Vince Carenderia</Text>
        <Text style={styles.drawerHeaderSubtext}>Filipino Cuisine</Text>
        
        {/* Display user info if logged in */}
        {isLoggedIn && userData && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>👤 {userData.username}</Text>
          </View>
        )}
      </View>

      <View style={styles.menuSection}>
        {/* PROFILE - Only show if logged in */}
        {isLoggedIn && (
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]}
            onPress={() => handleMenuPress('Profile')}
          >
            <Ionicons name="person-outline" size={24} color={isDarkMode ? '#BDBDBD' : '#757575'} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Profile
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#616161' : '#BDBDBD'} />
          </TouchableOpacity>
        )}

        {/* FAQ */}
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]}
          onPress={() => handleMenuPress('FAQ')}
        >
          <Ionicons name="help-circle-outline" size={24} color={isDarkMode ? '#BDBDBD' : '#757575'} />
          <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
            FAQ
          </Text>
          <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#616161' : '#BDBDBD'} />
        </TouchableOpacity>

        {/* SETTINGS BUTTON */}
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]}
          onPress={toggleSettings}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={isDarkMode ? '#BDBDBD' : '#757575'}
          />
          <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
            Settings
          </Text>

          <Ionicons
            name={settingsOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isDarkMode ? '#616161' : '#BDBDBD'}
          />
        </TouchableOpacity>

        {/* SETTINGS SUB-MENU */}
        {settingsOpen && (
          <View style={styles.subMenu}>
            <TouchableOpacity
              style={styles.subMenuItem}
              onPress={() => handleMenuPress('PrivacyPolicy')}
            >
              <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subMenuItem}
              onPress={() => handleMenuPress('TermsAndConditions')}
            >
              <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subMenuItem}
              onPress={() => handleMenuPress('About')}
            >
              <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                About
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LOGIN / LOGOUT */}
        {!isLoggedIn ? (
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]}
            onPress={() => props.navigation.navigate('Login' as never)}
          >
            <Ionicons name="log-in-outline" size={24} color={isDarkMode ? '#BDBDBD' : '#757575'} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Login
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#616161' : '#BDBDBD'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]}
            onPress={() => handleMenuPress('Logout')}
          >
            <Ionicons name="log-out-outline" size={24} color={isDarkMode ? '#BDBDBD' : '#757575'} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Logout
            </Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#616161' : '#BDBDBD'} />
          </TouchableOpacity>
        )}
      </View>

      {/* BACK TO HOME */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => props.navigation.navigate('Tabs' as never)}
      >
        <Ionicons name="arrow-back-circle" size={26} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* FOOTER */}
      <View style={styles.drawerFooter}>
        <Text style={[styles.footerText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
          Version 1.0.0
        </Text>
        <Text style={[styles.footerText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
          Made with ❤️ kahit pagod na.
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function MainDrawer() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app launch
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AsyncStorage.getItem(AUTH_KEY);
      const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (authStatus === 'true' && storedUserData) {
        setIsLoggedIn(true);
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (user: UserData) => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, 'true');
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      setIsLoggedIn(true);
      setUserData(user);
    } catch (error) {
      console.error('Error saving auth status:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      setIsLoggedIn(false);
      setUserData(null);
    } catch (error) {
      console.error('Error removing auth status:', error);
    }
  };

  const updateUserData = async (user: UserData) => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      setUserData(user);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
        <Ionicons name="restaurant" size={80} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
        <ActivityIndicator size="large" color="#B71C1C" style={{ marginTop: 20 }} />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userData, login, logout, updateUserData }}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerStyle: {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            width: 280
          },
          drawerType: 'slide',
          overlayColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <Drawer.Screen
          name="Tabs"
          component={TabNavigator}
          options={({ navigation }) => ({
            headerTitle: ' ',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.toggleDrawer()}
                style={styles.menuButton}
              >
                <Ionicons name="menu" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C'
            },
            headerTintColor: '#FFFFFF'
          })}
        />

        {/* Hidden Screens */}
        <Drawer.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicy}
          options={{
            headerTitle: 'Privacy Policy',
            headerStyle: {
              backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C'
            },
            headerTintColor: '#FFFFFF',
            drawerItemStyle: { display: 'none' }
          }}
        />

        <Drawer.Screen
          name="TermsAndConditions"
          component={TermsAndConditions}
          options={{
            headerTitle: 'Terms & Conditions',
            headerStyle: {
              backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C'
            },
            headerTintColor: '#FFFFFF',
            drawerItemStyle: { display: 'none' }
          }}
        />

        <Drawer.Screen
          name="About"
          component={AboutTab}
          options={{
            headerTitle: 'About',
            headerStyle: {
              backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C'
            },
            headerTintColor: '#FFFFFF',
            drawerItemStyle: { display: 'none' }
          }}
        />

        {/* Auth Screens */}
        <Drawer.Screen
          name="Login"
          component={Login}
          options={{
            headerTitle: 'Login',
            headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' },
            headerTintColor: '#FFFFFF',
            drawerItemStyle: { display: 'none' }
          }}
        />

        <Drawer.Screen
          name="Signup"
          component={Signup}
          options={{
            headerTitle: 'Sign Up',
            headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' },
            headerTintColor: '#FFFFFF',
            drawerItemStyle: { display: 'none' }
          }}
        />

        <Drawer.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{
            headerTitle: 'Forgot Password',
            headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' },
            headerTintColor: '#FFFFFF',
            drawerItemStyle: { display: 'none' }
          }}
        />

        {/* Profile - only accessible when logged in */}
        <Drawer.Screen
          name="Profile"
          component={Profile}
          options={{
            headerTitle: 'Profile',
            headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' },
            headerTintColor: '#FFFFFF',
            drawerItemStyle: { display: 'none' }
          }}
        />

        <Drawer.Screen
          name="FAQ"
          component={FAQScreen}
          options={{
            headerTitle: 'FAQ',
            headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' },
            headerTintColor: '#FFFFFF'
          }}
        />
      </Drawer.Navigator>
    </AuthContext.Provider>
  );
}
export type { DrawerParamList };

const styles = StyleSheet.create({
  drawerContent: { flex: 1, paddingTop: 0 },
  drawerHeader: { padding: 30, alignItems: 'center' },
  drawerHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  drawerHeaderSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  userInfoContainer: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.3)',
    width: '100%',
    alignItems: 'center'
  },
  userInfoText: { 
    fontSize: 14, 
    color: '#FFFFFF', 
    fontWeight: '600' 
  },
  menuSection: { paddingHorizontal: 16, marginTop: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1
  },
  menuItemText: { flex: 1, fontSize: 16, fontWeight: '600', marginLeft: 16 },
  subMenu: {
    marginLeft: 50,
    marginTop: -5,
    marginBottom: 10
  },
  subMenuItem: {
    paddingVertical: 10,
  },
  subMenuText: {
    fontSize: 15,
  },
  drawerFooter: {
    marginTop: 'auto',
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  footerText: { fontSize: 12, marginVertical: 2 },
  menuButton: { marginLeft: 15, padding: 4 },
  backButton: {
    marginTop: 20,
    backgroundColor: '#B71C1C',
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    alignItems: 'center'
  },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
});