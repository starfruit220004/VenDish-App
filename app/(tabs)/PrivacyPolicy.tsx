// app/(tabs)/PrivacyPolicy.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicy() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

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

      {/* Content Sections */}
      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          1. Information We Collect
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We collect information you provide directly to us, including your name, email address, phone number, and order preferences when you create an account or place an order.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          2. How We Use Your Information
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We use the information we collect to process your orders, communicate with you about your orders and promotions, improve our services, and personalize your experience with our app.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          3. Information Sharing
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our business, such as payment processors and delivery services.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          4. Data Security
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          5. Your Rights
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          You have the right to access, update, or delete your personal information at any time. You can also opt out of promotional communications by contacting us or using the unsubscribe link in our emails.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          6. Cookies and Tracking
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We use cookies and similar tracking technologies to enhance your experience, analyze app usage, and deliver personalized content. You can manage your cookie preferences through your device settings.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          7. Children's Privacy
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          8. Changes to This Policy
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </Text>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          9. Contact Us
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={[styles.contactText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          Email: privacy@kuyavince.com{'\n'}
          Phone: +63 123 456 7890
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
  lastUpdated: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
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