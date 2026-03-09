import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../api/api'; 
import FeedbackModal, { FeedbackAction, FeedbackVariant } from '../FeedbackModal';
import { getTheme, spacing, typography, radii, layout } from '../../../constants/theme';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      showFeedback('Error', 'Please fill in all fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showFeedback('Error', 'Passwords do not match.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/firstapp/users/register/', { 
        username: username,
        email: email,
        password: password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName    
      });

      showFeedback(
        'Success',
        'Account created successfully! Please log in.',
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
      
      let msg = 'Signup failed. Please check your internet connection.';
      if (error.response?.data) {
          const data = error.response.data;
          if (typeof data === 'object') {
             const key = Object.keys(data)[0];
             const errorVal = Array.isArray(data[key]) ? data[key][0] : data[key];
             msg = `${key.toUpperCase()}: ${errorVal}`;
          } else {
             msg = String(data);
          }
      }
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
              <Text style={[styles.title, { color: theme.accentText }]}>Create Account</Text>
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
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: spacing.xxs }}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={iconColor} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.signupButton, { backgroundColor: theme.accent }, isLoading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.signupButtonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
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
  title: { ...typography.displaySm, marginBottom: spacing.xs },
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
  loginLink: { ...typography.labelSm },
});