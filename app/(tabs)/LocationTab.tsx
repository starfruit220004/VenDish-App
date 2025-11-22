import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LocationTab() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#FFEBEE" }]}>
      
      {/* Header */}
      <Text style={[styles.headerTitle, { color: isDark ? "#FFFFFF" : "#B71C1C" }]}>
        Our Location
      </Text>

      {/* Map Placeholder */}
      <View style={[styles.mapBox, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
        <Ionicons name="map-outline" size={60} color={isDark ? "#BDBDBD" : "#9E9E9E"} />
        <Text style={[styles.mapText, { color: isDark ? "#BDBDBD" : "#757575" }]}>
          Map coming soon...
        </Text>
      </View>

      {/* Address Card */}
      <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
        <Ionicons name="location" size={28} color={isDark ? "#FF5252" : "#B71C1C"} />

        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#212121" }]}>
            Kuya Vince Carenderia
          </Text>

          <Text style={[styles.cardSubtitle, { color: isDark ? "#BDBDBD" : "#616161" }]}>
            Purok 3, Baliwasan, Philippines
          </Text>
        </View>
      </View>

      {/* Hours Card */}
      <View style={[styles.card, { backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF" }]}>
        <Ionicons name="time-outline" size={28} color={isDark ? "#FFB74D" : "#F57C00"} />

        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#212121" }]}>
            Business Hours
          </Text>

          <Text style={[styles.cardSubtitle, { color: isDark ? "#BDBDBD" : "#616161" }]}>
            Monday – Saturday: 9:00 AM – 7:00 PM  
            Sunday: Closed
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
    paddingTop: 40,
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
  },

  mapText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500"
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