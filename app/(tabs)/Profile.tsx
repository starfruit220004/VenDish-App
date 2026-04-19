import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme, 
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
import DeactivateModal from '../Components/DeativationModal'; // <-- IMPORT NEW MODAL
import { getTheme, spacing, typography, radii, palette } from '../../constants/theme';

const PH_MOBILE_DIGITS = 11;
const PH_MOBILE_REGEX = /^09\d{9}$/;

const normalizePhilippinePhoneDigits = (value: unknown): string => {
  const digitsOnly = String(value || '').replace(/\D/g, '');
  if (!digitsOnly) {
    return '';
  }

  let normalized = digitsOnly;
  if (normalized.startsWith('63')) {
    normalized = `0${normalized.slice(2)}`;
  } else if (normalized.startsWith('9')) {
    normalized = `0${normalized}`;
  }

  if (normalized.length > PH_MOBILE_DIGITS) {
    normalized = normalized.slice(0, PH_MOBILE_DIGITS);
  }

  return normalized;
};

const formatPhilippinePhoneNumber = (value: unknown): string => {
  const normalized = normalizePhilippinePhoneDigits(value);
  if (!normalized) {
    return '';
  }

  if (normalized.length <= 4) {
    return normalized;
  }

  if (normalized.length <= 7) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
  }

  return `${normalized.slice(0, 4)}-${normalized.slice(4, 7)}-${normalized.slice(7)}`;
};

