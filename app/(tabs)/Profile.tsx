import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme, 
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { deactivateAccount } from '../services/authServices';
import api from '../../api/api';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from './FeedbackModal';
import { getTheme, spacing, typography, radii, palette } from '../../constants/theme';

export default function Profile() {
  const { userData, logout, updateUserData } = useAuth();
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(userData?.phone || '');
  const [editAddress, setEditAddress] = useState(userData?.address || '');
  const [editProfilePic, setEditProfilePic] = useState<string | null>(null); // local URI of newly picked image
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isDeactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // ── Edit Profile helpers ───────────────────────────────────────────────────
  const startEditing = () => {
    setEditPhone(userData?.phone || '');
    setEditAddress(userData?.address || '');
    setEditProfilePic(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditProfilePic(null);
  };

  const pickProfileImage = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      showFeedback('Permission Denied', 'Camera roll access is required to change your profile picture.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditProfilePic(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('phone', editPhone.trim());
      formData.append('address', editAddress.trim());

      if (editProfilePic) {
        // @ts-ignore – React Native FormData accepts this shape
        formData.append('profile_pic', {
          uri: editProfilePic,
          name: 'profile_pic.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await api.patch('/firstapp/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const backendUser = response.data;

      // Sync context + AsyncStorage with the server response
      await updateUserData({
        ...userData!,
        phone: backendUser.phone || '',
        address: backendUser.address || '',
        profilePic: backendUser.profile_pic || '',
      });

      setIsEditing(false);
      setEditProfilePic(null);
      showFeedback('Profile Updated', 'Your profile has been saved successfully.', 'success');
    } catch (error: any) {
      console.error('Profile update error:', error.response?.data || error.message);
      showFeedback('Error', 'Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    showFeedback(
      'Logout',
      'Are you sure you want to log out?',
      'warning',
      [
        { label: 'Cancel', style: 'secondary' },
        { 
          label: 'Logout', 
          style: 'danger', 
          onPress: async () => { 
            await logout(); 
            
            // Show the success modal reusing the existing FeedbackModal
            showFeedback(
              'Success',
              'You successfully logout.',
              'success',
              [{
                label: 'OK',
                onPress: () => {
                  // Navigate to the Promos tab after acknowledging the modal
                  (navigation as any).reset({
                    index: 0,
                    routes: [{ 
                      name: 'Tabs', 
                      params: { screen: 'Promos' } 
                    }],
                  });
                }
              }]
            );
          } 
        },
      ]
    );
  };

  const handleDeactivate = () => {
    // Open the deactivation confirmation modal
    setDeactivateModalVisible(true);
    setPassword('');
  };

  const confirmDeactivation = async () => {
    if (!password) {
      showFeedback('Error', 'Please enter your password to confirm.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Token is auto-attached by the API interceptor
      await deactivateAccount(password);

      // Close modal
      setDeactivateModalVisible(false);
      setPassword('');

      showFeedback(
        'Success',
        'Your account has been deactivated.',
        'success',
        [{
          label: 'OK',
          onPress: async () => {
            await logout();
            (navigation as any).reset({
              index: 0,
              routes: [{ name: 'Tabs' }],
            });
          },
        }]
      );
    } catch (error: any) {
      console.error("Deactivation Error:", error.response?.data || error.message);
      showFeedback('Error', error.response?.data?.error || 'Failed to deactivate account', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (userData?.firstname && userData?.lastname) {
        return `${userData.firstname[0]}${userData.lastname[0]}`.toUpperCase();
    }
    return userData?.username?.slice(0, 2).toUpperCase() || 'KV';
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: 150 
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.surface }, theme.cardShadow]}>
          <View style={styles.avatarContainer}>
              {(editProfilePic || userData?.profilePic) ? (
                  <Image source={{ uri: editProfilePic || userData?.profilePic }} style={styles.avatar} />
              ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: theme.accent }]}>
                      <Text style={styles.avatarInitials}>{getInitials()}</Text>
                  </View>
              )}
              {isEditing && (
                <TouchableOpacity style={[styles.editIconBadge, { backgroundColor: theme.surfaceElevated }]} onPress={pickProfileImage}>
                    <Ionicons name="camera" size={14} color={theme.accent} />
                </TouchableOpacity>
              )}
          </View>

          <Text numberOfLines={1} style={[styles.name, { color: theme.textPrimary }]}>
              {userData?.firstname} {userData?.middlename ? userData.middlename + ' ' : ''}{userData?.lastname}
          </Text>
          <Text style={[styles.username, { color: theme.textSecondary }]}>
              @{userData?.username || 'user'}
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted, marginBottom: 0, flex: 1 }]}>
              Personal Information
            </Text>
            
            {!isEditing ? (
              <TouchableOpacity onPress={startEditing} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Ionicons name="create-outline" size={18} color={theme.accent} />
                <Text style={[typography.labelMd, { color: theme.accent, flexShrink: 0 }]}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <TouchableOpacity onPress={cancelEditing} disabled={isSaving}>
                  <Text style={[typography.labelSm, { color: theme.textMuted, flexShrink: 0 }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveProfile} disabled={isSaving} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color={theme.accent} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color={theme.accent} />
                      <Text numberOfLines={1} style={[typography.labelSm, { color: theme.accent, flexShrink: 0 }]}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={[styles.infoCard, { backgroundColor: theme.surface }, theme.cardShadow]}>
              <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                      <Ionicons name="mail-outline" size={20} color={theme.accent} />
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{userData?.email || 'N/A'}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              <View style={styles.infoRow}>
                   <View style={styles.infoLabelContainer}>
                      <Ionicons name="person-outline" size={20} color={theme.accent} />
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Full Name</Text>
                  </View>
                  <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                      {userData?.firstname} {userData?.middlename ? userData.middlename + '. ' : ''}{userData?.lastname}
                  </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              {/* Phone */}
              <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                      <Ionicons name="call-outline" size={20} color={theme.accent} />
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      style={[styles.editInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="Enter phone number"
                      placeholderTextColor={theme.textDisabled}
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text style={[styles.infoValue, { color: userData?.phone ? theme.textPrimary : theme.textDisabled }]}>
                      {userData?.phone || 'Not set'}
                    </Text>
                  )}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              {/* Address - UPDATED LAYOUT */}
              <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: spacing.sm }]}>
                  <View style={styles.infoLabelContainer}>
                      <Ionicons name="location-outline" size={20} color={theme.accent} />
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Address</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      style={[styles.editInput, { 
                        color: theme.textPrimary, 
                        borderColor: theme.border, 
                        backgroundColor: theme.surfaceElevated,
                        width: '100%',
                        textAlign: 'left',
                        minHeight: 70,
                        paddingTop: spacing.sm
                      }]}
                      value={editAddress}
                      onChangeText={setEditAddress}
                      placeholder="Unit/House No./Street Name/Barangay/City/Zip Code"
                      placeholderTextColor={theme.textDisabled}
                      multiline
                      textAlignVertical="top"
                    />
                  ) : (
                    <Text style={[styles.infoValue, { 
                      color: userData?.address ? theme.textPrimary : theme.textDisabled, 
                      textAlign: 'left',
                      width: '100%',
                      paddingLeft: 28 // Indents slightly to align with text above, bypassing the icon
                    }]}>
                      {userData?.address || 'Not set'}
                    </Text>
                  )}
              </View>
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Account</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.surface }, theme.cardShadow]}>
              
              <TouchableOpacity style={styles.menuItem} onPress={handleDeactivate}>
                  <View style={styles.menuItemLeft}>
                      <Ionicons name="trash-outline" size={22} color={theme.textPrimary} />
                      <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>Deactivate Account</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <View style={styles.menuItemLeft}>
                      <Ionicons name="log-out-outline" size={22} color={palette.error} />
                      <Text style={[styles.menuItemText, { color: palette.error }]}>Log Out</Text>
                  </View>
              </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* --- DEACTIVATION CONFIRMATION MODAL --- */}
      <Modal
        visible={isDeactivateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeactivateModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              This action will log you out immediately. Your account will be permanently deleted after 30 days unless you reactivate it.
            </Text>

            <Text style={[styles.label, { color: theme.textPrimary }]}>
                Confirm Password
            </Text>
            
            <TextInput
              style={[
                  styles.input, 
                  { 
                      color: theme.textPrimary,
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceElevated
                  }
              ]}
              placeholder="Enter your password"
              placeholderTextColor={theme.textDisabled}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.surfaceElevated }]}
                onPress={() => {
                    setDeactivateModalVisible(false);
                    setPassword('');
                }}
                disabled={isLoading}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeactivation}
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

      <FeedbackModal
        visible={feedbackModal.visible}
        title={feedbackModal.title}
        message={feedbackModal.message}
        variant={feedbackModal.variant}
        actions={feedbackModal.actions}
        onClose={closeFeedback}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center', paddingVertical: spacing['2xl'], marginBottom: spacing.xl,
    borderBottomLeftRadius: radii['2xl'], borderBottomRightRadius: radii['2xl'],
  },
  avatarContainer: { position: 'relative', marginBottom: spacing.lg },
  avatar: { width: 100, height: 100, borderRadius: radii.full },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: radii.full, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#FFF', ...typography.displaySm },
  editIconBadge: {
    position: 'absolute', bottom: 0, right: 0,
    padding: spacing.xs, borderRadius: radii.full, borderWidth: 2, borderColor: '#FFF',
  },
  name: { ...typography.headingLg, marginBottom: spacing.xxs },
  username: { ...typography.bodyMd },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing['2xl'] },
  sectionTitle: { ...typography.caption, fontWeight: '600' as const, marginBottom: spacing.md, textTransform: 'uppercase' as const, letterSpacing: 1 },
  infoCard: { borderRadius: radii.xl, padding: spacing.xxs },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  infoLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoLabel: { ...typography.bodyMd },
  infoValue: { ...typography.bodyMd, fontWeight: '500' as const },
  editInput: { ...typography.bodySm, fontWeight: '500' as const, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minWidth: 140, textAlign: 'right' },
  divider: { height: 1, marginHorizontal: spacing.lg },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  menuItemText: { ...typography.bodyLg, fontWeight: '500' as const },

  // Modal Styles
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
  input: {
    width: '100%',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
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