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

export default function Profile() {
  const { userData, logout, updateUserData } = useAuth();
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

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

  // Colors
  const textColor = isDarkMode ? '#FFF' : '#333';
  const subTextColor = isDarkMode ? '#CCC' : '#666';
  const bgColor = isDarkMode ? '#000' : '#F9F9F9';
  const cardColor = isDarkMode ? '#1C1C1E' : '#FFF';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: cardColor }]}>
        <View style={styles.avatarContainer}>
            {(editProfilePic || userData?.profilePic) ? (
                <Image source={{ uri: editProfilePic || userData?.profilePic }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: '#B71C1C' }]}>
                    <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
            )}
            {isEditing && (
              <TouchableOpacity style={styles.editIconBadge} onPress={pickProfileImage}>
                  <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            )}
        </View>

        <Text style={[styles.name, { color: textColor }]}>
            {userData?.firstname} {userData?.middlename ? userData.middlename + ' ' : ''}{userData?.lastname}
        </Text>
        <Text style={[styles.username, { color: subTextColor }]}>
            @{userData?.username || 'user'}
        </Text>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={[styles.sectionTitle, { color: subTextColor, marginBottom: 0 }]}>Personal Information</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={startEditing} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="create-outline" size={18} color="#B71C1C" />
              <Text style={{ color: '#B71C1C', fontWeight: '600', fontSize: 14 }}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={cancelEditing} disabled={isSaving}>
                <Text style={{ color: subTextColor, fontWeight: '600', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveProfile} disabled={isSaving} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#B71C1C" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#B71C1C" />
                    <Text style={{ color: '#B71C1C', fontWeight: '600', fontSize: 14 }}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
            <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                    <Ionicons name="mail-outline" size={20} color="#B71C1C" />
                    <Text style={[styles.infoLabel, { color: subTextColor }]}>Email</Text>
                </View>
                <Text style={[styles.infoValue, { color: textColor }]}>{userData?.email || 'N/A'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
                 <View style={styles.infoLabelContainer}>
                    <Ionicons name="person-outline" size={20} color="#B71C1C" />
                    <Text style={[styles.infoLabel, { color: subTextColor }]}>Full Name</Text>
                </View>
                <Text style={[styles.infoValue, { color: textColor }]}>
                    {userData?.firstname} {userData?.middlename ? userData.middlename + '. ' : ''}{userData?.lastname}
                </Text>
            </View>

            <View style={styles.divider} />

            {/* Phone */}
            <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                    <Ionicons name="call-outline" size={20} color="#B71C1C" />
                    <Text style={[styles.infoLabel, { color: subTextColor }]}>Phone</Text>
                </View>
                {isEditing ? (
                  <TextInput
                    style={[styles.editInput, { color: textColor, borderColor: isDarkMode ? '#555' : '#DDD', backgroundColor: isDarkMode ? '#2C2C2E' : '#FAFAFA' }]}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="Enter phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: userData?.phone ? textColor : '#999' }]}>
                    {userData?.phone || 'Not set'}
                  </Text>
                )}
            </View>

            <View style={styles.divider} />

            {/* Address */}
            <View style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                    <Ionicons name="location-outline" size={20} color="#B71C1C" />
                    <Text style={[styles.infoLabel, { color: subTextColor }]}>Address</Text>
                </View>
                {isEditing ? (
                  <TextInput
                    style={[styles.editInput, { color: textColor, borderColor: isDarkMode ? '#555' : '#DDD', backgroundColor: isDarkMode ? '#2C2C2E' : '#FAFAFA' }]}
                    value={editAddress}
                    onChangeText={setEditAddress}
                    placeholder="Enter your address"
                    placeholderTextColor="#999"
                    multiline
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: userData?.address ? textColor : '#999', flex: 1, textAlign: 'right' }]}>
                    {userData?.address || 'Not set'}
                  </Text>
                )}
            </View>
        </View>
      </View>

      {/* Account Actions Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>Account</Text>
        
        <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
            
            {/* [REPLACED] Settings -> Deactivate Account */}
            <TouchableOpacity style={styles.menuItem} onPress={handleDeactivate}>
                <View style={styles.menuItemLeft}>
                    <Ionicons name="trash-outline" size={22} color={textColor} />
                    <Text style={[styles.menuItemText, { color: textColor }]}>Deactivate Account</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={subTextColor} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <View style={styles.menuItemLeft}>
                    <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
                    <Text style={[styles.menuItemText, { color: "#D32F2F" }]}>Log Out</Text>
                </View>
            </TouchableOpacity>
        </View>
      </View>

      {/* --- DEACTIVATION CONFIRMATION MODAL --- */}
      <Modal
        visible={isDeactivateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeactivateModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
            <View style={styles.modalHeader}>
                <View style={[styles.warningIcon, { backgroundColor: '#FFEBEE' }]}>
                     <Ionicons name="warning" size={32} color="#D32F2F" />
                </View>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#333' }]}>
                    Deactivate Account?
                </Text>
            </View>
            
            <Text style={[styles.modalText, { color: isDarkMode ? '#CCC' : '#666' }]}>
              This action will log you out immediately. Your account will be permanently deleted after 30 days unless you reactivate it.
            </Text>

            <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#333' }]}>
                Confirm Password
            </Text>
            
            <TextInput
              style={[
                  styles.input, 
                  { 
                      color: isDarkMode ? '#FFF' : '#333',
                      borderColor: isDarkMode ? '#555' : '#DDD',
                      backgroundColor: isDarkMode ? '#2C2C2E' : '#FAFAFA'
                  }
              ]}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                    setDeactivateModalVisible(false);
                    setPassword('');
                }}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 30, marginBottom: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 2 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#333', padding: 6, borderRadius: 15, borderWidth: 2, borderColor: '#FFF' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  username: { fontSize: 16 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  infoCard: { borderRadius: 16, padding: 5, elevation: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 15 },
  infoLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 16 },
  infoValue: { fontSize: 16, fontWeight: '500' },
  editInput: { fontSize: 15, fontWeight: '500', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 140, textAlign: 'right' },
  divider: { height: 1, backgroundColor: 'rgba(150, 150, 150, 0.1)', marginHorizontal: 15 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 15 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemText: { fontSize: 16, fontWeight: '500' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});