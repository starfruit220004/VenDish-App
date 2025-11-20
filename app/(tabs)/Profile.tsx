import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,Image,TouchableOpacity,TextInput,useColorScheme,Alert,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemTheme === "dark");

  const [username, setUsername] = useState("Kuya Vince");
  const [email, setEmail] = useState("kuya.vince@example.com");
  const [phone, setPhone] = useState("+63 912 345 6789");

  const [editMode, setEditMode] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    setDarkMode(systemTheme === "dark");
  }, [systemTheme]);

  // Upload Profile Image
  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need permission to access gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const saveChanges = () => {
    setEditMode(false);
    Alert.alert("Profile Updated", "Your profile information was saved.");
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkBg : styles.lightBg]}>
      <Text style={[styles.header, darkMode ? styles.textLight : styles.textDark]}>
        Profile
      </Text>

      <TouchableOpacity onPress={handleImageUpload}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require("../../assets/images/chicken2.jpg")
          }
          style={styles.profileImage}
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      {/* Username */}
      <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
        Username
      </Text>
      <TextInput
        editable={editMode}
        value={username}
        onChangeText={setUsername}
        style={[styles.input, darkMode ? styles.inputDark : styles.inputLight]}
      />

      {/* Email */}
      <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
        Email
      </Text>
      <TextInput
        editable={editMode}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, darkMode ? styles.inputDark : styles.inputLight]}
      />

      {/* Phone */}
      <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>
        Phone
      </Text>
      <TextInput
        editable={editMode}
        value={phone}
        onChangeText={setPhone}
        style={[styles.input, darkMode ? styles.inputDark : styles.inputLight]}
      />

      {/* Buttons */}
      {!editMode ? (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditMode(true)}
        >
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 20,
  },

  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 10,
  },

  changePhotoText: {
    textAlign: "center",
    color: "#4a90e2",
    marginBottom: 20,
  },

  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginTop: 10,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },

  inputLight: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    color: "#000",
  },

  inputDark: {
    backgroundColor: "#333",
    borderColor: "#666",
    color: "#fff",
  },

  editBtn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#4a90e2",
    borderRadius: 10,
    width: "100%",
  },

  saveBtn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "green",
    borderRadius: 10,
    width: "100%",
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },

  lightBg: { backgroundColor: "#f2f2f2" },
  darkBg: { backgroundColor: "#1c1c1c" },

  textDark: { color: "#000" },
  textLight: { color: "#fff" },
});
