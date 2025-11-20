import React, { useContext } from 'react';
import { View, Text, Alert, ScrollView, Image, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AuthContext } from './MainDrawer'; 

const samplePromos = [
  { id: 1, title: '50% Off Halo-Halo', description: 'Get half off on Halo-Halo this summer!', image: require('../../assets/images/halohalo.jpg') },
  { id: 2, title: 'Free Siomai', description: 'Buy 1 Siomai, get 1 free!', image: require('../../assets/images/siomai.jpg') },
  { id: 3, title: 'Leche Flan Promo', description: 'Enjoy creamy Leche Flan with any main course.', image: require('../../assets/images/leche.jpg') },
];

type DrawerParamList = {
  Tabs: undefined;
  Login: { redirect?: string; promoTitle?: string };
  Signup: undefined;
  ForgotPassword: undefined;
};

type PromoNavigationProp = DrawerNavigationProp<DrawerParamList>;

export default function Promos() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const navigation = useNavigation<PromoNavigationProp>();
  const { isLoggedIn } = useContext(AuthContext);

  const handleClaimPromo = (title: string) => {
    if (isLoggedIn) {
      Alert.alert('Promo Claimed', `You claimed: ${title}`);
    } else {
      navigation.navigate('Login', { redirect: 'Promos', promoTitle: title });
    }
  };

  return (
    <ScrollView 
      style={[styles.scroll, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]} 
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.header, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>
        🔥 Current Promos
      </Text>
      {samplePromos.map(promo => (
        <View 
          key={promo.id} 
          style={[styles.promoCard, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}
        >
          <Image source={promo.image} style={styles.promoImage} />
          <View style={styles.promoInfo}>
            <Text style={[styles.promoTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              {promo.title}
            </Text>
            <Text style={[styles.promoDesc, { color: isDarkMode ? '#BDBDBD' : '#424242' }]}>
              {promo.description}
            </Text>
            <TouchableOpacity 
              style={styles.promoButton} 
              onPress={() => handleClaimPromo(promo.title)} 
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={24} color="#B71C1C" />
              <Text style={styles.promoButtonText}>Claim Promo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  promoCard: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    marginBottom: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4 
  },
  promoImage: { width: '100%', height: 180 },
  promoInfo: { padding: 16 },
  promoTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  promoDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  promoButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoButtonText: { fontSize: 16, fontWeight: 'bold', color: '#B71C1C' },
});