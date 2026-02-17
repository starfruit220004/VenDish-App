import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, useColorScheme, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, UserData } from '../../context/AuthContext'; 
import api from '../../../api/api'; 

// [UPDATED] Define types to allow passing params to 'Tabs'
type DrawerParamList = {
  Tabs: { screen?: string } | undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type LoginNavigationProp = DrawerNavigationProp<DrawerParamList, 'Tabs'>;

export default function Login() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login } = useContext(AuthContext); 
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. GET TOKEN
      const response = await api.post('/firstapp/token/', {
        username: username,
        password: password
      });

      const { access, refresh } = response.data;

      // 2. GET USER DETAILS
      const userResponse = await api.get('/firstapp/users/me/', {
        headers: { Authorization: `Bearer ${access}` }
      });

      const backendUser = userResponse.data;

      // 3. MAP BACKEND DATA TO FRONTEND INTERFACE
      const userData: UserData = {
        username: backendUser.username,
        email: backendUser.email || "No Email", 
        firstname: backendUser.first_name || "",
        middlename: backendUser.middle_name || "",
        lastname: backendUser.last_name || "",
        fullname: `${backendUser.first_name || ""} ${backendUser.middle_name || ""} ${backendUser.last_name || ""}`.replace(/\s+/g, ' ').trim(),
        address: backendUser.address || '', 
        phone: backendUser.phone || ''
      };

      // 4. SAVE TO CONTEXT
      await login(userData, access, refresh);
      
      // 5. [UPDATED] REDIRECT TO PROMOS TAB
      // Navigate to the 'Tabs' navigator, then to the 'Promos' screen inside it.
      // If your Promos screen is named differently in TabNavigator.tsx, update 'Promos' below.
      navigation.navigate('Tabs', { screen: 'FeedTab' });

    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles helpers
  const inputStyle = [styles.input, { color: isDarkMode ? '#FFF' : '#424242' }];
  const containerStyle = [styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }];
  const iconColor = isDarkMode ? '#E0E0E0' : '#757575';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
          
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/Logo2.jpg')} style={styles.logoImage} resizeMode="contain" />
            <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Log in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={containerStyle}>
              <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={inputStyle}
                placeholder="Username"
                placeholderTextColor="#9E9E9E"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={containerStyle}>
              <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={inputStyle}
                placeholder="Password"
                placeholderTextColor="#9E9E9E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={{ color: isDarkMode ? '#FF5252' : '#B71C1C' }}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                  <ActivityIndicator color="#FFF" />
              ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={[styles.signupLink, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center', minHeight: '100%' },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 120, height: 120, marginBottom: 20, borderRadius: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  formContainer: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderRadius: 12, paddingHorizontal: 12, elevation: 2, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 20 },
  loginButton: { backgroundColor: '#B71C1C', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20, elevation: 3 },
  disabledButton: { opacity: 0.7 },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontSize: 14 },
  signupLink: { fontSize: 14, fontWeight: 'bold' },
});