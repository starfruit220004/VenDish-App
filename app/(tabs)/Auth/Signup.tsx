import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, UserData } from '../../context/AuthContext';
// ✅ Make sure this path is correct!
import api from '../../../api/api'; 

type DrawerParamList = {
  Tabs: undefined;
  Login: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  Signup: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  ForgotPassword: undefined;
};

type SignupNavigationProp = DrawerNavigationProp<DrawerParamList, 'Signup'>;
type SignupRouteProp = RouteProp<DrawerParamList, 'Signup'>;

// ✅ FIX: Define a temporary type using Omit
type TemporaryUserData = Omit<UserData, 'phone' | 'address'>;


export default function Signup() {
  const navigation = useNavigation<SignupNavigationProp>();
  const route = useRoute<SignupRouteProp>();
  const { login } = useContext(AuthContext);
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [firstName, setFirstName] = useState('');
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
      // This creates the account but does NOT return tokens
      await api.post('/firstapp/user/register/', {
        username: username,
        email: email,
        password: password,
        first_name: firstName, 
        last_name: lastName    
      });

      // 2. LOGIN IMMEDIATELY TO GET TOKENS
      // We use the same credentials the user just entered
      const loginResponse = await api.post('/firstapp/token/', {
        username: username,
        password: password
      });

      const { access, refresh } = loginResponse.data;

      // 3. APPLY FIX: Use TemporaryUserData type
      const userData: TemporaryUserData = {
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
      };

      // 4. LOGIN CONTEXT
      await login(userData, access, refresh);

    } catch (error: any) {
      console.error('Signup Error:', error);
      
      let msg = 'Signup failed. Please check your internet connection.';
      if (error.response?.data) {
          const data = error.response.data;
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
             msg = `${firstKey.toUpperCase()}: ${data[firstKey][0]}`;
          } else if (typeof data === 'string') {
             msg = data;
          } else {
             msg = JSON.stringify(data);
          }
      }
      Alert.alert('Signup Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/Logo2.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>Sign up to get started</Text>
            </View>

            <View style={styles.formContainer}>
              
              {/* First Name Input */}
              <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
                <Ionicons name="person-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
                  placeholder="First Name"
                  placeholderTextColor="#9E9E9E"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!isLoading}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* Last Name Input */}
              <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
                <Ionicons name="person-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
                  placeholder="Last Name"
                  placeholderTextColor="#9E9E9E"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!isLoading}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
                <Ionicons name="at-outline" size={20} color={isDarkMode ? '#E0E0E0' : '#757575'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
                  placeholder="Username"
                  placeholderTextColor="#9E9E9E"
                  value={username}
                  onChangeText={setUsername}
                  editable={!isLoading}
                  autoCapitalize="none"
                  returnKeyType="next"
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
                  returnKeyType="next"
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
                  returnKeyType="next"
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
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16
  },
  formContainer: {
    width: '100%',
    paddingBottom: 40,
  },
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
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    borderRadius: 12,
    backgroundColor: 'transparent'
  },
  signupButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  signupButtonDisabled: {
    opacity: 0.6
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold'
  },
});