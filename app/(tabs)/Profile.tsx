import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme, 
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
//
import { AuthContext } from '../context/AuthContext'; 

export default function Profile() {
  const { userData, logout, deactivateAccount } = useContext(AuthContext); 
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  // Modal State
  const [isDeactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: logout, style: "destructive" }
      ]
    );
  };

  const handleDeactivatePress = () => {
    setDeactivateModalVisible(true);
  };

  const confirmDeactivation = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password to confirm.");
      return;
    }

    setIsLoading(true);
    try {
      await deactivateAccount(password);
      // Success is handled by logout() inside context, but we can close modal
      setDeactivateModalVisible(false);
      Alert.alert("Account Deactivated", "Your account has been successfully deactivated.");
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to deactivate account. Please check your password.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
      setPassword(''); // Clear password
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
            {userData?.profilePic ? (
                <Image source={{ uri: userData.profilePic }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: '#B71C1C' }]}>
                    <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
            )}
            <TouchableOpacity style={styles.editIconBadge}>
                <Ionicons name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
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
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>Personal Information</Text>
        
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
        </View>
      </View>

      {/* Account Actions Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: subTextColor }]}>Account</Text>
        
        <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
            
            {/* [REPLACED] Settings -> Deactivate Account */}
            <TouchableOpacity style={styles.menuItem} onPress={handleDeactivatePress}>
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