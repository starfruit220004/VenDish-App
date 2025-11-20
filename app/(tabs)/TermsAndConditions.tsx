// app/(tabs)/TermsAndConditions.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsAndConditions() {
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

      {/* 1. Acceptance */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          1. Acceptance of Terms
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          By accessing and using the Kuya Vince Carenderia mobile application, you accept and agree to be bound by these Terms and Conditions.
        </Text>
      </View>

      {/* 2. Use of Service */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          2. Use of Service
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          You agree to use our app only for lawful purposes and in accordance with these Terms.
        </Text>
      </View>

      {/* 3. User Accounts */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          3. User Accounts
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          You are responsible for maintaining the confidentiality of your account credentials.
        </Text>
      </View>

      {/* 7. Promotions — FIXED SECTION */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          4. Promotions and Discounts
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          Promotional offers are subject to specific terms and conditions and may change at any time.
        </Text>
      </View>

      {/* 8. Food Safety */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          5. Food Safety and Allergies
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We cannot guarantee that our products are free from allergens.
        </Text>
      </View>

      {/* 9. Intellectual Property */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          6. Intellectual Property
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          All content on this app is the property of Kuya Vince Carenderia.
        </Text>
      </View>

      {/* 10. Liability */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          7. Limitation of Liability
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          We are not liable for indirect or consequential damages.
        </Text>
      </View>

      {/* 8. Contact */}
      <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          8. Contact Information
        </Text>
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          For questions about these Terms, contact us:
        </Text>
        <Text style={[styles.contactText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          Email: kuyavince@gmail.com{'\n'}
          Phone: +63 123 456 7890{'\n'}
          Address: Zamboanga, Philippines
        </Text>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  iconContainer: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  lastUpdated: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  sectionText: { fontSize: 15, lineHeight: 22 },
  contactText: { fontSize: 15, lineHeight: 22, marginTop: 8, fontWeight: '600' },
  bottomSpace: { height: 40 },
});
