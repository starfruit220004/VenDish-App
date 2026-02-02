import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, useColorScheme, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemTheme === "dark");
  const { userData, updateUserData, isLoggedIn } = useContext(AuthContext);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [phone, setPhone] = useState('')

  useEffect(() => {
    setDarkMode(systemTheme === "dark");
  }, [systemTheme]);

  // Load user data when component mounts
  useEffect(() => {
    if (userData) {
      // ✅ FIX: Use ?? '' to ensure valid strings
      setFirstname(userData.firstname ?? '');
      setLastname(userData.lastname ?? '');
      setUsername(userData.username ?? ""); 
      setEmail(userData.email ?? "");
      setPhone(userData.phone ?? '');
      setAddress(userData.address ?? '');
      setProfilePic(userData.profilePic ?? null);
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
    if (!firstname.trim() || !lastname.trim() || !username.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in required fields (First Name, Last Name, Username, Email)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      const updatedData = {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone,
        address: address,
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
    // Restore original data safely
    if (userData) {
      setFirstname(userData.firstname ?? '');
      setLastname(userData.lastname ?? '');
      setUsername(userData.username ?? "");
      setEmail(userData.email ?? "");
      setPhone(userData.phone ?? '');
      setAddress(userData.address ?? '');
      setProfilePic(userData.profilePic ?? null);
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

  // Get initials for avatar
  const getInitials = () => {
    const first = firstname.charAt(0).toUpperCase();
    return first ? `${first}` : username.charAt(0).toUpperCase();
  };

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
          <View style={[styles.profileImagePlaceholder, { backgroundColor: darkMode ? '#B71C1C' : '#FF5252' }]}>
            <Text style={styles.initialsText}>{getInitials()}</Text>
          </View>
        )}
        {editMode && (
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={24} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Display Full Name and Username */}
      <View style={styles.nameContainer}>
        <Text style={[styles.fullNameText, darkMode ? styles.textLight : styles.textDark]}>
          {firstname} {lastname}
        </Text>
        <Text style={[styles.usernameDisplayText, { color: darkMode ? '#BDBDBD' : '#757575' }]}>
          @{username}
        </Text>
      </View>
      
      {editMode && (
        <Text style={[styles.changePhotoText, { color: darkMode ? '#FF5252' : '#B71C1C' }]}>
          Tap photo to change
        </Text>
      )}

      {/* Info Cards */}
      <View style={styles.infoContainer}>
        {/* First Name */}
        <View style={[styles.infoCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.infoHeader}>
            <Ionicons name="person-outline" size={20} color={darkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
              First Name
            </Text>
          </View>
          <TextInput
            editable={editMode}
            value={firstname}
            onChangeText={setFirstname}
            style={[
              styles.input, 
              darkMode ? styles.inputDark : styles.inputLight,
              !editMode && styles.inputDisabled
            ]}
            placeholder="Enter first name"
            placeholderTextColor="#9E9E9E"
            autoCapitalize="words"
          />
        </View>

        {/* Last Name */}
        <View style={[styles.infoCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.infoHeader}>
            <Ionicons name="person-outline" size={20} color={darkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
              Last Name
            </Text>
          </View>
          <TextInput
            editable={editMode}
            value={lastname}
            onChangeText={setLastname}
            style={[
              styles.input, 
              darkMode ? styles.inputDark : styles.inputLight,
              !editMode && styles.inputDisabled
            ]}
            placeholder="Enter last name"
            placeholderTextColor="#9E9E9E"
            autoCapitalize="words"
          />
        </View>

        {/* Username */}
        <View style={[styles.infoCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.infoHeader}>
            <Ionicons name="at-outline" size={20} color={darkMode ? '#FF5252' : '#B71C1C'} />
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
            autoCapitalize="none"
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

        <View style={[styles.infoCard, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.infoHeader}>
            <Ionicons name="location-outline" size={20} color={darkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
              Address
            </Text>
          </View>
          <TextInput
            editable={editMode}
            value={address}
            onChangeText={setAddress}
            style={[
              styles.input, 
              darkMode ? styles.inputDark : styles.inputLight,
              !editMode && styles.inputDisabled
            ]}
            placeholder="Enter Address"
            placeholderTextColor="#9E9E9E"
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

  initialsText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
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

  nameContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },

  fullNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  usernameDisplayText: {
    fontSize: 16,
    fontWeight: '500',
  },

  changePhotoText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 12,
    fontWeight: '500',
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