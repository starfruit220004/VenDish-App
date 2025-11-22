import React, { useContext } from 'react';
import { View, Text, Alert, ScrollView, Image, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AuthContext } from './MainDrawer'; 

const samplePromos = [
  { 
    id: '1', 
    title: '50% Off Halo-Halo', 
    description: 'Get half off on Halo-Halo this summer!', 
    discount: '50% OFF',
    expiryDate: 'Dec 31, 2024',
    terms: 'Valid for dine-in only. One use per customer.',
    image: require('../../assets/images/halohalo.jpg') 
  },
  { 
    id: '2', 
    title: 'Free Siomai', 
    description: 'Buy 1 Siomai, get 1 free!', 
    discount: 'BOGO',
    expiryDate: 'Jan 15, 2025',
    terms: 'Valid on orders above ₱200.',
    image: require('../../assets/images/siomai.jpg') 
  },
  { 
    id: '3', 
    title: 'Leche Flan Promo', 
    description: 'Enjoy creamy Leche Flan with any main course.', 
    discount: 'FREE DESSERT',
    expiryDate: 'Jan 31, 2025',
    terms: 'With purchase of any main course.',
    image: require('../../assets/images/leche.jpg') 
  },
];

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
  const { isLoggedIn, userData } = useContext(AuthContext);

  // Handle promo claim - ONLY for logged in users
  const handleClaimPromo = (promo: typeof samplePromos[0]) => {
    if (isLoggedIn) {
      claimPromo(promo);
    } else {
      // Show alert with options to Login or Sign Up
      Alert.alert(
        '🔐 Account Required',
        `You need to have an account to claim: ${promo.title}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => {
              navigation.navigate('Login', {
                redirect: 'promo-claim',
                promoId: promo.id,
                promoTitle: promo.title,
              });
            },
          },
          {
            text: 'Sign Up',
            onPress: () => {
              navigation.navigate('Signup', {
                redirect: 'promo-claim',
                promoId: promo.id,
                promoTitle: promo.title,
              });
            },
          },
        ]
      );
    }
  };

  const claimPromo = (promo: typeof samplePromos[0]) => {
    Alert.alert(
      'Success! 🎉',
      `${userData?.username}, you have claimed: ${promo.title}\n\n${promo.terms}\n\nExpires: ${promo.expiryDate}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView 
      style={[styles.scroll, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]} 
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>
          🔥 Current Promos
        </Text>
        <Text style={[styles.subheader, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
          {isLoggedIn 
            ? `Welcome ${userData?.username}! Tap to claim your exclusive deals!` 
            : 'Login or sign up to claim exclusive deals'}
        </Text>
      </View>

      {/* Promo Cards */}
      {samplePromos.map(promo => (
        <View 
          key={promo.id} 
          style={[styles.promoCard, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}
        >
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{promo.discount}</Text>
          </View>

          <Image source={promo.image} style={styles.promoImage} />
          
          <View style={styles.promoInfo}>
            <Text style={[styles.promoTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              {promo.title}
            </Text>
            <Text style={[styles.promoDesc, { color: isDarkMode ? '#BDBDBD' : '#424242' }]}>
              {promo.description}
            </Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons 
                  name="information-circle-outline" 
                  size={16} 
                  color={isDarkMode ? '#9E9E9E' : '#757575'} 
                />
                <Text style={[styles.termsText, { color: isDarkMode ? '#9E9E9E' : '#757575' }]}>
                  {promo.terms}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={isDarkMode ? '#9E9E9E' : '#757575'} 
                />
                <Text style={[styles.expiryText, { color: isDarkMode ? '#9E9E9E' : '#757575' }]}>
                  Expires: {promo.expiryDate}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.claimButton,
                !isLoggedIn && styles.claimButtonGuest
              ]} 
              onPress={() => handleClaimPromo(promo)} 
              activeOpacity={0.8}
            >
              <Text style={styles.claimButtonText}>
                {isLoggedIn ? 'Claim Now' : 'Login to Claim'}
              </Text>
              <Ionicons 
                name={isLoggedIn ? "checkmark-circle" : "lock-closed"} 
                size={20} 
                color="#FFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Info Banner for Non-Logged In Users */}
      {!isLoggedIn && (
        <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF3E0' }]}>
          <Ionicons name="lock-closed" size={32} color="#B71C1C" />
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoBannerTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              Account Required
            </Text>
            <Text style={[styles.infoBannerDesc, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              Create an account or log in to unlock exclusive deals and claim your favorite promos!
            </Text>
          </View>

          <View style={styles.bannerButtonContainer}>
            <TouchableOpacity 
              style={[styles.loginBannerButton, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF', borderColor: isDarkMode ? '#FF5252' : '#B71C1C' }]}
              onPress={() => navigation.navigate('Login', {})}
              activeOpacity={0.8}
            >
              <Text style={[styles.loginBannerButtonText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupBannerButton}
              onPress={() => navigation.navigate('Signup', {})}
              activeOpacity={0.8}
            >
              <Text style={styles.signupBannerButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Success Message for Logged In Users */}
      {isLoggedIn && (
        <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9' }]}>
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoBannerTitle, { color: isDarkMode ? '#81C784' : '#2E7D32' }]}>
              You're All Set!
            </Text>
            <Text style={[styles.infoBannerDesc, { color: isDarkMode ? '#A5D6A7' : '#558B2F' }]}>
              Tap any promo above to claim your exclusive deals!
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },

  headerContainer: { 
    marginBottom: 24,
    alignItems: 'center',
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subheader: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

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
  discountText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  promoImage: { 
    width: '100%', 
    height: 200,
    resizeMode: 'cover',
  },
  promoInfo: { 
    padding: 16 
  },
  promoTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  promoDesc: { 
    fontSize: 15, 
    lineHeight: 22, 
    marginBottom: 16 
  },

  detailsContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(158, 158, 158, 0.2)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  expiryText: {
    fontSize: 13,
    marginLeft: 6,
  },

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
  claimButtonGuest: {
    backgroundColor: '#757575',
  },
  claimButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFF' 
  },

  infoBanner: {
    marginTop: 10,
    marginBottom: 10,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
  },
  infoBannerText: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  infoBannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoBannerDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bannerButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  loginBannerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  loginBannerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupBannerButton: {
    flex: 1,
    backgroundColor: '#B71C1C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupBannerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});