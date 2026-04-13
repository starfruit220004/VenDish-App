import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, UserData } from '../../context/AuthContext'; 
import api from '../../../api/api'; 
import { reactivateAccount } from '../../services/authServices';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from '../FeedbackModal';
import { getTheme, spacing, typography, radii, layout } from '../../../constants/theme';
import {
  extractAuthErrorMessage,
  normalizeUsername,
  validateLoginInput,
} from '../../services/authValidation';

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
  const [reactivationUsername, setReactivationUsername] = useState('');
  const [isReactivationModalVisible, setReactivationModalVisible] = useState(false);
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

  const closeReactivationModal = () => {
    setReactivationModalVisible(false);
    setReactivationUsername('');
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Tabs');
  };

  const performLogin = async (normalizedUsername: string, rawPassword: string) => {
    const response = await api.post('/firstapp/token/', {
      username: normalizedUsername,
      password: rawPassword,
      platform: 'app',
    });

    const { access, refresh } = response.data;

    const userResponse = await api.get('/firstapp/users/me/', {
      headers: { Authorization: `Bearer ${access}` }
    });

    const backendUser = userResponse.data;

    const userData: UserData = {
      username: backendUser.username,
      email: backendUser.email || 'No Email',
      firstname: backendUser.first_name || '',
      middlename: backendUser.middle_name || '',
      lastname: backendUser.last_name || '',
      fullname: `${backendUser.first_name || ''} ${backendUser.middle_name || ''} ${backendUser.last_name || ''}`.replace(/\s+/g, ' ').trim(),
      address: backendUser.address || '',
      phone: backendUser.phone || '',
      profilePic: backendUser.profile_pic || '',
      has_completed_transaction: backendUser.has_completed_transaction || false,
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
  };

  const isDeactivatedAccountError = (error: any, parsedMessage: string) => {
    const detail = typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : '';
    const errorMessage = typeof error?.response?.data?.error === 'string' ? error.response.data.error : '';
    const combined = `${parsedMessage} ${detail} ${errorMessage}`.toLowerCase();

    return /deactivated|reactivate|blocked from app login/.test(combined);
  };

  const handleReactivation = async () => {
    Keyboard.dismiss();

    const normalizedReactivationUsername = normalizeUsername(reactivationUsername);
    const normalizedLoginUsername = normalizeUsername(username);

    if (!normalizedReactivationUsername) {
      showFeedback('Missing Username', 'Please enter your username to reactivate your account.', 'error');
      return;
    }

    if (!password) {
      showFeedback('Missing Password', 'Please re-enter your password before reactivating your account.', 'error');
      return;
    }

    if (normalizedReactivationUsername !== normalizedLoginUsername) {
      showFeedback('Username Mismatch', 'The username must match the one used for login.', 'error');
      return;
    }

    setIsLoading(true);
    let reactivationCompleted = false;

    try {
      await reactivateAccount(normalizedReactivationUsername, password);
      reactivationCompleted = true;
      closeReactivationModal();

      await performLogin(normalizedReactivationUsername, password);
    } catch (error: any) {
      console.error('Reactivation Error:', error);

      const fallbackMessage = reactivationCompleted
        ? 'Account reactivated, but login failed. Please try logging in again.'
        : 'Unable to reactivate your account right now. Please try again.';

      const msg = extractAuthErrorMessage(error, fallbackMessage, 'login');
      showFeedback(reactivationCompleted ? 'Login Failed' : 'Reactivation Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    const normalizedUsername = normalizeUsername(username);
    const validationError = validateLoginInput({
      username: normalizedUsername,
      password,
    });

    if (validationError) {
      showFeedback('Invalid Input', validationError, 'error');
      return;
    }

    setIsLoading(true);
    try {
      await performLogin(normalizedUsername, password);

    } catch (error: any) {
      console.error('Login Error:', error);

      const msg = extractAuthErrorMessage(
        error,
        'Login failed. Please try again in a moment.',
        'login'
      );

      if (isDeactivatedAccountError(error, msg)) {
        setReactivationUsername(normalizedUsername);
        setReactivationModalVisible(true);
        return;
      }

      showFeedback('Login Failed', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const iconColor = theme.textMuted;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.surface }, theme.cardShadow]}
            onPress={handleBackPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          
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

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: theme.textMuted }]}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text numberOfLines={1} style={[styles.signupLink, { color: theme.accent }]}>{"Sign Up"}</Text>
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

        <Modal
          visible={isReactivationModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeReactivationModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.reactivationOverlay, { backgroundColor: theme.modalOverlay }]}
          >
            <View style={[styles.reactivationCard, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <View style={[styles.reactivationIconCircle, { backgroundColor: theme.accentSoft }]}>
                <Ionicons name="refresh-circle-outline" size={34} color={theme.accent} />
              </View>

              <Text style={[styles.reactivationTitle, { color: theme.textPrimary }]}>Reactivate Account</Text>
              <Text style={[styles.reactivationSubtitle, { color: theme.textSecondary }]}>This account is deactivated. Enter your username to reactivate and continue.</Text>

              <Text style={[styles.reactivationLabel, { color: theme.textPrimary }]}>Username</Text>
              <TextInput
                style={[
                  styles.reactivationInput,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceElevated,
                  },
                ]}
                value={reactivationUsername}
                onChangeText={setReactivationUsername}
                placeholder="Enter your username"
                placeholderTextColor={theme.textDisabled}
                autoCapitalize="none"
              />

              <View style={styles.reactivationActions}>
                <TouchableOpacity
                  style={[styles.reactivationButton, { backgroundColor: theme.surfaceElevated }]}
                  onPress={closeReactivationModal}
                  disabled={isLoading}
                >
                  <Text style={[styles.reactivationCancelText, { color: theme.textPrimary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.reactivationButton, { backgroundColor: theme.accent }]}
                  onPress={handleReactivation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.reactivationConfirmText}>Reactivate</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: layout.screenPadding, justifyContent: 'center', minHeight: '100%', position: 'relative' },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: layout.screenPadding,
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
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
  reactivationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  reactivationCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
  },
  reactivationIconCircle: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  reactivationTitle: {
    ...typography.headingMd,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  reactivationSubtitle: {
    ...typography.bodySm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reactivationLabel: {
    ...typography.labelMd,
    marginBottom: spacing.sm,
  },
  reactivationInput: {
    ...typography.bodyMd,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  reactivationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reactivationButton: {
    flex: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactivationCancelText: {
    ...typography.labelMd,
  },
  reactivationConfirmText: {
    color: '#FFF',
    ...typography.labelMd,
  },
});