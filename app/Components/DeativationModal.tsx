import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, typography, radii, palette } from '../../constants/theme';

interface DeactivateModalProps {
  visible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export default function DeactivateModal({
  visible,
  isLoading,
  onClose,
  onConfirm,
}: DeactivateModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  // Encapsulate password state inside the modal
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset internal state every time the modal is opened
  useEffect(() => {
    if (visible) {
      setPassword('');
      setShowPassword(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.modalHeader}>
            <View style={[styles.warningIcon, { backgroundColor: palette.errorSoft }]}>
              <Ionicons name="warning" size={32} color={palette.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Deactivate Account?
            </Text>
          </View>

          <Text style={[styles.modalText, { color: theme.textSecondary }]}>
            This action will log you out immediately. Your account will be permanently
            deleted after 30 days unless you reactivate it.
          </Text>

          <Text style={[styles.label, { color: theme.textPrimary }]}>
            Confirm Password
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                borderColor: theme.border,
                backgroundColor: theme.surfaceElevated,
              },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: theme.textPrimary }]}
              placeholder="Enter your password"
              placeholderTextColor={theme.textDisabled}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: spacing.xs }}
              disabled={isLoading}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.surfaceElevated }]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={() => onConfirm(password)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Deactivate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  warningIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.headingMd,
    textAlign: 'center',
  },
  modalText: {
    ...typography.bodySm,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  label: {
    ...typography.labelSm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    ...typography.bodyMd,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: palette.error,
  },
  cancelButtonText: {
    ...typography.labelMd,
  },
  deleteButtonText: {
    color: '#FFF',
    ...typography.labelMd,
  },
});