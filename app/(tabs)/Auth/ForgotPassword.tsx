import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../api/api';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from '../FeedbackModal';
import { getTheme, spacing, typography, radii, layout, palette } from '../../../constants/theme';

type DrawerParamList = {
  Login: undefined;
};

const STEPS = [1, 2, 3] as const;

export default function ForgotPassword() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Email
  const [email, setEmail] = useState('');

  // Step 2: OTP (6 individual digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3: New Password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback modal
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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-focus first OTP input when entering step 2
  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    }
  }, [step]);

  const iconColor = theme.textMuted;

  // ───────────────────────────────────────────────
  // STEP 1: Request OTP
  // ───────────────────────────────────────────────
  const handleRequestOTP = async () => {
    Keyboard.dismiss();
    if (!email.trim()) {
      showFeedback('Error', 'Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/request-otp/', { email: email.trim().toLowerCase() });
      showFeedback('OTP Sent', response.data.details || 'Check your email inbox for the verification code. It expires in 15 minutes.', 'success');
      setResendCooldown(60);
      setStep(2);
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || 'Failed to send OTP. Please try again.';
      showFeedback('Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────
  // STEP 2: OTP digit handlers
  // ───────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      showFeedback('Error', 'Please enter the complete 6-digit code.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verify-otp/', {
        email: email.trim().toLowerCase(),
        otp,
      });

      if (response.data.token) {
        setResetToken(response.data.token);
        showFeedback('Verified!', response.data.details || 'Code accepted. Please set your new password.', 'success');
        setStep(3);
      } else {
        showFeedback('Error', 'Verification failed. No token received.', 'error');
      }
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || 'Invalid or expired code.';
      showFeedback('Error', msg, 'error');
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      await api.post('/request-otp/', { email: email.trim().toLowerCase() });
      showFeedback('OTP Resent', 'A new code has been sent to your email. It expires in 15 minutes.', 'success');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (error: any) {
      const msg = error.response?.data?.details || 'Failed to resend OTP.';
      showFeedback('Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────
  // STEP 3: Reset Password
  // ───────────────────────────────────────────────
  const handleChangePassword = async () => {
    Keyboard.dismiss();
    if (!newPassword || !confirmPassword) {
      showFeedback('Error', 'Please fill in all fields.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showFeedback('Error', 'Password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showFeedback('Error', 'Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/change-password-token/', {
        email: email.trim().toLowerCase(),
        token: resetToken,
        password: newPassword,
      });

      showFeedback(
        'Password Reset!',
        'Your password has been changed successfully. Please log in with your new password.',
        'success',
        [{ label: 'Login Now', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || 'Failed to reset password. Please try again.';
      showFeedback('Error', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────
  // Step indicator
  // ───────────────────────────────────────────────
  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorRow}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <View style={[
            styles.stepCircle,
            step === s && { backgroundColor: theme.accent },
            step > s && { backgroundColor: palette.success },
            step < s && { backgroundColor: isDark ? palette.darkBorder : palette.mist },
          ]}>
            {step > s ? (
              <Ionicons name="checkmark" size={14} color="#FFF" />
            ) : (
              <Text style={[styles.stepCircleText, step === s && { color: '#FFF' }, step < s && { color: theme.textDisabled }]}>
                {s}
              </Text>
            )}
          </View>
          {i < 2 && (
            <View style={[
              styles.stepLine,
              step > s ? { backgroundColor: palette.success } : { backgroundColor: isDark ? palette.darkBorder : palette.mist },
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // ───────────────────────────────────────────────
  // Step content
  // ───────────────────────────────────────────────
  const renderStepContent = () => {
    switch (step) {
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
                autoFocus
                editable={!loading}
              />
            </View>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.accent }, loading && styles.disabledButton]}
              onPress={handleRequestOTP}
              disabled={loading || !email.trim()}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text numberOfLines={1} style={styles.actionButtonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            {/* OTP digit inputs */}
            <View style={styles.otpRow}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: theme.surface,
                      color: theme.textPrimary,
                      borderColor: digit ? theme.accent : (isDark ? palette.darkBorder : palette.mist),
                    },
                    theme.cardShadow,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(idx, val)}
                  onKeyPress={(e) => handleOtpKeyPress(idx, e)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            {/* Resend link */}
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
              style={styles.resendButton}
            >
              <Text numberOfLines={1} style={[
                styles.resendText,
                { color: resendCooldown > 0 ? theme.textDisabled : theme.accent },
              ]}>
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.accent }, loading && styles.disabledButton]}
              onPress={handleVerifyOTP}
              disabled={loading || otpDigits.join('').length !== 6}
              activeOpacity={0.85}
            >
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
                secureTextEntry={!showNewPassword}
                autoFocus
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={{ padding: spacing.xxs }}>
                <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={iconColor} />
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
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: spacing.xxs }}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.hint, { color: theme.textMuted }]}>
              Password must be at least 8 characters and not too common.
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.accent }, loading && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        );
    }
  };

  const titles = ['Forgot Password?', 'Verify OTP', 'Reset Password'];
  const subtitles = [
    'Enter your email to receive a verification code.',
    `We sent a 6-digit code to ${email}. Enter it within 15 minutes.`,
    'Create a strong new password for your account.',
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.container, { backgroundColor: theme.background }]}>

          {/* Header */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoIconWrap, { backgroundColor: theme.accentSoft }]}>
              <Ionicons
                name={step === 1 ? 'key-outline' : step === 2 ? 'shield-checkmark-outline' : 'lock-closed-outline'}
                size={36}
                color={theme.accent}
              />
            </View>
            <Text numberOfLines={1} style={[styles.title, { color: theme.accentText }]}>
              {titles[step - 1]}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {subtitles[step - 1]}
            </Text>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form */}
          <View style={styles.formContainer}>
            {renderStepContent()}

            {/* Back button */}
            <TouchableOpacity
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigation.navigate('Login');
                }
              }}
              style={styles.backButton}
              disabled={loading}
            >
              <Ionicons name="arrow-back" size={20} color={theme.accent} />
              <Text numberOfLines={1} style={[styles.backLink, { color: theme.accent }]}>
                {step === 1 ? 'Back to Login' : 'Go Back'}
              </Text>
            </TouchableOpacity>
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
  logoContainer: { alignItems: 'center', marginBottom: spacing['3xl'] },
  logoIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.xl,
  },
  title: { ...typography.displaySm, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMd, textAlign: 'center' as const, paddingHorizontal: spacing.xl },

  // Step Indicator
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stepCircleText: {
    ...typography.labelMd,
    color: '#FFF',
  },
  stepLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginHorizontal: spacing.xs,
  },

  // Form
  formContainer: { width: '100%' },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 55,
  },
  inputIcon: { marginRight: spacing.md },
  input: { flex: 1, height: '100%' as const, ...typography.bodyLg },

  // OTP
  otpRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 2,
    ...typography.displaySm,
    textAlign: 'center' as const,
  },
  resendButton: {
    alignItems: 'center' as const,
    marginBottom: spacing.xl,
  },
  resendText: {
    ...typography.labelMd,
  },

  // Actions
  actionButton: {
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center' as const,
    marginBottom: spacing.xl,
  },
  disabledButton: { opacity: 0.6 },
  actionButtonText: { color: '#FFF', ...typography.labelLg },

  hint: {
    ...typography.bodySm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },

  backButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
  },
  backLink: { ...typography.labelMd },
});