export default function Profile() {
  const { userData, logout, updateUserData } = useAuth();
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState(formatPhilippinePhoneNumber(userData?.phone || ''));
  const [editEmail, setEditEmail] = useState(userData?.email || '');
  const [editUsername, setEditUsername] = useState(userData?.username || '');
  const [editFirstname, setEditFirstname] = useState(userData?.firstname || '');
  const [editMiddlename, setEditMiddlename] = useState(userData?.middlename || '');
  const [editLastname, setEditLastname] = useState(userData?.lastname || '');
  const [editProfilePic, setEditProfilePic] = useState<string | null>(null);
  
  // Chunked Address States
  const [editStreet, setEditStreet] = useState('');
  const [editBarangay, setEditBarangay] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editZip, setEditZip] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isDeactivateModalVisible, setDeactivateModalVisible] = useState(false);
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

  const getMiddleInitial = (middleName?: string) => {
    const cleanMiddleName = middleName?.trim() || '';
    return cleanMiddleName ? cleanMiddleName.charAt(0) : '';
  };

  const buildDisplayName = (firstName?: string, middleName?: string, lastName?: string) => {
    const parts = [firstName?.trim() || ''];
    const middleInitial = getMiddleInitial(middleName);

    if (middleInitial) {
      parts.push(middleInitial);
    }

    parts.push(lastName?.trim() || '');
    return parts.filter(Boolean).join(' ').trim();
  };

  // ── Edit Profile helpers ───────────────────────────────────────────────────
  const startEditing = () => {
    const addr = userData?.address || '';
    const parts = addr.split(',').map(s => s.trim()).filter(Boolean);
    
    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1];
      if (/\d/.test(lastPart) && lastPart.length <= 6) {
         setEditZip(lastPart);
         setEditCity(parts[parts.length - 2] || '');
         setEditBarangay(parts[parts.length - 3] || '');
         setEditStreet(parts.slice(0, parts.length - 3).join(', '));
      } else {
         setEditZip('');
         setEditCity(parts[parts.length - 1] || '');
         setEditBarangay(parts[parts.length - 2] || '');
         setEditStreet(parts.slice(0, parts.length - 2).join(', '));
      }
    } else {
      setEditStreet(addr);
      setEditBarangay('');
      setEditCity('');
      setEditZip('');
    }

    setEditPhone(formatPhilippinePhoneNumber(userData?.phone || ''));
    setEditEmail(userData?.email || '');
    setEditUsername(userData?.username || '');
    setEditFirstname(userData?.firstname || '');
    setEditMiddlename(userData?.middlename || '');
    setEditLastname(userData?.lastname || '');
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
      let response;
      const normalizedPhone = normalizePhilippinePhoneDigits(editPhone);

      if (normalizedPhone && !PH_MOBILE_REGEX.test(normalizedPhone)) {
        showFeedback('Invalid Phone Number', 'Use Philippine mobile format: 09XX-XXX-XXXX.', 'error');
        return;
      }

      const combinedAddress = [editStreet, editBarangay, editCity, editZip]
        .map(part => part.trim())
        .filter(Boolean)
        .join(', ');

      const payload = {
        phone: normalizedPhone,
        address: combinedAddress,
        email: editEmail.trim(),
        username: editUsername.trim(),
        first_name: editFirstname.trim(),
        middle_name: editMiddlename.trim(),
        last_name: editLastname.trim(),
      };

      if (editProfilePic) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        // @ts-ignore
        formData.append('profile_pic', {
          uri: editProfilePic,
          name: 'profile_pic.jpg',
          type: 'image/jpeg',
        });

        response = await api.patch('/firstapp/users/me/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          transformRequest: (data: any) => data,
        });
      } else {
        response = await api.patch('/firstapp/users/me/', payload);
      }

      const backendUser = response.data;
      const firstName = backendUser.first_name || backendUser.firstname || '';
      const middleName = backendUser.middle_name || backendUser.middlename || '';
      const lastName = backendUser.last_name || backendUser.lastname || '';

      await updateUserData({
        ...userData!,
        phone: backendUser.phone || '',
        address: backendUser.address || '',
        email: backendUser.email || '',
        username: backendUser.username || '',
        firstname: firstName,
        middlename: middleName,
        lastname: lastName,
        fullname: buildDisplayName(firstName, middleName, lastName),
        profilePic: backendUser.profile_pic || '',
      });

      setIsEditing(false);
      setEditProfilePic(null);
      showFeedback('Profile Updated', 'Your profile has been saved successfully.', 'success');
    } catch (error: any) {
      console.error('Profile update error:', error.response?.data || error.message);
      let msg = 'Failed to update profile. Please try again.';
      if (error.response?.data && typeof error.response.data === 'object') {
        const firstKey = Object.keys(error.response.data)[0];
        if (firstKey) {
          const val = error.response.data[firstKey];
          msg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
        }
      }
      showFeedback('Error', msg, 'error');
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
            showFeedback(
              'Success',
              'You successfully logout.',
              'success',
              [{
                label: 'OK',
                onPress: () => {
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
    setDeactivateModalVisible(true);
  };

  const handleViewTransactions = () => {
    (navigation as any).navigate('TransactionHistory');
  };

  // Logic shifted to expect password from the child component
  const confirmDeactivation = async (submittedPassword: string) => {
    if (!submittedPassword) {
      showFeedback('Error', 'Please enter your password to confirm.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await deactivateAccount(submittedPassword);
      setDeactivateModalVisible(false);

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

  const handlePhoneChange = (value: string) => {
    setEditPhone(formatPhilippinePhoneNumber(value));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? theme.background : 'transparent' }]}
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
              {buildDisplayName(userData?.firstname, userData?.middlename, userData?.lastname)}
          </Text>
          
          {isEditing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
              <Text style={[styles.username, { color: theme.textSecondary, marginRight: 2 }]}>@</Text>
              <TextInput
                style={[
                  styles.editUsernameInput, 
                  { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }
                ]}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="username"
                autoCapitalize="none"
              />
            </View>
          ) : (
            <Text numberOfLines={1} style={[styles.username, { color: theme.textSecondary }]}>
                @{userData?.username || 'user'}
            </Text>
          )}
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
              {/* Email */}
              <View style={styles.infoRow}>
                  <View style={styles.infoLabelContainer}>
                      <Ionicons name="mail-outline" size={20} color={theme.accent} />
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Email</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      style={[styles.editInput, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      placeholder="Enter email"
                      placeholderTextColor={theme.textDisabled}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  ) : (
                    <Text numberOfLines={1} style={[styles.infoValue, { color: theme.textPrimary }]}>{userData?.email || 'N/A'}</Text>
                  )}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              {/* Full Name */}
              <View style={[styles.infoRow, isEditing && {flexDirection: 'column', alignItems: 'flex-start', gap: spacing.sm}]}>
                   <View style={styles.infoLabelContainer}>
                      <Ionicons name="person-outline" size={20} color={theme.accent} />
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Full Name</Text>
                  </View>
                  {isEditing ? (
                    <View style={{width: '100%', gap: spacing.sm, paddingLeft: 28}}>
                      <TextInput 
                        style={[styles.editInputWide, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]} 
                        value={editFirstname} 
                        onChangeText={setEditFirstname} 
                        placeholder="First Name" 
                        placeholderTextColor={theme.textDisabled}
                      />
                      <TextInput 
                        style={[styles.editInputWide, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]} 
                        value={editMiddlename} 
                        onChangeText={setEditMiddlename} 
                        placeholder="Middle Name (Optional)" 
                        placeholderTextColor={theme.textDisabled}
                      />
                      <TextInput 
                        style={[styles.editInputWide, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]} 
                        value={editLastname} 
                        onChangeText={setEditLastname} 
                        placeholder="Last Name" 
                        placeholderTextColor={theme.textDisabled}
                      />
                    </View>
                  ) : (
                    <Text numberOfLines={1} style={[styles.infoValue, { color: theme.textPrimary }]}>
                        {buildDisplayName(userData?.firstname, userData?.middlename, userData?.lastname)}
                    </Text>
                  )}
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
                      onChangeText={handlePhoneChange}
                      placeholder="09XX-XXX-XXXX"
                      placeholderTextColor={theme.textDisabled}
                      keyboardType="phone-pad"
                      maxLength={13}
                    />
                  ) : (
                    <Text style={[styles.infoValue, { color: userData?.phone ? theme.textPrimary : theme.textDisabled }]}>
                      {userData?.phone ? formatPhilippinePhoneNumber(userData.phone) : 'Not set'}
                    </Text>
                  )}
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

              {/* Address - Chunked Layout */}
              <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: spacing.sm }]}>
                  <View style={styles.infoLabelContainer}>
                      <Ionicons name="location-outline" size={20} color={theme.accent} />
                      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Address</Text>
                  </View>
                  {isEditing ? (
                    <View style={{width: '100%', gap: spacing.sm, paddingLeft: 28}}>
                      <TextInput
                        style={[styles.editInputWide, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                        value={editStreet}
                        onChangeText={setEditStreet}
                        placeholder="Unit, Building, House No., Street"
                        placeholderTextColor={theme.textDisabled}
                      />
                      <TextInput
                        style={[styles.editInputWide, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                        value={editBarangay}
                        onChangeText={setEditBarangay}
                        placeholder="Barangay"
                        placeholderTextColor={theme.textDisabled}
                      />
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <TextInput
                          style={[styles.editInputWide, { flex: 2, color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                          value={editCity}
                          onChangeText={setEditCity}
                          placeholder="City / Municipality"
                          placeholderTextColor={theme.textDisabled}
                        />
                        <TextInput
                          style={[styles.editInputWide, { flex: 1.2, color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}
                          value={editZip}
                          onChangeText={setEditZip}
                          placeholder="ZIP Code"
                          keyboardType="number-pad"
                          placeholderTextColor={theme.textDisabled}
                        />
                      </View>
                    </View>
                  ) : (
                    <Text style={[styles.infoValue, { 
                      color: userData?.address ? theme.textPrimary : theme.textDisabled, 
                      textAlign: 'left',
                      width: '100%',
                      paddingLeft: 28 
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

              <TouchableOpacity style={styles.menuItem} onPress={handleViewTransactions}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="receipt-outline" size={22} color={theme.textPrimary} />
                  <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>View POS Transactions</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
              
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

      {/* --- EXTERNAL DEACTIVATION CONFIRMATION MODAL --- */}
      <DeactivateModal
        visible={isDeactivateModalVisible}
        isLoading={isLoading}
        onClose={() => setDeactivateModalVisible(false)}
        onConfirm={confirmDeactivation}
      />

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
  infoLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 0 },
  infoLabel: { ...typography.bodyMd },
  infoValue: { ...typography.bodyMd, fontWeight: '500' as const, flex: 1, textAlign: 'right' as const },
  
  editUsernameInput: {
    ...typography.bodySm,
    fontWeight: '500' as const,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    minWidth: 150,
    maxWidth: 200, 
    textAlign: 'center'
  },

  editInput: { 
    ...typography.bodySm, 
    fontWeight: '500' as const, 
    borderWidth: 1, 
    borderRadius: radii.md, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.xs, 
    width: '60%', 
    textAlign: 'right' 
  },

  editInputWide: { 
    ...typography.bodySm, 
    fontWeight: '500' as const, 
    borderWidth: 1, 
    borderRadius: radii.md, 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    width: '100%', 
    textAlign: 'left' 
  },
  divider: { height: 1, marginHorizontal: spacing.lg },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  menuItemText: { ...typography.bodyLg, fontWeight: '500' as const },
});