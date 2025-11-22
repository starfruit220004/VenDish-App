import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, UserData } from '../MainDrawer'; 

type DrawerParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  ForgotPassword: undefined;
};

type SignupNavigationProp = DrawerNavigationProp<DrawerParamList, 'Signup'>;
type SignupRouteProp = RouteProp<DrawerParamList, 'Signup'>;

export default function Signup() {
  const navigation = useNavigation<SignupNavigationProp>();
  const route = useRoute<SignupRouteProp>();
  const { login } = useContext(AuthContext);
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!username || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone validation (Philippine format)
    const phoneRegex = /^(\+63|0)?[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number (e.g., +63 912 345 6789)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Create user data object
      const userData: UserData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };

      // Save user data and login
      await login(userData);
      
      // Check if user was redirected from promo claiming
      const { redirect, promoId, promoTitle } = route.params || {};
      
      if (redirect === 'promo-claim' && promoId) {
        // Auto-claim the promo after signup
        Alert.alert(
          'Success! 🎉', 
          `Welcome ${userData.username}!\n\nYour account has been created and you've claimed: ${promoTitle}`,
          [{ text: 'OK', onPress: () => navigation.navigate('Tabs') }]
        );
      } else {
        Alert.alert(
          'Success! 🎉',
          `Welcome ${userData.username}! Your account has been created successfully.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Tabs') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            value={username}
            onChangeText={setUsername}
            editable={!isLoading}
            autoCapitalize="words"
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
            editable={!isLoading}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
          <Ionicons name="call-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
            placeholder="Phone (e.g., +63 912 345 6789)"
            placeholderTextColor="#9E9E9E"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
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
            editable={!isLoading}
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
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity 
          style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
          onPress={handleSignup} 
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
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
  signupButtonDisabled: { opacity: 0.6 },
  signupButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: 'bold' },
});