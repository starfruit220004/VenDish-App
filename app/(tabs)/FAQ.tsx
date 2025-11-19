import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, useColorScheme, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FAQItem from './FAQItem';

export default function FAQScreen() {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    { 
      question: "How do I create an account?", 
      answer: "Go to the Sign Up page and fill out all required information. You'll receive a confirmation email to verify your account.",
      category: "Account"
    },
    { 
      question: "How do I reset my password?", 
      answer: "Open Settings, go to Account section, and click 'Reset Password'. Follow the instructions sent to your registered email.",
      category: "Account"
    },
    { 
      question: "How do I add food to my favorites?", 
      answer: "Tap on any food item to view its details, then tap the 'Add to Favorites' button. You can view all your favorites in the Favorites tab.",
      category: "Features"
    },
    { 
      question: "Can I filter foods by category?", 
      answer: "Yes! Use the Filter button on the Food Log screen to filter by categories like Main Course, Appetizer, Soup, Dessert, and Noodles.",
      category: "Features"
    },
    { 
      question: "How do I search for specific foods?", 
      answer: "Use the search bar at the top of the Food Log screen. Type the name of the food you're looking for, and results will appear instantly.",
      category: "Features"
    },
    { 
      question: "Is my data safe?", 
      answer: "Yes! Your data is encrypted and stored securely. We follow industry-standard security practices to protect your information.",
      category: "Privacy"
    },
    { 
      question: "Does the app work offline?", 
      answer: "The app requires an internet connection for initial load. However, your favorites and previously viewed items are cached for offline viewing.",
      category: "Technical"
    },
    { 
      question: "How do I contact support?", 
      answer: "Send us an email at support@foodlogapp.com anytime. We typically respond within 24 hours on business days.",
      category: "Support"
    },
    { 
      question: "Can I suggest new Filipino dishes?", 
      answer: "Absolutely! We'd love to hear your suggestions. Email us at suggestions@foodlogapp.com with the dish name and description.",
      category: "Support"
    },
    { 
      question: "Is the app available in other languages?", 
      answer: "Currently, the app is available in English. We're working on adding Filipino (Tagalog) and other regional languages soon.",
      category: "Features"
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F5F5F5' }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.header, { color: isDarkMode ? '#FFFFFF' : '#B71C1C' }]}>
            Frequently Asked Questions
          </Text>
          <Text style={[styles.subheader, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
            Find answers to common questions about the app.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          { 
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderColor: isDarkMode ? '#2C2C2E' : '#E0E0E0'
          }
        ]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={isDarkMode ? '#BDBDBD' : '#757575'} 
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDarkMode ? '#FFFFFF' : '#424242' }
            ]}
            placeholder="Search FAQs..."
            placeholderTextColor={isDarkMode ? '#757575' : '#9E9E9E'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={isDarkMode ? '#757575' : '#9E9E9E'} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        {searchQuery.length > 0 && (
          <Text style={[
            styles.resultsText,
            { color: isDarkMode ? '#BDBDBD' : '#757575' }
          ]}>
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
          </Text>
        )}

        {/* FAQ Items */}
        {filteredFaqs.length > 0 ? (
          categories.map(category => {
            const categoryFaqs = filteredFaqs.filter(f => f.category === category);
            if (categoryFaqs.length === 0) return null;
            
            return (
              <View key={category} style={styles.categorySection}>
                <View style={[
                  styles.categoryHeader,
                  { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFEBEE' }
                ]}>
                  <Ionicons 
                    name={getCategoryIcon(category)} 
                    size={18} 
                    color={isDarkMode ? '#FF5252' : '#B71C1C'} 
                  />
                  <Text style={[
                    styles.categoryTitle,
                    { color: isDarkMode ? '#FF5252' : '#B71C1C' }
                  ]}>
                    {category}
                  </Text>
                </View>
                {categoryFaqs.map((item, index) => (
                  <FAQItem 
                    key={`${category}-${index}`} 
                    question={item.question} 
                    answer={item.answer}
                  />
                ))}
              </View>
            );
          })
        ) : (
          <View style={styles.noResults}>
            <Ionicons 
              name="search-outline" 
              size={48} 
              color={isDarkMode ? '#424242' : '#BDBDBD'} 
            />
            <Text style={[
              styles.noResultsText,
              { color: isDarkMode ? '#757575' : '#9E9E9E' }
            ]}>
              No FAQs found matching "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Contact Section */}
        <View style={[
          styles.contactSection,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Ionicons 
            name="mail-outline" 
            size={32} 
            color={isDarkMode ? '#FF5252' : '#B71C1C'} 
          />
          <Text style={[
            styles.contactTitle,
            { color: isDarkMode ? '#FFFFFF' : '#424242' }
          ]}>
            Still have questions?
          </Text>
          <Text style={[
            styles.contactText,
            { color: isDarkMode ? '#BDBDBD' : '#757575' }
          ]}>
            We're here to help! Contact us at
          </Text>
          <Text style={[
            styles.contactEmail,
            { color: isDarkMode ? '#FF5252' : '#B71C1C' }
          ]}>
            kuyavince@gmail.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getCategoryIcon(category: string): any {
  const icons: Record<string, string> = {
    'Account': 'person-circle-outline',
    'Features': 'star-outline',
    'Privacy': 'shield-checkmark-outline',
    'Technical': 'settings-outline',
    'Support': 'help-buoy-outline',
  };
  return icons[category] || 'information-circle-outline';
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 15,
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  resultsText: {
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },
  contactSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
});