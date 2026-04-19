import React, { useState, useEffect } from 'react';
import {
  useColorScheme,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerContentComponentProps,
  useDrawerStatus // Added this import
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// --- IMPORTS ---
import TabNavigator from './TabNavigator';
import FAQScreen from './FAQ';
import Profile from './Profile';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ForgotPassword from './Auth/ForgotPassword';
import PrivacyPolicy from '../(tabs)/PrivacyPolicy';
import TermsAndConditions from '../(tabs)/TermsAndConditions';
import AboutTab from './AboutTab';
import Notifications from './Notifications';
import TransactionHistory from './TransactionHistory';
import TabScreenBackground from './TabScreenBackground';

import { useAuth } from '../context/AuthContext';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from './FeedbackModal';
import { getTheme, spacing, typography, radii, palette } from '../../constants/theme';

type DrawerParamList = {
  Tabs: undefined;
  Notifications: undefined;
  Profile: undefined;
  TransactionHistory: undefined;
  FAQ: undefined;
  Login: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  Signup: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  ForgotPassword: undefined;
  PrivacyPolicy: undefined;
  TermsAndConditions: undefined;
  About: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

// ─── Custom Drawer Content ────────────────────────────────────────────────────
type CustomDrawerContentProps = DrawerContentComponentProps & {
  showFeedback: (
    title: string,
    message: string,
    variant?: FeedbackVariant,
    actions?: FeedbackAction[]
  ) => void;
};

function CustomDrawerContent(props: CustomDrawerContentProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);
  const { isLoggedIn, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Track if the drawer is open or closed
  const drawerStatus = useDrawerStatus();

  // Reset the dropdown to open whenever the drawer opens
  useEffect(() => {
    if (drawerStatus === 'open') {
      setSettingsOpen(true);
    }
  }, [drawerStatus]);

  const settingsItems: {
    screen: 'PrivacyPolicy' | 'TermsAndConditions' | 'About';
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }[] = [
    {
      screen: 'PrivacyPolicy',
      label: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
    },
    {
      screen: 'TermsAndConditions',
      label: 'Terms & Conditions',
      icon: 'document-text-outline',
    },
    {
      screen: 'About',
      label: 'About VenDish',
      icon: 'information-circle-outline',
    },
  ];

  const toggleSettings = () => setSettingsOpen(!settingsOpen);

  const confirmLogout = () => {
    props.showFeedback(
      'Logout',
      'Are you sure you want to log out?',
      'warning',
      [
        { label: 'Cancel', style: 'secondary' },
        {
          label: 'Logout',
          style: 'danger',
          onPress: async () => {
            await logout();
            props.showFeedback('Success', 'You successfully logout.', 'success', [
              {
                label: 'OK',
                onPress: () => props.navigation.navigate('Tabs' as never),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleMenuPress = async (screen: string) => {
    if (screen === 'FAQ') props.navigation.navigate('FAQ' as never);
    else if (screen === 'Profile') props.navigation.navigate('Profile' as never);
    else if (screen === 'PrivacyPolicy') props.navigation.navigate('PrivacyPolicy' as never);
    else if (screen === 'TermsAndConditions') props.navigation.navigate('TermsAndConditions' as never);
    else if (screen === 'About') props.navigation.navigate('About' as never);
    else if (screen === 'Logout') confirmLogout();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.drawerContent, { backgroundColor: theme.surface }]}
      showsVerticalScrollIndicator={false}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        
        {/* Brand Header */}
        <View style={[styles.brandHeader, { borderBottomColor: theme.borderSubtle }]}>
          <Image
            source={require('../../assets/images/Logo2.jpg')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View style={styles.brandTextContainer}>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>VenDish</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>Modern Filipino Dining</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>QUICK ACCESS</Text>

          {isLoggedIn && (
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleMenuPress('Profile')}
            >
              <Ionicons name="person-outline" size={22} color={theme.textPrimary} style={styles.menuIcon} />
              <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>Profile</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress('FAQ')}
          >
            <Ionicons name="help-buoy-outline" size={22} color={theme.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>FAQ</Text>
          </TouchableOpacity>

          {/* Legal & About Group */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={toggleSettings}
          >
            {/* Updated the icon to match the new label */}
            <Ionicons name="information-circle-outline" size={22} color={theme.textPrimary} style={styles.menuIcon} />
            <Text style={[styles.menuTitle, { color: theme.textPrimary }]}>Legal & About</Text>
            <Ionicons name={settingsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textDisabled} />
          </TouchableOpacity>

          {/* Sub Menu Items */}
          {settingsOpen && (
            <View style={[styles.subMenu, { borderLeftColor: theme.borderSubtle }]}> 
              {settingsItems.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={styles.subMenuItem}
                  activeOpacity={0.7}
                  onPress={() => handleMenuPress(item.screen)}
                >
                  <Ionicons name={item.icon} size={20} color={theme.textMuted} style={styles.menuIcon} />
                  <Text style={[styles.subMenuTitle, { color: theme.textMuted }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Drawer Footer */}
        <View style={styles.drawerFooter}>
          {isLoggedIn ? (
            <>
              <TouchableOpacity style={[styles.homeActionButton, { backgroundColor: theme.accent }]} onPress={() => props.navigation.navigate('Tabs' as never)}>
                <Ionicons name="home-outline" size={20} color="#FFF" />
                <Text style={styles.homeActionText}>Back to Home</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.logoutButton, { borderColor: theme.borderSubtle }]} onPress={() => handleMenuPress('Logout')}>
                <Ionicons name="log-out-outline" size={20} color={palette.crimson} />
                <Text style={[styles.logoutButtonText, { color: palette.crimson }]}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.loginButtonBottom, { backgroundColor: theme.accent }]} onPress={() => props.navigation.navigate('Login' as never)}>
              <Ionicons name="log-in-outline" size={22} color="#FFF" />
              <Text style={styles.loginButtonText}>Login / Signup</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </DrawerContentScrollView>
  );
}

// ─── Main Drawer Navigation ──────────────────────────────────────────────────

export default function MainDrawer() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const {
    isLoggedIn,
    isAuthLoading,
    unreadPromoCount,
  } = useAuth();

  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: FeedbackVariant;
    actions?: FeedbackAction[];
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showFeedback = (
    title: string,
    message: string,
    variant: FeedbackVariant = 'info',
    actions?: FeedbackAction[]
  ) => {
    setFeedbackModal({ visible: true, title, message, variant, actions });
  };

  const closeFeedback = () => {
    setFeedbackModal(prev => ({ ...prev, visible: false }));
  };

  if (isAuthLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? theme.background : 'transparent' }]}> 
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={isDark ? theme.surfaceElevated : theme.accent} translucent={false} />
      <TabScreenBackground>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} showFeedback={showFeedback} />}
          screenOptions={{
            headerShown: true,
            sceneStyle: { backgroundColor: isDark ? theme.background : 'transparent' },
            drawerStyle: { backgroundColor: theme.surface, width: 300 }, // Slightly wider for a modern feel
            drawerType: 'slide',
            overlayColor: theme.modalOverlay,
          }}
        >
        <Drawer.Screen
          name="Tabs"
          component={TabNavigator}
          options={({ navigation }) => ({
            headerTitle: ' ',
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
                <Ionicons name="menu" size={26} color="#FFF" />
              </TouchableOpacity>
            ),
            headerRight: () => {
              return isLoggedIn ? (
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifButton}>
                    <Ionicons name="notifications-outline" size={24} color="#FFF" />
                    {unreadPromoCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadPromoCount > 99 ? '99+' : unreadPromoCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
              ) : null;
            },
            headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent, elevation: 0, shadowOpacity: 0 },
            headerTintColor: '#FFF',
          })}
        />

        <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerTitle: 'Privacy Policy', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="TermsAndConditions" component={TermsAndConditions} options={{ headerTitle: 'Terms & Conditions', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="About" component={AboutTab} options={{ headerTitle: 'About', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Notifications" component={Notifications} options={{ headerTitle: 'Notifications', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Login" component={Login} options={{ headerTitle: 'Login', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Signup" component={Signup} options={{ headerTitle: 'Sign Up', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerTitle: 'Forgot Password', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="TransactionHistory" component={TransactionHistory} options={{ headerTitle: 'My POS Transactions', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Profile" component={Profile} options={{ headerTitle: 'Profile', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="FAQ" component={FAQScreen} options={{ headerTitle: 'FAQ', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        </Drawer.Navigator>
      </TabScreenBackground>

      <FeedbackModal
        visible={feedbackModal.visible}
        title={feedbackModal.title}
        message={feedbackModal.message}
        variant={feedbackModal.variant}
        actions={feedbackModal.actions}
        onClose={closeFeedback}
      />
    </>
  );
}

export type { DrawerParamList };

const styles = StyleSheet.create({
  // ── Drawer Content ──────────────────────────────────────
  drawerContent: { flexGrow: 1 },
  
  // Header
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  brandLogo: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    marginRight: spacing.md,
  },
  brandTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitle: { ...typography.headingMd, fontWeight: '700' as const },
  brandSubtitle: { ...typography.bodySm, marginTop: 2 },
  
  // Menu Section
  menuSection: { 
    paddingHorizontal: spacing.xl, 
    flex: 1,
  },
  sectionLabel: { 
    ...typography.caption, 
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.2, 
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
  },
  menuIcon: {
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuTitle: { 
    flex: 1, 
    ...typography.labelLg,
    fontWeight: '500' as const,
  },

  // Sub Menu
  subMenu: {
    marginLeft: 12, // Align with the center of parent icon
    paddingLeft: spacing.xl,
    borderLeftWidth: 1,
    marginBottom: spacing.sm,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  subMenuTitle: { 
    ...typography.bodyMd,
  },

  // Footer Actions
  drawerFooter: { 
    paddingHorizontal: spacing.xl, 
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'], 
    gap: spacing.md,
  },
  homeActionButton: {
    paddingVertical: spacing.md, 
    borderRadius: radii.full,
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: spacing.sm,
  },
  homeActionText: { 
    color: '#FFF', 
    ...typography.labelLg,
    fontWeight: '600' as const,
  },
  logoutButton: {
    paddingVertical: spacing.md, 
    borderRadius: radii.full,
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
  },
  logoutButtonText: { 
    ...typography.labelLg,
    fontWeight: '600' as const,
  },
  loginButtonBottom: {
    paddingVertical: spacing.md, 
    borderRadius: radii.full,
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: spacing.sm,
  },
  loginButtonText: { 
    color: '#FFF', 
    ...typography.labelLg,
    fontWeight: '600' as const, 
  },

  // Header navigation elements
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuButton: { marginLeft: spacing.md, padding: spacing.xs },
  notifButton: { marginRight: spacing.md, padding: spacing.xs, position: 'relative' },
  badge: { 
    position: 'absolute', 
    top: 4, 
    right: 4, 
    backgroundColor: palette.warning, 
    borderRadius: radii.full, 
    width: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeText: { fontSize: 10, fontWeight: '800' as const, color: '#000' },
});