import React, { useState, createContext } from 'react';
import { useColorScheme, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {createDrawerNavigator,DrawerContentScrollView,DrawerContentComponentProps} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import TabNavigator from './TabNavigator';
import FAQScreen from './FAQ';
import Profile from './Profile';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ForgotPassword from './Auth/ForgotPassword';
import PrivacyPolicy from '../(tabs)/PrivacyPolicy';
import TermsAndConditions from '../(tabs)/TermsAndConditions';
import AboutTab from '../(tabs)/AboutTab';

type DrawerParamList = {
  Tabs: undefined;
  Profile: undefined;
  FAQ: undefined;
  Login: { redirect?: string; promoTitle?: string } | undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  About: undefined;
};

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

const Drawer = createDrawerNavigator<DrawerParamList>();

// CUSTOM DRAWER SIDEBAR
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const { isLoggedIn, logout } = React.useContext(AuthContext);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettings = () => setSettingsOpen(!settingsOpen);

  const handleMenuPress = (screen: string) => {
    if (screen === 'FAQ') props.navigation.navigate('FAQ' as never);
    else if (screen === 'Profile') props.navigation.navigate('Profile' as never);
    else if (screen === 'PrivacyPolicy') props.navigation.navigate('PrivacyPolicy' as never);
    else if (screen === 'TermsAndConditions') props.navigation.navigate('TermsAndConditions' as never);
    else if (screen === 'About') props.navigation.navigate('About' as never);
    else if (screen === 'Logout') {
      logout();
      alert('Logged out successfully!');
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
      </View>

      <View style={styles.menuSection}>
        {/* PROFILE */}
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

        {/* SETTINGS */}

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
            {/* PRIVACY POLICY */}
            <TouchableOpacity
              style={styles.subMenuItem}
              onPress={() => handleMenuPress('PrivacyPolicy')}
            >
              <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>

            {/* TERMS */}
            <TouchableOpacity
              style={styles.subMenuItem}
              onPress={() => handleMenuPress('TermsAndConditions')}
            >
              <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>

            {/* ABOUT */}
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
  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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

        {/* Main Pages */}
        <Drawer.Screen
          name="Profile"
          component={Profile}
          options={{
            headerTitle: 'Profile',
            headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' },
            headerTintColor: '#FFFFFF'
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

const styles = StyleSheet.create({
  drawerContent: { flex: 1, paddingTop: 0 },
  drawerHeader: { padding: 30, alignItems: 'center' },
  drawerHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  drawerHeaderSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  menuSection: { paddingHorizontal: 16, marginTop: 10 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1
  },
  menuItemText: { flex: 1, fontSize: 16, fontWeight: '600', marginLeft: 16 },

  /* SUBMENU STYLES */
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
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});
