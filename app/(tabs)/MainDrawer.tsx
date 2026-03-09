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
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- IMPORTS ---
import TabNavigator from './TabNavigator';
import FAQScreen from './FAQ';
import Profile from './Profile';
import Login from './Auth/Login';
import Signup from './Auth/Signup';
import ForgotPassword from './Auth/ForgotPassword';
import PrivacyPolicy from '../(tabs)/PrivacyPolicy';
import TermsAndConditions from '../(tabs)/TermsAndConditions';
import AboutTab from '../(tabs)/AboutTab';

// SINGLE SOURCE OF TRUTH — consume context, never re-declare state
import { useAuth, Coupon } from '../context/AuthContext';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from './FeedbackModal';

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
  const isDarkMode = scheme === 'dark';
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
      contentContainerStyle={[styles.drawerContent, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/Logo2.jpg')}
            style={{ width: 140, height: 140, borderRadius: 10 }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.menuSection}>
          {isLoggedIn && (
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]} onPress={() => handleMenuPress('Profile')}>
              <Ionicons name="person-outline" size={24} color={isDarkMode ? '#BDBDBD' : '#757575'} />
              <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#616161' : '#BDBDBD'} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]} onPress={() => handleMenuPress('FAQ')}>
            <Ionicons name="help-circle-outline" size={24} color={isDarkMode ? '#BDBDBD' : '#757575'} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>FAQ</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#616161' : '#BDBDBD'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#E0E0E0' }]} onPress={toggleSettings}>
            <Ionicons name="settings-outline" size={24} color={isDarkMode ? '#BDBDBD' : '#757575'} />
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>Settings</Text>
            <Ionicons name={settingsOpen ? 'chevron-up' : 'chevron-down'} size={20} color={isDarkMode ? '#616161' : '#BDBDBD'} />
          </TouchableOpacity>

          {settingsOpen && (
            <View style={styles.subMenu}>
              <TouchableOpacity style={styles.subMenuItem} onPress={() => handleMenuPress('PrivacyPolicy')}>
                <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subMenuItem} onPress={() => handleMenuPress('TermsAndConditions')}>
                <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>Terms & Conditions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subMenuItem} onPress={() => handleMenuPress('About')}>
                <Text style={[styles.subMenuText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>About</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isLoggedIn && (
          <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.navigate('Tabs' as never)}>
            <Ionicons name="arrow-back-circle" size={26} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Home</Text>
          </TouchableOpacity>
        )}

        <View style={styles.drawerFooter}>
          {isLoggedIn ? (
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F5F5F5' }]} onPress={() => handleMenuPress('Logout')}>
              <Ionicons name="log-out-outline" size={24} color="#B71C1C" />
              <Text style={[styles.logoutButtonText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginButtonBottom} onPress={() => props.navigation.navigate('Login' as never)}>
              <Ionicons name="log-in-outline" size={24} color="#FFFFFF" />
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
  const isDarkMode = scheme === 'dark';

  // All auth state now comes from the single AuthContext
  const {
    isLoggedIn,
    isAuthLoading,
    claimedCoupons,
    removeFromWallet,
    fetchMyCoupons,
    isCouponRefreshing,
  } = useAuth();

  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [posModalVisible, setPosModalVisible] = useState(false);
  const [selectedPosCoupon, setSelectedPosCoupon] = useState<Coupon | null>(null);
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

  // Auto-refresh coupons when wallet modal opens
  useEffect(() => {
    if (couponModalVisible && isLoggedIn) {
      fetchMyCoupons(false);
    }
  }, [couponModalVisible, isLoggedIn, fetchMyCoupons]);

  // Helper to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRemoveCoupon = (couponId: number) => {
    showFeedback(
      'Remove Coupon',
      'Are you sure you want to remove this coupon from your wallet?',
      'warning',
      [
        { label: 'Cancel', style: 'secondary' },
        { label: 'Remove', style: 'danger', onPress: async () => { await removeFromWallet(couponId); } },
      ]
    );
  };

  const openPosModal = (item: Coupon) => {
    setSelectedPosCoupon(item);
    setPosModalVisible(true);
  };

  const renderCouponItem = ({ item }: { item: Coupon }) => {
    const isRedeemed = item.status === 'Redeemed';
    const isExpired = item.status === 'Expired';
    const isDisabled = isRedeemed || isExpired;

    const buttonLabel = isRedeemed ? 'USED' : isExpired ? 'EXPIRED' : 'USE NOW';
    const buttonStyle = isRedeemed ? styles.redeemedBtn : isExpired ? styles.expiredBtn : undefined;

    return (
      <View style={[styles.couponItem, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF', opacity: isDisabled ? 0.7 : 1 }]}>
        {isDisabled && (
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => handleRemoveCoupon(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={26} color="#9E9E9E" />
          </TouchableOpacity>
        )}

        <View style={styles.couponLeft}>
          <Text style={[styles.couponProduct, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>{item.product_name}</Text>
          <Text style={[styles.couponName, { color: isDarkMode ? '#BBB' : '#555' }]}>{item.name}</Text>
          <Text style={styles.couponCode}>Discount: <Text style={{fontWeight:'bold'}}>{item.rate === 'FREE' ? 'FREE ITEM' : `${item.rate} OFF`}</Text></Text>
          
          {item.expiration && (
             <Text style={{fontSize: 11, color: isDarkMode ? '#888' : '#757575', marginTop: 4}}>
                Expires: {formatDate(item.expiration)}
             </Text>
          )}

          {isRedeemed && <Text style={{fontSize: 10, color: '#757575', marginTop: 4, fontWeight:'bold'}}>STATUS: REDEEMED</Text>}
          {isExpired && <Text style={{fontSize: 10, color: '#FF6F00', marginTop: 4, fontWeight:'bold'}}>STATUS: EXPIRED</Text>}
        </View>
        <View style={styles.couponRight}>
           <TouchableOpacity 
              style={[styles.useBtn, buttonStyle]} 
              onPress={() => !isDisabled && openPosModal(item)}
              disabled={isDisabled} 
           >
              <Text style={styles.useBtnText}>{buttonLabel}</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isAuthLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
        <ActivityIndicator size="large" color="#B71C1C" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={isDarkMode ? '#1C1C1E' : '#B71C1C'} translucent={false} />
      
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} showFeedback={showFeedback} />}
        screenOptions={{
          headerShown: true,
          drawerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF', width: 280 },
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
              <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
                <Ionicons name="menu" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            ),
            headerRight: () => (
                isLoggedIn ? (
                <TouchableOpacity onPress={() => setCouponModalVisible(true)} style={styles.notifButton}>
                    <Ionicons name="notifications" size={24} color="#FFFFFF" />
                    {claimedCoupons.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{claimedCoupons.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                ) : null
            ),
            headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' },
            headerTintColor: '#FFFFFF'
          })}
        />

        <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerTitle: 'Privacy Policy', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="TermsAndConditions" component={TermsAndConditions} options={{ headerTitle: 'Terms & Conditions', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="About" component={AboutTab} options={{ headerTitle: 'About', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Login" component={Login} options={{ headerTitle: 'Login', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Signup" component={Signup} options={{ headerTitle: 'Sign Up', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerTitle: 'Forgot Password', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="Profile" component={Profile} options={{ headerTitle: 'Profile', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF', drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="FAQ" component={FAQScreen} options={{ headerTitle: 'FAQ', headerStyle: { backgroundColor: isDarkMode ? '#1C1C1E' : '#B71C1C' }, headerTintColor: '#FFFFFF' }} />
      </Drawer.Navigator>

      {/* Coupon Wallet Modal */}
      <Modal
        visible={couponModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCouponModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5' }]}>
                <View style={[styles.modalHeader, { borderBottomColor: isDarkMode ? '#333' : '#DDD' }]}>
                    <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>My Coupon Wallet</Text>
                    <TouchableOpacity onPress={() => setCouponModalVisible(false)}>
                        <Ionicons name="close-circle" size={30} color={isDarkMode ? '#FFF' : '#333'} />
                    </TouchableOpacity>
                </View>

                {claimedCoupons.length === 0 ? (
                    <View style={styles.emptyWallet}>
                          <Ionicons name="ticket-outline" size={60} color="#CCC" />
                          <Text style={{color: '#999', marginTop: 10}}>No coupons collected yet.</Text>
                    </View>
                ) : (
                    <FlatList 
                        data={claimedCoupons}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCouponItem}
                        contentContainerStyle={{padding: 16}}
                        refreshControl={
                            <RefreshControl 
                                refreshing={isCouponRefreshing} 
                                onRefresh={() => fetchMyCoupons(true)} 
                                colors={['#B71C1C']} 
                            />
                        }
                    />
                )}
            </View>
        </View>
      </Modal>

      {/* POS Redemption Modal */}
      <Modal
        visible={posModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPosModalVisible(false)}
      >
        <View style={styles.posModalOverlay}>
            <View style={[styles.posModalBox, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
                <Text style={[styles.posModalTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>POS REDEMPTION</Text>
                <Text style={{color: '#888', marginBottom: 20}}>Show this screen to the cashier</Text>

                <View style={styles.posCodeContainer}>
                    <Text style={styles.posProductText}>{selectedPosCoupon?.product_name}</Text>
                    <Text style={styles.posDiscountText}>{selectedPosCoupon?.rate === 'FREE' ? 'FREE ITEM' : `${selectedPosCoupon?.rate} OFF`}</Text>
                    
                    <View style={styles.dashedLine} />
                    
                    <Text style={styles.posLabel}>COUPON CODE</Text>
                    <Text style={styles.posCodeText}>{selectedPosCoupon?.code}</Text>
                </View>

                <TouchableOpacity 
                    style={{marginTop: 15, padding: 15}}
                    onPress={() => setPosModalVisible(false)}
                >
                    <Text style={{color: isDarkMode ? '#CCC' : '#555', fontSize: 16, fontWeight: 'bold'}}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

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
  drawerContent: { flex: 1 },
  drawerHeader: { padding: 30, alignItems: 'center' },
  drawerHeaderText: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  drawerHeaderSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  userInfoContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)', width: '100%', alignItems: 'center' },
  userInfoText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  menuSection: { paddingHorizontal: 16, marginTop: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  menuItemText: { flex: 1, fontSize: 16, fontWeight: '600', marginLeft: 16 },
  subMenu: { marginLeft: 50, marginTop: -5, marginBottom: 10 },
  subMenuItem: { paddingVertical: 10 },
  subMenuText: { fontSize: 15 },
  backButton: { marginTop: 20, backgroundColor: '#B71C1C', marginHorizontal: 16, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 10, alignItems: 'center' },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  logoutButton: { marginHorizontal: 16, paddingVertical: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: '#B71C1C', width: '100%' },
  logoutButtonText: { fontSize: 16, fontWeight: '700' },
  loginButtonBottom: { backgroundColor: '#B71C1C', paddingVertical: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 10, alignItems: 'center', width: '100%' },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  drawerFooter: { marginTop: 'auto', paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 10 },
  footerText: { fontSize: 12, marginVertical: 2 },
  menuButton: { marginLeft: 15, padding: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  notifButton: { marginRight: 15, padding: 4, position: 'relative' },
  badge: { 
    position: 'absolute', top: 0, right: 0, 
    backgroundColor: '#FFCC00', borderRadius: 8, 
    width: 16, height: 16, justifyContent: 'center', alignItems: 'center' 
  },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { height: '70%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, borderBottomWidth: 1 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  emptyWallet: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  couponItem: {
    flexDirection: 'row', borderRadius: 12, marginBottom: 12,
    elevation: 2, padding: 12, alignItems: 'center'
  },
  couponLeft: { flex: 1 },
  couponProduct: { fontSize: 16, fontWeight: 'bold' },
  couponName: { fontSize: 14, marginBottom: 4 },
  couponCode: { fontSize: 12, color: '#777' },
  couponRight: { alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  useBtn: { backgroundColor: '#B71C1C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  redeemedBtn: { backgroundColor: '#9E9E9E' },
  expiredBtn: { backgroundColor: '#757575' },
  dismissBtn: { position: 'absolute' as const, top: 8, right: 8, zIndex: 10 }, 
  useBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  posModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  posModalBox: { width: '90%', padding: 25, borderRadius: 20, alignItems: 'center', elevation: 10 },
  posModalTitle: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  posCodeContainer: { 
    width: '100%', backgroundColor: '#F9F9F9', padding: 20, 
    borderRadius: 15, borderWidth: 2, borderColor: '#DDD', 
    borderStyle: 'dashed', alignItems: 'center', marginBottom: 25 
  },
  posProductText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  posDiscountText: { fontSize: 18, color: '#B71C1C', fontWeight: 'bold', marginBottom: 10 },
  dashedLine: { width: '100%', height: 1, backgroundColor: '#CCC', marginVertical: 15 },
  posLabel: { fontSize: 12, color: '#999', letterSpacing: 2, marginBottom: 5 },
  posCodeText: { fontSize: 36, fontWeight: 'bold', color: '#000', letterSpacing: 4 },
  posDoneButton: { 
    flexDirection: 'row', gap: 10, backgroundColor: '#2E7D32', 
    paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, 
    alignItems: 'center', elevation: 5 
  },
  posDoneText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
