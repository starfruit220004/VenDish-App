import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../api/api'; 
import FeedbackModal, { FeedbackAction, FeedbackVariant } from '../FeedbackModal';
import { getTheme, spacing, typography, radii, layout } from '../../../constants/theme';
import {
  extractAuthErrorMessage,
  normalizeEmail,
  normalizeName,
  normalizeUsername,
  validateSignupInput,
} from '../../services/authValidation';

type DrawerParamList = {
  Tabs: undefined;
  Login: undefined;
  Signup: undefined;
};

type SignupNavigationProp = DrawerNavigationProp<DrawerParamList, 'Signup'>;

export default function Signup() {
  const navigation = useNavigation<SignupNavigationProp>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  // We only need one state to control the visibility of both fields
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

  const handleSignup = async () => {
    Keyboard.dismiss();

    const normalizedFirstName = normalizeName(firstName);
    const normalizedMiddleName = normalizeName(middleName);
    const normalizedLastName = normalizeName(lastName);
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);

    const validationError = validateSignupInput({
      firstName: normalizedFirstName,
      middleName: normalizedMiddleName,
      lastName: normalizedLastName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      confirmPassword,
    });

    if (validationError) {
      showFeedback('Invalid Input', validationError, 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/firstapp/users/register/', { 
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        first_name: normalizedFirstName,
        middle_name: normalizedMiddleName,
        last_name: normalizedLastName,
      });

      showFeedback(
        'Check Your Email',
        'Account created successfully. Please verify your email using the link we sent before logging in.',
        'success',
        [{
          label: 'OK',
          onPress: () => {
            setFirstName('');
            setMiddleName('');
            setLastName('');
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            navigation.navigate('Login');
          },
        }]
      );

    } catch (error: any) {
      console.error('Signup Error:', error);

      const msg = extractAuthErrorMessage(
        error,
        'Signup failed. Please try again in a moment.',
        'signup'
      );

      showFeedback('Signup Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const iconColor = theme.textMuted;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/Logo2.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text numberOfLines={1} style={[styles.title, { color: theme.accentText }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>Sign up to get started</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
                <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: theme.textPrimary }]} placeholder="First Name" placeholderTextColor={theme.textDisabled} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
                <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: theme.textPrimary }]} placeholder="Middle Name (Optional)" placeholderTextColor={theme.textDisabled} value={middleName} onChangeText={setMiddleName} />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
                <Ionicons name="person-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: theme.textPrimary }]} placeholder="Last Name" placeholderTextColor={theme.textDisabled} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
                <Ionicons name="at-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: theme.textPrimary }]} placeholder="Username" placeholderTextColor={theme.textDisabled} value={username} onChangeText={setUsername} autoCapitalize="none" />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
                <Ionicons name="mail-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput style={[styles.input, { color: theme.textPrimary }]} placeholder="Email" placeholderTextColor={theme.textDisabled} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
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

              <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
                <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.textPrimary }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.textDisabled}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.xxs }}>
                  {/* Icon tied directly to showPassword */}
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={iconColor} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.signupButton, { backgroundColor: theme.accent }, isLoading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text numberOfLines={1} style={styles.signupButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: theme.textMuted }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                  <Text style={[styles.loginLink, { color: theme.accent }]}>Login</Text>
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: layout.screenPadding, justifyContent: 'center', minHeight: '100%' },
  logoContainer: { alignItems: 'center', marginBottom: spacing['3xl'] },
  logoImage: { width: 120, height: 120, marginBottom: spacing.xl, borderRadius: radii.full },
  title: { ...typography.displayMd, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMd },
  formContainer: { width: '100%', paddingBottom: spacing['4xl'] },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg,
    borderRadius: radii.lg, paddingHorizontal: spacing.md, height: 52,
  },
  inputIcon: { marginRight: spacing.md },
  input: { flex: 1, height: '100%', ...typography.bodyLg },
  signupButton: {
    paddingVertical: spacing.lg, borderRadius: radii.lg,
    alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xl,
  },
  signupButtonDisabled: { opacity: 0.6 },
  signupButtonText: { color: '#FFF', ...typography.labelLg },
  loginContainer: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { ...typography.bodySm },
  loginLink: { ...typography.labelSm, paddingTop: spacing.xxs },
});