import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import api from '../api/api';
import { getTheme, spacing, typography, radii } from '../constants/theme';
import { extractAuthErrorMessage } from './services/authValidation';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[]; status?: string | string[]; message?: string | string[] }>();

  const token = useMemo(() => {
    const value = params.token;
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
  }, [params.token]);

  const presetStatus = useMemo(() => {
    const value = params.status;
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
  }, [params.status]);

  const presetMessage = useMemo(() => {
    const value = params.message;
    if (Array.isArray(value)) return value[0] || '';
    return value || '';
  }, [params.message]);

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let isMounted = true;

    const runVerification = async () => {
      if (presetStatus === 'success' || presetStatus === 'error') {
        setStatus(presetStatus === 'success' ? 'success' : 'error');
        setMessage(presetMessage || (presetStatus === 'success' ? 'Email verified successfully.' : 'Email verification failed.'));
        return;
      }

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new email verification link and try again.');
        return;
      }

      try {
        const response = await api.post('/firstapp/users/verify-email/', { token });
        if (!isMounted) return;

        setStatus('success');
        setMessage(response?.data?.message || 'Email verified successfully. You can now log in.');
      } catch (error: any) {
        if (!isMounted) return;

        const parsedMessage = extractAuthErrorMessage(
          error,
          'Unable to verify your email. Please request another verification email.',
          'signup'
        );

        setStatus('error');
        setMessage(parsedMessage);
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [token, presetStatus, presetMessage]);

  const goToApp = () => {
    router.replace('/(tabs)/Auth/Login');
  };

  const iconName = status === 'success' ? 'checkmark-circle' : status === 'error' ? 'alert-circle' : 'mail-open-outline';
  const iconColor = status === 'success' ? theme.accent : status === 'error' ? '#D32F2F' : theme.textMuted;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}> 
        <View style={[styles.card, { backgroundColor: theme.surface }, theme.cardShadowHeavy]}> 
          {status === 'loading' ? (
            <ActivityIndicator size="large" color={theme.accent} style={styles.loading} />
          ) : (
            <Ionicons name={iconName} size={70} color={iconColor} style={styles.icon} />
          )}

          <Text style={[styles.title, { color: theme.textPrimary }]}> 
            {status === 'loading' ? 'Verifying Email' : status === 'success' ? 'Email Verified' : 'Verification Failed'}
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>

          {status !== 'loading' && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.accent }]}
              onPress={goToApp}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Open App</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radii['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  loading: {
    marginBottom: spacing.lg,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingLg,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.bodyMd,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  primaryButton: {
    minWidth: 200,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    ...typography.labelLg,
  },
});
