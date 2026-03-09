import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FeedbackVariant = 'success' | 'error' | 'warning' | 'info';

export type FeedbackAction = {
  label: string;
  onPress?: () => void;
  style?: 'primary' | 'secondary' | 'danger';
};

type FeedbackModalProps = {
  visible: boolean;
  title: string;
  message: string;
  variant?: FeedbackVariant;
  actions?: FeedbackAction[];
  onClose: () => void;
};

const getIconName = (variant: FeedbackVariant) => {
  switch (variant) {
    case 'success':
      return 'checkmark-circle';
    case 'warning':
      return 'warning';
    case 'info':
      return 'information-circle';
    case 'error':
    default:
      return 'alert-circle';
  }
};

export default function FeedbackModal({
  visible,
  title,
  message,
  variant = 'info',
  actions,
  onClose,
}: FeedbackModalProps) {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const resolvedActions = actions && actions.length > 0
    ? actions
    : [{ label: 'OK', style: 'primary' as const }];

  const handleActionPress = (action: FeedbackAction) => {
    onClose();
    if (action.onPress) {
      action.onPress();
    }
  };

  const getButtonStyle = (style: FeedbackAction['style']) => {
    if (style === 'secondary') return styles.secondaryButton;
    if (style === 'danger') return styles.dangerButton;
    return styles.primaryButton;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
          <Ionicons
            name={getIconName(variant)}
            size={64}
            color={isDarkMode ? '#FF5252' : '#B71C1C'}
          />

          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>{title}</Text>
          <Text style={[styles.message, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>{message}</Text>

          <View style={styles.buttonRow}>
            {resolvedActions.map((action, index) => (
              <TouchableOpacity
                key={`${action.label}-${index}`}
                style={[styles.button, getButtonStyle(action.style)]}
                onPress={() => handleActionPress(action)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    minWidth: 110,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#B71C1C',
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  dangerButton: {
    backgroundColor: '#D32F2F',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});