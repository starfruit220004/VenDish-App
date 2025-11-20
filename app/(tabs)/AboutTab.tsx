import React from 'react';
import {View,Text,StyleSheet,ScrollView,useColorScheme,Image,TouchableOpacity,Linking,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AboutTab() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const handleContact = (type: string) => {
    switch (type) {
      case 'phone':
        Linking.openURL('tel:+631234567890');
        break;
      case 'email':
        Linking.openURL('mailto:info@kuyavince.com');
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
        <Text style={[styles.sectionText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
          Zamboanga City{'\n'}
          Zamboanga Peninsula{'\n'}
          Philippines
        </Text>
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
          <View style={styles.hoursRow}>
            <Text style={[styles.dayText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
              Monday - Friday
            </Text>
            <Text style={[styles.timeText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              7:00 AM - 8:00 PM
            </Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={[styles.dayText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
              Saturday - Sunday
            </Text>
            <Text style={[styles.timeText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              8:00 AM - 9:00 PM
            </Text>
          </View>
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
          <Text style={[styles.contactText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
            +63 123 456 7890
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContact('email')}
          activeOpacity={0.7}
        >
          <Ionicons name="mail" size={24} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
          <Text style={[styles.contactText, { color: isDarkMode ? '#E0E0E0' : '#424242' }]}>
            info@kuyavince.com
          </Text>
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
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 15,
    fontWeight: 'bold',
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
