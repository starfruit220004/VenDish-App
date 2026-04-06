import React, { useState } from 'react';
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
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
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

import { useAuth } from '../context/AuthContext';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from './FeedbackModal';
import { getTheme, spacing, typography, radii, palette } from '../../constants/theme';

type DrawerParamList = {
  Tabs: undefined;
  Notifications: undefined;
  Profile: undefined;
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
      props.showFeedback('Logged out', 'You have been logged out successfully.', 'success');
      props.navigation.navigate('Tabs' as never);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.drawerContent, { backgroundColor: theme.surface }]}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
          <Image
            source={require('../../assets/images/Logo2.jpg')}
            style={{ width: 140, height: 140, borderRadius: radii.lg }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.menuSection}>
          {isLoggedIn && (
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderSubtle }]} onPress={() => handleMenuPress('Profile')}>
              <Ionicons name="person-outline" size={22} color={theme.textMuted} />
              <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Profile</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderSubtle }]} onPress={() => handleMenuPress('FAQ')}>
            <Ionicons name="help-circle-outline" size={22} color={theme.textMuted} />
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>FAQ</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textDisabled} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.borderSubtle }]} onPress={toggleSettings}>
            <Ionicons name="settings-outline" size={22} color={theme.textMuted} />
            <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Settings</Text>
            <Ionicons name={settingsOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textDisabled} />
          </TouchableOpacity>

          {settingsOpen && (
            <View style={styles.subMenu}>
              <TouchableOpacity style={styles.subMenuItem} onPress={() => handleMenuPress('PrivacyPolicy')}>
                <Text style={[styles.subMenuText, { color: theme.textPrimary }]}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subMenuItem} onPress={() => handleMenuPress('TermsAndConditions')}>
                <Text style={[styles.subMenuText, { color: theme.textPrimary }]}>Terms & Conditions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subMenuItem} onPress={() => handleMenuPress('About')}>
                <Text style={[styles.subMenuText, { color: theme.textPrimary }]}>About</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isLoggedIn && (
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.accent }]} onPress={() => props.navigation.navigate('Tabs' as never)}>
            <Ionicons name="arrow-back-circle" size={24} color="#FFF" />
            <Text style={styles.backButtonText}>Home</Text>
          </TouchableOpacity>
        )}

        <View style={styles.drawerFooter}>
          {isLoggedIn ? (
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.surfaceElevated, borderColor: theme.accent }]} onPress={() => handleMenuPress('Logout')}>
              <Ionicons name="log-out-outline" size={22} color={theme.accent} />
              <Text style={[styles.logoutButtonText, { color: theme.accent }]}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.loginButtonBottom, { backgroundColor: theme.accent }]} onPress={() => props.navigation.navigate('Login' as never)}>
              <Ionicons name="log-in-outline" size={22} color="#FFF" />
              <Text style={styles.loginButtonText}>Login</Text>
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

  // FIXED: Moved unreadPromoCount to the top level to avoid breaking React hook rules
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={isDark ? theme.surfaceElevated : theme.accent} translucent={false} />
      
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} showFeedback={showFeedback} />}
        screenOptions={{
          headerShown: true,
          drawerStyle: { backgroundColor: theme.surface, width: 280 },
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
                    <Ionicons name="notifications" size={22} color="#FFF" />
                    {unreadPromoCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadPromoCount > 99 ? '99+' : unreadPromoCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
              ) : null;
            },
            headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent },
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
        <Drawer.Screen name="Profile" component={Profile} options={{ headerTitle: 'Profile', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="FAQ" component={FAQScreen} options={{ headerTitle: 'FAQ', headerStyle: { backgroundColor: isDark ? theme.surfaceElevated : theme.accent }, headerTintColor: '#FFF' }} />
      </Drawer.Navigator>

      {/* FIXED: Removed dangling </View> and </Modal> tags that were here */}

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
  // ── Drawer ──────────────────────────────────────
  drawerContent: { flex: 1 },
  menuSection: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg, borderBottomWidth: 1 },
  menuItemText: { flex: 1, ...typography.labelLg, marginLeft: spacing.lg },
  subMenu: { marginLeft: 50, marginTop: -spacing.xxs, marginBottom: spacing.md },
  subMenuItem: { paddingVertical: spacing.md },
  subMenuText: { ...typography.bodyMd },
  backButton: {
    marginTop: spacing.xl, marginHorizontal: spacing.lg,
    paddingVertical: spacing.md, borderRadius: radii.lg,
    flexDirection: 'row', justifyContent: 'center', gap: spacing.md, alignItems: 'center',
  },
  backButtonText: { color: '#FFF', ...typography.labelLg },
  logoutButton: {
    paddingVertical: spacing.md, borderRadius: radii.lg,
    flexDirection: 'row', justifyContent: 'center', gap: spacing.md, alignItems: 'center',
    borderWidth: 1.5, width: '100%',
  },
  logoutButtonText: { ...typography.labelLg },
  loginButtonBottom: {
    paddingVertical: spacing.md, borderRadius: radii.lg,
    flexDirection: 'row', justifyContent: 'center', gap: spacing.md, alignItems: 'center', width: '100%',
  },
  loginButtonText: { color: '#FFF', ...typography.labelLg },
  drawerFooter: { marginTop: 'auto', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, paddingBottom: spacing.md },

  // ── Header bar buttons ─────────────────────────
  menuButton: { marginLeft: spacing.lg, padding: spacing.xxs },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notifButton: { marginRight: spacing.lg, padding: spacing.xxs, position: 'relative' },
  badge: { 
    position: 'absolute', top: -2, right: -2, 
    backgroundColor: palette.warning, borderRadius: radii.full, 
    width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { ...typography.caption, fontWeight: '800', color: '#000' },

  // ── Coupon Wallet Modal ─────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContainer: { height: '70%', borderTopLeftRadius: radii['2xl'], borderTopRightRadius: radii['2xl'] },
  modalHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: spacing.xl, borderBottomWidth: 1,
  },
  modalTitle: { ...typography.headingLg },
  emptyWallet: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  couponItem: {
    flexDirection: 'row', borderRadius: radii.xl, marginBottom: spacing.md,
    padding: spacing.md, alignItems: 'center',
  },
  couponLeft: { flex: 1 },
  couponProduct: { ...typography.labelLg, marginBottom: 2 },
  couponName: { ...typography.bodyMd, marginBottom: spacing.xxs },
  couponCode: { ...typography.caption },
  couponRight: { alignItems: 'center', justifyContent: 'center', marginLeft: spacing.md },
  useBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radii.md },
  useBtnText: { color: '#FFF', ...typography.labelSm },
  dismissBtn: { position: 'absolute' as const, top: spacing.sm, right: spacing.sm, zIndex: 10 },

  // ── POS Modal ───────────────────────────────────
  posModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  posModalBox: { width: '90%', padding: spacing['2xl'], borderRadius: radii['2xl'], alignItems: 'center' },
  posModalTitle: { fontSize: 22, fontWeight: '900' as const, letterSpacing: 1 },
  posCodeContainer: { 
    width: '100%', padding: spacing.xl, 
    borderRadius: radii.xl, borderWidth: 2, 
    borderStyle: 'dashed', alignItems: 'center', marginBottom: spacing['2xl'],
  },
  posProductText: { ...typography.headingMd },
  posDiscountText: { ...typography.headingSm, marginBottom: spacing.md },
  dashedLine: { width: '100%', height: 1, marginVertical: spacing.lg },
  posLabel: { ...typography.caption, letterSpacing: 2, marginBottom: spacing.xxs },
  posCodeText: { fontSize: 36, fontWeight: '800' as const, letterSpacing: 4 },
});