// app/(tabs)/Auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Drawer navigation types
type DrawerParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type ForgotPasswordNavigationProp = DrawerNavigationProp<DrawerParamList, 'ForgotPassword'>;

export default function ForgotPassword() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Simulate password reset
    Alert.alert('Success', 'Password reset link has been sent to your email!', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>🔐</Text>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>Forgot Password?</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
          Enter your email to reset password
        </Text>
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

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} activeOpacity={0.8}>
          <Text style={styles.resetButtonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <View style={styles.backContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
              <Text style={[styles.backLink, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Back to Login</Text>
            </View>
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
  subtitle: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  formContainer: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  resetButton: { backgroundColor: '#B71C1C', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  resetButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backContainer: { alignItems: 'center' },
  backLink: { fontSize: 16, fontWeight: 'bold' },
});
