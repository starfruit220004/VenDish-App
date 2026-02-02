import React, { useContext, useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme, 
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import api from '../../api/api'; 

// IMPORT CONTEXT
import { AuthContext, Coupon } from '../context/AuthContext'; 

const ACCESS_TOKEN_KEY = '@access_token'; 

type DrawerParamList = {
  Tabs: undefined;
  Login: { redirect?: string; promoId?: string; promoTitle?: string };
  Signup: { redirect?: string; promoId?: string; promoTitle?: string };
  ForgotPassword: undefined;
};

type PromoNavigationProp = DrawerNavigationProp<DrawerParamList>;

export default function Promos() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const navigation = useNavigation<PromoNavigationProp>();
  
  const { isLoggedIn, userData, addToWallet, claimedCoupons, logout } = useContext(AuthContext); 

  const [promos, setPromos] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Coupon | null>(null);

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/firstapp/coupons/'); 
      
      const formattedData = response.data.map((item: any) => ({
        ...item,
        status: item.status || 'Active', 
        description: item.description || `Enjoy this exclusive ${item.name} deal!`,
        terms: item.terms || 'Valid for dine-in only. One use per customer.',
      }));

      setPromos(formattedData);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCoupons();
  }, []);

  const handleClaimPromo = async (promo: Coupon) => {
    if (isLoggedIn) {
      try {
        // ✅ 1. Get Token
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

        if (!token) {
            Alert.alert("Error", "Authentication token not found. Please login again.");
            logout();
            return;
        }

        // ✅ 2. Send with Headers
        await api.post(
            `firstapp/coupons/${promo.id}/claim/`, 
            {}, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // 3. Update the local state
        setPromos(prevPromos => 
          prevPromos.map(p => 
            p.id === promo.id ? { ...p, status: 'Claimed' as const } : p
          )
        );

        // 4. Update Context/Wallet
        const updatedPromo: Coupon = { ...promo, status: 'Claimed' };
        
        setSelectedPromo(updatedPromo);
        await addToWallet(updatedPromo);
        
        setClaimModalVisible(true);
    
      } catch (error: any) {
        console.error("Claim error:", error);
        
        // ✅ 3. Handle 401
        if (error.response && error.response.status === 401) {
            Alert.alert("Session Expired", "Please login again to claim this reward.");
            logout(); 
            return;
        }

        const errorMessage = error.response?.data?.error || "Unable to claim coupon. Please try again.";
        Alert.alert("Error", errorMessage);
      }
    } else {
      setSelectedPromo(promo);
      setAuthModalVisible(true);
    }
  };

  const handleLoginPress = () => {
    setAuthModalVisible(false);
    if (selectedPromo) {
      navigation.navigate('Login', {
        redirect: 'promo-claim',
        promoId: selectedPromo.id.toString(),
        promoTitle: selectedPromo.product_name,
      });
    }
  };

  const handleSignupPress = () => {
    setAuthModalVisible(false);
    if (selectedPromo) {
      navigation.navigate('Signup', {
        redirect: 'promo-claim',
        promoId: selectedPromo.id.toString(),
        promoTitle: selectedPromo.product_name, 
      });
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount: string) => {
    return `₱${parseFloat(amount).toFixed(0)}`; 
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
        <ActivityIndicator size="large" color="#B71C1C" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.scroll, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]} 
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#B71C1C']} />
      }
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>
          🎉 Available Promos
        </Text>
        <Text style={[styles.subheader, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
          {isLoggedIn 
            ? `Welcome ${userData?.username || 'back'}! Tap to claim your exclusive deals!` 
            : 'Login or sign up to claim exclusive deals'}
        </Text>
      </View>

      {promos.length === 0 ? (
        <View style={styles.emptyState}>
            <Text style={{ color: isDarkMode ? '#FFF' : '#000' }}>No active promos at the moment.</Text>
        </View>
      ) : (
        promos.map(promo => {
          const isLocallyClaimed = claimedCoupons.some(c => c.id === promo.id);
          const status = promo.status ? promo.status.toLowerCase() : 'active';
          
          const isRedeemed = status === 'redeemed';
          const isClaimed = status === 'claimed' || isLocallyClaimed;
          
          const isUnavailable = isRedeemed || isClaimed;

          let buttonText = 'Claim Now';
          let iconName: keyof typeof Ionicons.glyphMap = 'checkmark-circle-outline';

          if (isRedeemed) {
            buttonText = 'Redeemed';
            iconName = 'checkmark-circle-sharp';
          } else if (isClaimed) {
            buttonText = 'Claimed'; 
            iconName = 'checkmark-circle-sharp';
          } else if (!isLoggedIn) {
            buttonText = 'Login to Claim';
            iconName = 'lock-closed';
          }

          return (
            <View 
              key={promo.id} 
              style={[styles.promoCard, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}
            >
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{formatCurrency(promo.rate)} OFF</Text>
              </View>
              
              <View style={styles.promoInfo}>
                <Text style={[styles.promoTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                  {promo.product_name}
                </Text>
                
                <Text style={[styles.promoSubtitle, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
                  {promo.name}
                </Text>

                <Text style={[styles.promoDesc, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                  {promo.description}
                </Text>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="information-circle-outline" size={16} color={isDarkMode ? '#9E9E9E' : '#757575'} />
                    <Text style={[styles.termsText, { color: isDarkMode ? '#9E9E9E' : '#757575' }]}>
                      {promo.terms}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={isDarkMode ? '#9E9E9E' : '#757575'} />
                    <Text style={[styles.expiryText, { color: isDarkMode ? '#9E9E9E' : '#757575' }]}>
                      Expires: {formatDate(promo.expiration)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.claimButton,
                    !isLoggedIn && styles.claimButtonGuest,
                    isUnavailable && styles.disabledButton 
                  ]} 
                  onPress={() => !isUnavailable && handleClaimPromo(promo)} 
                  activeOpacity={0.8}
                  disabled={isUnavailable}
                >
                  <Text style={styles.claimButtonText}>
                    {buttonText}
                  </Text>
                  <Ionicons 
                    name={iconName}
                    size={20} 
                    color="#FFF" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {!isLoggedIn && (
        <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF3E0' }]}>
          <Ionicons name="lock-closed" size={32} color="#B71C1C" />
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoBannerTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              Account Required
            </Text>
            <Text style={[styles.infoBannerDesc, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              Create an account or log in to unlock exclusive deals!
            </Text>
          </View>
          <View style={styles.bannerButtonContainer}>
            <TouchableOpacity 
              style={[styles.loginBannerButton, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF', borderColor: isDarkMode ? '#FF5252' : '#B71C1C' }]}
              onPress={() => navigation.navigate('Login', {})}
            >
              <Text style={[styles.loginBannerButtonText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signupBannerButton}
              onPress={() => navigation.navigate('Signup', {})}
            >
              <Text style={styles.signupBannerButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={authModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
            <Ionicons name="lock-closed" size={64} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Account Required
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              You need to have an account to claim:{'\n\n'}
              <Text style={{fontWeight: 'bold'}}>{selectedPromo?.product_name}</Text>
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalCancelButton, { borderColor: isDarkMode ? '#757575' : '#9E9E9E' }]}
                onPress={() => setAuthModalVisible(false)}
              >
                <Text style={[styles.modalCancelButtonText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionButton, { backgroundColor: '#B71C1C' }]}
                onPress={handleLoginPress}
              >
                <Text style={styles.modalActionButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={claimModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
            <Ionicons name="checkmark-circle" size={64} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Success! 🎉
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              You claimed the offer for:{'\n'}
              <Text style={{fontWeight: 'bold', fontSize: 18}}>{selectedPromo?.product_name}</Text>{'\n'}
              ({selectedPromo?.name})
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              Code: {selectedPromo?.code}
            </Text>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#B71C1C' }]}
              onPress={() => setClaimModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { marginBottom: 24, alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subheader: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  promoCard: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4,
    position: 'relative',
    paddingTop: 40, 
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#B71C1C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
  },
  discountText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  promoInfo: { padding: 16, paddingTop: 8 },
  promoTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 4,
    paddingRight: 80, 
  },
  promoSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  promoDesc: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  detailsContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(158, 158, 158, 0.2)',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  termsText: { fontSize: 13, marginLeft: 6, flex: 1 },
  expiryText: { fontSize: 13, marginLeft: 6 },
  claimButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B71C1C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
  },
  claimButtonGuest: { backgroundColor: '#757575' },
  disabledButton: { backgroundColor: '#9E9E9E' },
  claimButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  infoBanner: {
    marginTop: 10, marginBottom: 10, padding: 20, borderRadius: 16, alignItems: 'center', elevation: 2,
  },
  infoBannerText: { alignItems: 'center', marginTop: 12, marginBottom: 16 },
  infoBannerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  infoBannerDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  bannerButtonContainer: { flexDirection: 'row', gap: 12, width: '100%' },
  loginBannerButton: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 2, alignItems: 'center',
  },
  loginBannerButtonText: { fontSize: 16, fontWeight: 'bold' },
  signupBannerButton: {
    flex: 1, backgroundColor: '#B71C1C', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center',
  },
  signupBannerButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    width: '85%', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalButtonContainer: { width: '100%', gap: 10 },
  modalCancelButton: { paddingVertical: 12, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  modalCancelButtonText: { fontSize: 16, fontWeight: 'bold' },
  modalActionButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalActionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalButton: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12, minWidth: 120 },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  emptyState: { padding: 20, alignItems: 'center', justifyContent: 'center' }
});