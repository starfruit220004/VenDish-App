import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../api/api'; 

type DrawerParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: undefined;
};

type SignupNavigationProp = DrawerNavigationProp<DrawerParamList, 'Signup'>;

export default function Signup() {
  const navigation = useNavigation<SignupNavigationProp>();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    Keyboard.dismiss();

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. REGISTER THE USER
      // Make sure this URL matches your router path in urls.py. 
      // Typically it is 'users' (plural) if using DefaultRouter.
      await api.post('/firstapp/users/register/', { 
        username: username,
        email: email,
        password: password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName    
      });

      // 2. SUCCESS HANDLING
      Alert.alert(
        "Success", 
        "Account created successfully! Please log in.",
        [
            { 
                text: "OK", 
                onPress: () => {
                    // 3. CLEAR FIELDS
                    setFirstName('');
                    setMiddleName('');
                    setLastName('');
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');

                    // 4. REDIRECT TO LOGIN
                    navigation.navigate('Login');
                } 
            }
        ]
      );

    } catch (error: any) {
      console.error('Signup Error:', error);
      
      let msg = 'Signup failed. Please check your internet connection.';
      if (error.response?.data) {
          const data = error.response.data;
          // Handle Django error format
          if (typeof data === 'object') {
             const key = Object.keys(data)[0];
             // Extract the error message string
             const errorVal = Array.isArray(data[key]) ? data[key][0] : data[key];
             msg = `${key.toUpperCase()}: ${errorVal}`;
          } else {
             msg = String(data);
          }
      }
      Alert.alert('Signup Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper styles for dynamic theming
  const inputStyle = [styles.input, { color: isDarkMode ? '#FFF' : '#424242' }];
  const containerStyle = [styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }];
  const iconColor = isDarkMode ? '#E0E0E0' : '#757575';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
            <View style={styles.logoContainer}>
              {/* Ensure your image path is correct */}
              <Image
                source={require('../../../assets/images/Logo2.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Sign up to get started</Text>
            </View>

            <View style={styles.formContainer}>
              {/* First Name */}
              <View style={containerStyle}>
                <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={inputStyle}
                  placeholder="First Name"
                  placeholderTextColor="#9E9E9E"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>

              <View style={containerStyle}>
                <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={inputStyle}
                  placeholder="Middle Name (Optional)"
                  placeholderTextColor="#999"
                  value={middleName}
                  onChangeText={setMiddleName}
                />
              </View>

              {/* Last Name */}
              <View style={containerStyle}>
                <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={inputStyle}
                  placeholder="Last Name"
                  placeholderTextColor="#9E9E9E"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>

              {/* Username */}
              <View style={containerStyle}>
                <Ionicons name="at-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={inputStyle}
                  placeholder="Username"
                  placeholderTextColor="#9E9E9E"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* Email */}
              <View style={containerStyle}>
                <Ionicons name="mail-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={inputStyle}
                  placeholder="Email"
                  placeholderTextColor="#9E9E9E"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password */}
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

              {/* Confirm Password */}
              <View style={containerStyle}>
                <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={inputStyle}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9E9E9E"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text style={styles.signupButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                  <Text style={[styles.loginLink, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center', minHeight: '100%' },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoImage: { width: 120, height: 120, marginBottom: 20, borderRadius: 60 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  formContainer: { width: '100%', paddingBottom: 40 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    borderRadius: 12, paddingHorizontal: 12, elevation: 2, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16 },
  signupButton: {
    backgroundColor: '#B71C1C', paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 10, marginBottom: 20
  },
  signupButtonDisabled: { opacity: 0.6 },
  signupButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: 'bold' },
});