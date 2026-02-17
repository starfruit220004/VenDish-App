import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';

export default function LocationTab() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [address, setAddress] = useState('Loading address...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // The backend viewset returns the latest contact object
        const response = await api.get(`/firstapp/contact-page/`);
        
        if (response.data && response.data.address) {
          setAddress(response.data.address);
        } else {
          setAddress('Baliwasan, Philippines'); // Fallback
        }
      } catch (error) {
        console.error("Failed to fetch location", error);
        setAddress('Baliwasan, Philippines'); // Fallback on error
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#FFEBEE" }]}>
      
      {/* Header */}
      <Text style={[styles.headerTitle, { color: isDark ? "#FFFFFF" : "#B71C1C" }]}>
        Our Location
      </Text>

      {/* Map Placeholder */}
      <View style={[styles.mapBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
        <Image
          source={require('../../assets/images/map.jpg')}
          style={styles.mapImage}
          resizeMode="cover"
        />
      </View>

      {/* Address Card */}
      <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
        <Ionicons name="location" size={28} color={isDark ? "#FF5252" : "#B71C1C"} />

        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#212121" }]}>
            Kuya Vince Karinderya
          </Text>

          {loading ? (
             <ActivityIndicator size="small" color={isDark ? "#FFF" : "#B71C1C"} style={{alignSelf: 'flex-start', marginTop: 5}}/>
          ) : (
             <Text style={[styles.cardSubtitle, { color: isDark ? "#BDBDBD" : "#616161" }]}>
               {address}
             </Text>
          )}
        </View>
      </View>

      {/* Hours Card */}
      <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
        <Ionicons name="time-outline" size={28} color={isDark ? "#FFB74D" : "#F57C00"} />

        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#212121" }]}>
            Open Hours
          </Text>

          <Text style={[styles.cardSubtitle, { color: isDark ? "#BDBDBD" : "#616161" }]}>
            Everyday: 7:00 AM – 10:00 PM  
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    paddingTop: 30,
    paddingHorizontal: 16,
    backgroundColor: '#FFEBEE' 
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25
  },

  mapBox: {
    width: "100%",
    height: 230,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },

  mapImage: {
    width: "100%",
    height: "100%",
  },

  card: {
    width: "100%",
    flexDirection: "row",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
});