import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, useColorScheme, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from './MainDrawer';

export default function Profile() {
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemTheme === "dark");
  const { userData, updateUserData, isLoggedIn } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    setDarkMode(systemTheme === "dark");
  }, [systemTheme]);

  // Load user data when component mounts
  useEffect(() => {
    if (userData) {
      setUsername(userData.username);
      setEmail(userData.email);
      setPhone(userData.phone);
      setProfilePic(userData.profilePic || null);
    }
  }, [userData]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      Alert.alert(
        'Access Denied',
        'Please log in to view your profile',
        [{ text: 'OK' }]
      );
    }
  }, [isLoggedIn]);

  // Upload Profile Image
  const handleImageUpload = async () => {
    if (!editMode) {
      Alert.alert('Info', 'Please enable edit mode to change your profile picture');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need permission to access gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    
    // Validation
    if (!username.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^(\+63|0)?[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      const updatedData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        profilePic: profilePic || undefined,
      };

      await updateUserData(updatedData);
      setEditMode(false);
      Alert.alert("Success! ✅", "Your profile information was updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const cancelEdit = () => {
    // Restore original data
    if (userData) {
      setUsername(userData.username);
      setEmail(userData.email);
      setPhone(userData.phone);
      setProfilePic(userData.profilePic || null);
    }
    setEditMode(false);
  };

  if (!isLoggedIn || !userData) {
    return (
      <View style={[styles.container, darkMode ? styles.darkBg : styles.lightBg]}>
        <View style={styles.notLoggedInContainer}>
          <Ionicons 
            name="person-circle-outline" 
            size={100} 
            color={darkMode ? '#757575' : '#9E9E9E'} 
          />
          <Text style={[styles.notLoggedInText, darkMode ? styles.textLight : styles.textDark]}>
            Please log in to view your profile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, darkMode ? styles.darkBg : styles.lightBg]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.header, darkMode ? styles.textLight : styles.textDark]}>
        My Profile
      </Text>

      {/* Profile Picture */}
      <TouchableOpacity onPress={handleImageUpload} activeOpacity={0.8}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImagePlaceholder, { backgroundColor: darkMode ? '#333' : '#E0E0E0' }]}>
            <Ionicons name="person" size={60} color={darkMode ? '#757575' : '#9E9E9E'} />
          </View>
        )}
        {editMode && (
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={24} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
      
      {editMode && (
        <Text style={[styles.changePhotoText, { color: darkMode ? '#FF5252' : '#B71C1C' }]}>
          Tap to change photo
        </Text>
      )}

      {/* Info Cards */}
      <View style={styles.infoContainer}>
        {/* Username */}
        <View style={[styles.infoCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.infoHeader}>
            <Ionicons name="person-outline" size={20} color={darkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
              Username
            </Text>
          </View>
          <TextInput
            editable={editMode}
            value={username}
            onChangeText={setUsername}
            style={[
              styles.input, 
              darkMode ? styles.inputDark : styles.inputLight,
              !editMode && styles.inputDisabled
            ]}
            placeholder="Enter username"
            placeholderTextColor="#9E9E9E"
          />
        </View>

        {/* Email */}
        <View style={[styles.infoCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.infoHeader}>
            <Ionicons name="mail-outline" size={20} color={darkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
              Email
            </Text>
          </View>
          <TextInput
            editable={editMode}
            value={email}
            onChangeText={setEmail}
            style={[
              styles.input, 
              darkMode ? styles.inputDark : styles.inputLight,
              !editMode && styles.inputDisabled
            ]}
            placeholder="Enter email"
            placeholderTextColor="#9E9E9E"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone */}
        <View style={[styles.infoCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.infoHeader}>
            <Ionicons name="call-outline" size={20} color={darkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
              Phone
            </Text>
          </View>
          <TextInput
            editable={editMode}
            value={phone}
            onChangeText={setPhone}
            style={[
              styles.input, 
              darkMode ? styles.inputDark : styles.inputLight,
              !editMode && styles.inputDisabled
            ]}
            placeholder="Enter phone number"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {!editMode ? (
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: darkMode ? '#FF5252' : '#B71C1C' }]}
            onPress={() => setEditMode(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.btnText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity 
              style={[styles.cancelBtn, { borderColor: darkMode ? '#757575' : '#9E9E9E' }]} 
              onPress={cancelEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="close-outline" size={20} color={darkMode ? '#BDBDBD' : '#757575'} />
              <Text style={[styles.cancelBtnText, { color: darkMode ? '#BDBDBD' : '#757575' }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={saveChanges}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-outline" size={20} color="#FFF" />
              <Text style={styles.btnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },

  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
    borderWidth: 4,
    borderColor: '#B71C1C',
  },

  profileImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#B71C1C',
  },

  cameraIconContainer: {
    position: 'absolute',
    bottom: 15,
    right: 5,
    backgroundColor: '#B71C1C',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
  },

  changePhotoText: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 14,
    fontWeight: '600',
  },

  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },

  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },

  inputLight: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    color: "#000",
  },

  inputDark: {
    backgroundColor: "#2C2C2E",
    borderColor: "#424242",
    color: "#fff",
  },

  inputDisabled: {
    opacity: 0.7,
  },

  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },

  editButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  editBtn: {
    padding: 16,
    borderRadius: 12,
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
  },

  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  saveBtn: {
    flex: 1,
    padding: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelBtnText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notLoggedInText: {
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },

  lightBg: { backgroundColor: "#f2f2f2" },
  darkBg: { backgroundColor: "#1c1c1c" },

  cardLight: { backgroundColor: '#FFF' },
  cardDark: { backgroundColor: '#2C2C2E' },

  textDark: { color: "#000" },
  textLight: { color: "#fff" },
});