import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../api/api';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from '../FeedbackModal';
import { getTheme, spacing, typography, radii, layout } from '../../../constants/theme';

type DrawerParamList = {
  Login: undefined;
};

export default function ForgotPassword() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const iconColor = theme.textMuted;

  const handleRequestOTP = async () => {
    if (!email) {
      showFeedback('Error', 'Please enter your email', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/request-otp/', { email });
      
      if (response.data.otp) {
        showFeedback('Development Mode', `Your OTP is: ${response.data.otp}`, 'info');
      } else {
        showFeedback('Success', 'OTP code sent to your email!', 'success');
      }
      setStep(2);
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || "Failed to send OTP";
      showFeedback('Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      showFeedback('Error', 'Please enter the 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verify-otp/', { email, otp });

      if (response.data.token) {
        setResetToken(response.data.token);
        showFeedback('Verified', 'Code accepted. Please set your new password.', 'success');
        setStep(3);
      } else {
        showFeedback('Error', 'Verification failed. No token received.', 'error');
      }
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || "Invalid Code";
      showFeedback('Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showFeedback('Error', 'Please fill all fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback('Error', 'Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/change-password-token/', {
        email,
        token: resetToken,
        password: newPassword
      });

      showFeedback(
        'Success!',
        'Your password has been reset. Please login.',
        'success',
        [{ label: 'Login Now', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || "Failed to reset password";
      showFeedback('Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <Ionicons name="mail-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Email Address"
                placeholderTextColor={theme.textDisabled}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.accent }]} onPress={handleRequestOTP} disabled={loading} activeOpacity={0.85}>
               {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <Ionicons name="key-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Enter 6-Digit OTP"
                placeholderTextColor={theme.textDisabled}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.accent }]} onPress={handleVerifyOTP} disabled={loading} activeOpacity={0.85}>
               {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Verify Code</Text>}
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="New Password"
                placeholderTextColor={theme.textDisabled}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <Ionicons name="lock-closed-outline" size={20} color={iconColor} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.textDisabled}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.accent }]} onPress={handleChangePassword} disabled={loading} activeOpacity={0.85}>
               {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        <View style={[styles.logoIconWrap, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="key-outline" size={36} color={theme.accent} />
        </View>
        <Text style={[styles.title, { color: theme.accentText }]}>
          {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'Reset Password'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {step === 1 ? 'Enter your email to receive a code' : 
           step === 2 ? `Enter the code sent to ${email}` : 
           'Create a strong new password'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        {renderStepContent()}

        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.navigate('Login')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={theme.accent} />
          <Text style={[styles.backLink, { color: theme.accent }]}>
            {step === 1 ? 'Back to Login' : 'Go Back'}
          </Text>
        </TouchableOpacity>
      </View>

      <FeedbackModal
        visible={feedbackModal.visible}
        title={feedbackModal.title}
        message={feedbackModal.message}
        variant={feedbackModal.variant}
        actions={feedbackModal.actions}
        onClose={closeFeedback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: layout.screenPadding },
  logoContainer: { alignItems: 'center', marginTop: spacing['5xl'], marginBottom: spacing['4xl'] },
  logoIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.xl,
  },
  title: { ...typography.displaySm, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMd, textAlign: 'center', paddingHorizontal: spacing.xl },
  formContainer: { width: '100%' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl,
    borderRadius: radii.lg, paddingHorizontal: spacing.md, height: 55,
  },
  inputIcon: { marginRight: spacing.md },
  input: { flex: 1, ...typography.bodyLg },
  actionButton: { 
    paddingVertical: spacing.lg, borderRadius: radii.lg, 
    alignItems: 'center', marginBottom: spacing.xl,
  },
  actionButtonText: { color: '#FFF', ...typography.labelLg },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  backLink: { ...typography.labelMd },
});