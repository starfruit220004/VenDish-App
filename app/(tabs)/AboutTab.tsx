import React, { useCallback, useState } from 'react';
import {View,Text,StyleSheet,ScrollView,useColorScheme,TouchableOpacity,Linking,ActivityIndicator,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';

type AboutApiRecord = {
  id?: number;
  open_hours?: string;
};

type ContactApiRecord = {
  id?: number;
  phone_number?: string;
  email?: string;
  address?: string;
};

const DEFAULT_INFO = {
  location: 'Zamboanga City\nZamboanga Peninsula\nPhilippines',
  operatingHours: 'Everyday: 7:00 AM – 10:00 PM',
  phone: '+63 123 456 7890',
  email: 'info@kuyavince.com',
};

const getLatestRecord = <T extends object>(data: T[] | T | null | undefined): T | null => {
  if (Array.isArray(data)) {
    return data[data.length - 1] || null;
  }
  if (data && typeof data === 'object') {
    return data;
  }
  return null;
};

const toDialNumber = (rawPhone: string) => rawPhone.replace(/[^\d+]/g, '');

export default function AboutTab() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchAppAboutInfo = async () => {
        setLoadingInfo(true);
        try {
          const [aboutRes, contactRes] = await Promise.all([
            api.get('/firstapp/about/'),
            api.get('/firstapp/contact-page/'),
          ]);

          const aboutData = getLatestRecord<AboutApiRecord>(aboutRes.data);
          const contactData = getLatestRecord<ContactApiRecord>(contactRes.data);

          if (!isMounted) {
            return;
          }

          setInfo((prev) => ({
            location: contactData?.address || prev.location,
            operatingHours: aboutData?.open_hours || prev.operatingHours,
            phone: contactData?.phone_number || prev.phone,
            email: contactData?.email || prev.email,
          }));
        } catch (error) {
          console.error('Failed to fetch About tab CMS data:', error);
        } finally {
          if (isMounted) {
            setLoadingInfo(false);
          }
        }
      };

      fetchAppAboutInfo();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleContact = async (type: string) => {
    const dialPhone = toDialNumber(info.phone);
    const url = type === 'phone' ? `tel:${dialPhone}` : `mailto:${info.email}`;

    switch (type) {
      case 'phone':
      case 'email': {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          }
        } catch (error) {
          console.error('Failed to open contact link:', error);
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name="restaurant"
          size={80}
          color={isDarkMode ? '#FF5252' : '#B71C1C'}
        />
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          { color: isDarkMode ? '#FFFFFF' : '#212121' },
        ]}
      >
        Kuya Vince Carenderia
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: isDarkMode ? '#BDBDBD' : '#757575' },
        ]}
      >
        Authentic Filipino Cuisine
      </Text>

      {/* About Section */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          Our Story
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          Founded in 2015, Kuya Vince Carenderia has been serving delicious, homestyle Filipino meals to the community of Zamboanga. What started as a small family-run eatery has grown into a beloved local institution, known for our authentic recipes passed down through generations.
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242', marginTop: 12 }]}>
          We pride ourselves on using fresh, locally-sourced ingredients and traditional cooking methods to bring you the taste of home-cooked Filipino comfort food.
        </Text>
      </View>

      {/* Mission Section */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          Our Mission
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          To serve affordable, delicious Filipino meals that bring families and friends together, while preserving and celebrating our rich culinary heritage.
        </Text>
      </View>

      {/* Location Section */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          <Ionicons name="location" size={20} /> Location
        </Text>
        {loadingInfo ? (
          <ActivityIndicator size="small" color={isDarkMode ? '#FF5252' : '#B71C1C'} />
        ) : (
          <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
            {info.location}
          </Text>
        )}
      </View>

      {/* Hours Section */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          <Ionicons name="time" size={20} /> Operating Hours
        </Text>
        <View style={styles.hoursContainer}>
          {loadingInfo ? (
            <ActivityIndicator size="small" color={isDarkMode ? '#FF5252' : '#B71C1C'} />
          ) : (
            <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
              {info.operatingHours}
            </Text>
          )}
        </View>
      </View>

      {/* Contact Section */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          Get In Touch
        </Text>
        
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContact('phone')}
          activeOpacity={0.7}
        >
          <Ionicons name="call" size={24} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
          {loadingInfo ? (
            <ActivityIndicator size="small" color={isDarkMode ? '#FF5252' : '#B71C1C'} />
          ) : (
            <Text style={[styles.contactText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
              {info.phone}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContact('email')}
          activeOpacity={0.7}
        >
          <Ionicons name="mail" size={24} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
          {loadingInfo ? (
            <ActivityIndicator size="small" color={isDarkMode ? '#FF5252' : '#B71C1C'} />
          ) : (
            <Text style={[styles.contactText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
              {info.email}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
          App Version 1.0.0
        </Text>
        <Text style={[styles.versionText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
          Made with ❤️ kahit pagod na.
        </Text>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  hoursContainer: {
    marginTop: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  versionText: {
    fontSize: 12,
    marginVertical: 2,
  },
  bottomSpace: {
    height: 40,
  },
});
