import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, useColorScheme, Image, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';
import { getTheme, spacing, typography, radii, layout, palette } from '../../constants/theme';

export default function LocationTab() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const [address, setAddress] = useState('Loading address...');
  const [openHours, setOpenHours] = useState('Loading...');
  const [locationImage, setLocationImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocationData = useCallback(async () => {
    try {
      const [contactRes, aboutRes] = await Promise.all([
        api.get('/firstapp/contact-page/'),
        api.get('/firstapp/about/'),
      ]);

      // Address from contact page
      if (contactRes.data && contactRes.data.address) {
        setAddress(contactRes.data.address);
      } else {
        setAddress('Baliwasan, Philippines');
      }

      // Open hours and location image from about page
      const aboutData = Array.isArray(aboutRes.data)
        ? aboutRes.data[aboutRes.data.length - 1]
        : aboutRes.data;

      if (aboutData) {
        if (aboutData.open_hours) {
          setOpenHours(aboutData.open_hours);
        } else {
          setOpenHours('Everyday: 7:00 AM – 10:00 PM');
        }
        if (aboutData.location_image) {
          setLocationImage(aboutData.location_image);
        }
      } else {
        setOpenHours('Everyday: 7:00 AM – 10:00 PM');
      }
    } catch (error) {
      console.error("Failed to fetch location data", error);
      setAddress('Baliwasan, Philippines');
      setOpenHours('Everyday: 7:00 AM – 10:00 PM');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLocationData();
  }, [fetchLocationData]);

  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: isDark ? theme.background : 'transparent' }]}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.accent]}
          tintColor={theme.accent}
        />
      }
    >
      <Text style={[styles.headerTitle, { color: theme.accentText }]}>
        Our Location
      </Text>

      {/* Map */}
      <View style={[styles.mapBox, { backgroundColor: theme.surface }, theme.cardShadow]}>
        <Image
          source={locationImage ? { uri: locationImage } : require('../../assets/images/map.jpg')}
          style={styles.mapImage}
          resizeMode="cover"
        />
      </View>

      {/* Address */}
      <View style={[styles.card, { backgroundColor: theme.surface }, theme.cardShadow]}>
        <View style={[styles.cardIconWrap, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="location" size={22} color={theme.accent} />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Kuya Vince Karinderya
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={theme.accent} style={{ alignSelf: 'flex-start', marginTop: spacing.xxs }} />
          ) : (
            <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
              {address}
            </Text>
          )}
        </View>
      </View>

      {/* Hours */}
      <View style={[styles.card, { backgroundColor: theme.surface }, theme.cardShadow]}>
        <View style={[styles.cardIconWrap, { backgroundColor: palette.warningSoft }]}>
          <Ionicons name="time-outline" size={22} color={palette.warning} />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            Open Hours
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={palette.warning} style={{ alignSelf: 'flex-start', marginTop: spacing.xxs }} />
          ) : (
            <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
              {openHours}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    alignItems: 'center' as const,
    paddingTop: spacing['3xl'],
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing['2xl'],
  },
  headerTitle: { ...typography.displaySm, marginBottom: spacing['2xl'] },

  mapBox: {
    width: '100%',
    height: 230,
    borderRadius: radii.xl,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing['2xl'],
    overflow: 'hidden' as const,
  },
  mapImage: { width: '100%', height: '100%' },

  card: {
    width: '100%',
    flexDirection: 'row' as const,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
    alignItems: 'center' as const,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: spacing.md,
  },
  cardTextWrap: { flex: 1 },
  cardTitle: { ...typography.headingSm },
  cardSubtitle: { ...typography.bodySm, marginTop: spacing.xxs },
});