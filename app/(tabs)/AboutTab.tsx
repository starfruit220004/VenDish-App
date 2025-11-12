import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function AboutTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.icon}>🍱</Text>
        <Text style={styles.title}>About Foodie Journal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.description}>
          Welcome to <Text style={styles.bold}>Foodie Journal</Text>, your personal companion for
          exploring and documenting your culinary adventures! This app helps you log meals,
          discover new dishes, and curate your collection of favorite foods.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={24} color="#E65100" />
          <Text style={styles.sectionTitle}>Features</Text>
        </View>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.bullet} />
            <Text style={styles.featureText}>
              Browse a curated collection of Filipino dishes
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bullet} />
            <Text style={styles.featureText}>Save your favorite foods for quick access</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bullet} />
            <Text style={styles.featureText}>View detailed information and ratings</Text>
          </View>
        </View>
      </View>

      <View style={styles.comingSoonSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="rocket" size={24} color="#B71C1C" />
          <Text style={styles.sectionTitle}>Coming Soon</Text>
        </View>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.bulletComing} />
            <Text style={styles.featureText}>Nutrition tracker and calorie counter</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletComing} />
            <Text style={styles.featureText}>AI-powered food recognition</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletComing} />
            <Text style={styles.featureText}>Personalized meal planner</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletComing} />
            <Text style={styles.featureText}>Recipe sharing with the community</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Developed with ❤️ by</Text>
        <Text style={styles.groupName}>Group 7</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E65100',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#5D4037',
    lineHeight: 24,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: '#E65100',
  },
  featuresSection: {
    backgroundColor: '#FFE0B2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  comingSoonSection: {
    backgroundColor: '#FFCDD2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3E2723',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E65100',
    marginTop: 6,
  },
  bulletComing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B71C1C',
    marginTop: 6,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#4E342E',
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#BCAAA4',
  },
  footerText: {
    fontSize: 14,
    color: '#6D4C41',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E65100',
  },
});
export default AboutTab;