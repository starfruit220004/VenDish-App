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
  email: 'privacy@kuyavince.com',
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

export default function PrivacyPolicy() {
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
          console.error('Failed to fetch Privacy Policy contact info:', error);
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
      {/* Header Icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name="shield-checkmark"
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
        Privacy Policy
      </Text>

      <Text
        style={[
          styles.lastUpdated,
          { color: isDarkMode ? '#BDBDBD' : '#757575' },
        ]}
      >
        Last Updated: November 19, 2024
      </Text>

      <CollapsibleSection title="1. Information We Collect">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We collect information you provide directly to us, including your name, email address, phone number, and order preferences when you create an account or place an order.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="2. How We Use Your Information">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We use the information we collect to process your orders, communicate with you about your orders and promotions, improve our services, and personalize your experience with our app.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="3. Information Sharing">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our business, such as payment processors and delivery services.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="4. Data Security">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="5. Your Rights">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          You have the right to access, update, or delete your personal information at any time. You can also opt out of promotional communications by contacting us or using the unsubscribe link in our emails.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="6. Cookies and Tracking">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We use cookies and similar tracking technologies to enhance your experience, analyze app usage, and deliver personalized content. You can manage your cookie preferences through your device settings.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="7. Children's Privacy">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="8. Changes to This Policy">
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the Last Updated date.
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="9. Contact Us" defaultExpanded>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={[styles.contactText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          Email: {contactInfo.email}{'\n'}
          Phone: {contactInfo.phone}{'\n'}
          Location: {contactInfo.location}{'\n'}
          Operating Hours: {contactInfo.operatingHours}
        </Text>
      </CollapsibleSection>

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
    marginVertical: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 40,
  },
});