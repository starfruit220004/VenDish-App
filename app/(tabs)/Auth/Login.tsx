// app/(tabs)/Auth/Login.tsx
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../MainDrawer';

// Drawer navigation types
type DrawerParamList = {
  Tabs: undefined;
  Login: { redirect?: string; promoTitle?: string } | undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type LoginNavigationProp = DrawerNavigationProp<DrawerParamList, 'Login'>;
type LoginRouteProp = RouteProp<DrawerParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<LoginNavigationProp>();
  const route = useRoute<LoginRouteProp>();
  const { login } = useContext(AuthContext);
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Simulate login
    login();
    Alert.alert('Success', 'Logged in successfully!');
    navigation.navigate('Tabs');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>🍽️</Text>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Log in to continue</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
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

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={[styles.forgotPassword, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.signupLink, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  logoContainer: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
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
  forgotPassword: { fontSize: 14, textAlign: 'right', marginBottom: 24, fontWeight: '600' },
  loginButton: { backgroundColor: '#B71C1C', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14 },
  signupLink: { fontSize: 14, fontWeight: 'bold' },
});
