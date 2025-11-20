// app/(tabs)/Auth/Signup.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../MainDrawer'; 

// Drawer navigation types
type DrawerParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type SignupNavigationProp = DrawerNavigationProp<DrawerParamList, 'Signup'>;

export default function Signup() {
  const navigation = useNavigation<SignupNavigationProp>();
  const { login } = useContext(AuthContext);
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Simulate signup and auto-login
    login();
    Alert.alert('Success', 'Account created successfully!');
    navigation.navigate('Tabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>🍽️</Text>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Sign up to get started</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
          <Ionicons name="person-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
            placeholder="Username"
            placeholderTextColor="#9E9E9E"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
          <Ionicons name="mail-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
            placeholder="Email"
            placeholderTextColor="#9E9E9E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
          <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
            placeholder="Password"
            placeholderTextColor="#9E9E9E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
          <Ionicons name="lock-closed-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
            placeholder="Confirm Password"
            placeholderTextColor="#9E9E9E"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup} activeOpacity={0.8}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  logoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  logo: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  formContainer: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, borderRadius: 12, backgroundColor: 'transparent' },
  signupButton: { backgroundColor: '#B71C1C', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  signupButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: 'bold' },
});
