import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, UserData } from '../../context/AuthContext'; 
import api from '../../../api/api'; 
import FeedbackModal, { FeedbackAction, FeedbackVariant } from '../FeedbackModal';
import { getTheme, spacing, typography, radii, layout } from '../../../constants/theme';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

type DrawerParamList = {
  Tabs: { screen?: string } | undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type LoginNavigationProp = DrawerNavigationProp<DrawerParamList, 'Tabs'>;

export default function Login() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login } = useAuth(); 
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: FeedbackVariant;
    actions?: FeedbackAction[];
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  useEffect(() => {
  GoogleSignin.configure({
    webClientId: '244769981796-mpki0gvuvqndmvo3dl7773r1uu962k30.apps.googleusercontent.com',
  });
  },[])

  

  const showFeedback = (
    title: string,
    message: string,
    variant: FeedbackVariant = 'info',
    actions?: FeedbackAction[]
  ) => {
    setFeedbackModal({ visible: true, title, message, variant, actions });
  };

  const closeFeedback = () => {
    setFeedbackModal(prev => ({ ...prev, visible: false }));
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === 'success') {
        const idToken = response.data.idToken;

        // Sign in with Firebase
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        await auth().signInWithCredential(googleCredential);

        // Send this token to your Django Backend
        if (idToken) {
          const backendResponse = await api.post('/firstapp/google-login/', { 
            token: idToken 
          });

          const { access, refresh, user: backendUser } = backendResponse.data;

          const userData: UserData = {
            username: backendUser.username,
            email: backendUser.email || "No Email", 
            firstname: backendUser.first_name || "",
            middlename: backendUser.middle_name || "",
            lastname: backendUser.last_name || "",
            fullname: backendUser.name || "No Name",
            address: backendUser.address || '', 
            phone: backendUser.phone || '',
            profilePic: backendUser.profile_pic || '',
          };

          await login(userData, access, refresh);

          showFeedback('Success', 'Google Sign-In successful!', 'success', [{
            label: 'OK',
            onPress: () => navigation.navigate('Tabs', { screen: 'FeedTab' }),
          }]);
        }
      } else if (response.type === 'cancelled') {
        console.log('User cancelled the login flow');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      showFeedback('Error', 'Google Sign-In failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showFeedback('Error', 'Please enter both username and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/firstapp/token/', {
        username: username,
        password: password,
        platform: 'app'
      });

      const { access, refresh } = response.data;

      const userResponse = await api.get('/firstapp/users/me/', {
        headers: { Authorization: `Bearer ${access}` }
      });

      const backendUser = userResponse.data;

      const userData: UserData = {
        username: backendUser.username,
        email: backendUser.email || "No Email", 
        firstname: backendUser.first_name || "",
        middlename: backendUser.middle_name || "",
        lastname: backendUser.last_name || "",
        fullname: `${backendUser.first_name || ""} ${backendUser.middle_name || ""} ${backendUser.last_name || ""}`.replace(/\s+/g, ' ').trim(),
        address: backendUser.address || '', 
        phone: backendUser.phone || '',
        profilePic: backendUser.profile_pic || '',
      };

      await login(userData, access, refresh);

      showFeedback(
        'Successful Login!',
        'Welcome to our App.',
        'success',
        [{
          label: 'OK',
          onPress: () => {
            navigation.navigate('Tabs', { screen: 'FeedTab' });
          },
        }]
      );

    } catch (error: any) {
      console.error('Login Error:', error);
      showFeedback('Login Failed', 'Invalid username or password.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const iconColor = theme.textMuted;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          
          <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/Logo2.jpg')} style={styles.logoImage} resizeMode="contain" />
            <Text style={[styles.title, { color: theme.accentText }]}>Welcome Back!</Text>
            <Text numberOfLines={1} style={[styles.subtitle, { color: theme.textMuted }]}>Log in to your account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Username"
                placeholderTextColor={theme.textDisabled}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Password"
                placeholderTextColor={theme.textDisabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.xxs }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text numberOfLines={1} style={{ color: theme.accent, ...typography.labelSm }}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: theme.accent }, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: '#DB4437' }, isLoading && styles.disabledButton]} 
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: theme.textMuted }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text numberOfLines={1} style={[styles.signupLink, { color: theme.accent }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        <FeedbackModal
          visible={feedbackModal.visible}
          title={feedbackModal.title}
          message={feedbackModal.message}
          variant={feedbackModal.variant}
          actions={feedbackModal.actions}
          onClose={closeFeedback}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: layout.screenPadding, justifyContent: 'center', minHeight: '100%' },
  logoContainer: { alignItems: 'center', marginBottom: spacing['4xl'] },
  logoImage: { width: 120, height: 120, marginBottom: spacing.xl, borderRadius: radii.full },
  title: { ...typography.displaySm, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMd },
  formContainer: { width: '100%' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg,
    borderRadius: radii.lg, paddingHorizontal: spacing.md, height: 52,
  },
  inputIcon: { marginRight: spacing.md },
  input: { flex: 1, height: '100%', ...typography.bodyLg },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: spacing.xl },
  loginButton: {
    paddingVertical: spacing.lg, borderRadius: radii.lg,
    alignItems: 'center', marginBottom: spacing.xl,
  },
  disabledButton: { opacity: 0.7 },
  loginButtonText: { color: '#FFF', ...typography.labelLg },
  signupContainer: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { ...typography.bodySm },
  signupLink: { ...typography.labelSm, paddingTop: spacing.xxs },
});