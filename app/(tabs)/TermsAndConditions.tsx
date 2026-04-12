import React, { useCallback, useState } from 'react';
import {View,Text,StyleSheet,ScrollView,useColorScheme,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';
import CollapsibleSection from './CollapsibleSection';

type ContactApiRecord = {
  id?: number;
  phone_number?: string;
  email?: string;
  address?: string;
};

type AboutApiRecord = {
  id?: number;
  open_hours?: string;
};

const DEFAULT_CONTACT_INFO = {
  email: 'kuyavince@gmail.com',
  phone: '+63 123 456 7890',
  location: 'Zamboanga, Philippines',
  operatingHours: 'Everyday: 7:00 AM – 10:00 PM',
};

const getLatestRecord = <T extends object>(
  data: T[] | T | null | undefined
): T | null => {
  if (Array.isArray(data)) {
    return data[data.length - 1] || null;
  }
  if (data && typeof data === 'object') {
    return data;
  }
  return null;
};

export default function TermsAndConditions() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACT_INFO);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchContactInfo = async () => {
        try {
          const [contactResponse, aboutResponse] = await Promise.all([
            api.get('/firstapp/contact-page/'),
            api.get('/firstapp/about/'),
          ]);

          const contactData = getLatestRecord<ContactApiRecord>(contactResponse.data);
          const aboutData = getLatestRecord<AboutApiRecord>(aboutResponse.data);

          if (!isMounted) {
            return;
          }

          setContactInfo((prev) => ({
            email: contactData?.email || prev.email,
            phone: contactData?.phone_number || prev.phone,
            location: contactData?.address || prev.location,
            operatingHours: aboutData?.open_hours || prev.operatingHours,
          }));
        } catch (error) {
          console.error('Failed to fetch Terms contact info:', error);
        }
      };

      fetchContactInfo();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000000' : 'transparent' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header*/}
      <View style={styles.iconContainer}>
        <Ionicons
          name="document-text"
          size={64}
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
        Terms & Conditions
      </Text>

      <Text
        style={[
          styles.lastUpdated,
          { color: isDarkMode ? '#BDBDBD' : '#757575' },
        ]}
      >
        Last Updated: November 19, 2024
      </Text>

      <CollapsibleSection title="1. Acceptance of Terms">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          By accessing and using the Kuya Vince Carenderia mobile application, you accept and agree to be bound by these Terms and Conditions.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="2. Use of Service">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          You agree to use our app only for lawful purposes and in accordance with these Terms.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="3. User Accounts">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          You are responsible for maintaining the confidentiality of your account credentials.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="4. Promotions and Discounts">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          Promotional offers are subject to specific terms and conditions and may change at any time.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="5. Food Safety and Allergies">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We cannot guarantee that our products are free from allergens.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="6. Intellectual Property">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          All content on this app is the property of Kuya Vince Carenderia.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="7. Limitation of Liability">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We are not liable for indirect or consequential damages.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="8. Contact Information" defaultExpanded>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          For questions about these Terms, contact us:
        </Text>
        <Text style={[styles.contactText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          Email: {contactInfo.email}{'\n'}
          Phone: {contactInfo.phone}{'\n'}
          Location: {contactInfo.location}{'\n'}
          Operating Hours: {contactInfo.operatingHours}
        </Text>
      </CollapsibleSection>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  iconContainer: { alignItems: 'center', marginVertical: 5 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  lastUpdated: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  sectionText: { fontSize: 15, lineHeight: 22 },
  contactText: { fontSize: 15, lineHeight: 22, marginTop: 8, fontWeight: '600' },
  bottomSpace: { height: 40 },
});
