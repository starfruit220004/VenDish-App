import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  useColorScheme, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../api/api'; // Ensure this points to your configured Axios instance

type DrawerParamList = {
  Login: undefined;
};

export default function ForgotPassword() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  // --- STATE ---
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);

  // Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(''); // Token received from backend
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Styles
  const textColor = isDarkMode ? '#FFF' : '#424242';
  const bgColor = isDarkMode ? '#000' : '#FFEBEE';
  const inputBg = isDarkMode ? '#1C1C1E' : '#FFF';
  const placeholderColor = '#9E9E9E';

  // --- ACTIONS ---

  // Step 1: Request OTP
  const handleRequestOTP = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    
    setLoading(true);
    try {
      const response = await api.post('/request-otp/', { email });
      
      // FOR DEV: Since your backend sends the OTP in the response, show it here
      if (response.data.otp) {
        Alert.alert('Development Mode', `Your OTP is: ${response.data.otp}`);
      } else {
        Alert.alert('Success', 'OTP code sent to your email!');
      }
      setStep(2);
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || "Failed to send OTP";
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) return Alert.alert('Error', 'Please enter the 6-digit code');

    setLoading(true);
    try {
      const response = await api.post('/verify-otp/', { 
        email, 
        otp 
      });

      // Backend returns a 'token' required for the next step
      if (response.data.token) {
        setResetToken(response.data.token);
        Alert.alert('Verified', 'Code accepted. Please set your new password.');
        setStep(3);
      } else {
        Alert.alert('Error', 'Verification failed. No token received.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || "Invalid Code";
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Change Password
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) return Alert.alert('Error', 'Please fill all fields');
    if (newPassword !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');

    setLoading(true);
    try {
      await api.post('/change-password-token/', {
        email,
        token: resetToken, // Send the token we got in Step 2
        password: newPassword
      });

      Alert.alert('Success!', 'Your password has been reset. Please login.', [
        { text: 'Login Now', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.details || error.response?.data?.label || "Failed to reset password";
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <Ionicons name="mail-outline" size={20} color="#757575" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Email Address"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleRequestOTP} disabled={loading}>
               {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <Ionicons name="key-outline" size={20} color="#757575" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Enter 6-Digit OTP"
                placeholderTextColor={placeholderColor}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleVerifyOTP} disabled={loading}>
               {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Verify Code</Text>}
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#757575" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="New Password"
                placeholderTextColor={placeholderColor}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#757575" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Confirm Password"
                placeholderTextColor={placeholderColor}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword} disabled={loading}>
               {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🔐</Text>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>
          {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'Reset Password'}
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
          {step === 1 ? 'Enter your email to receive a code' : 
           step === 2 ? `Enter the code sent to ${email}` : 
           'Create a strong new password'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        {renderStepContent()}

        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.navigate('Login')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
          <Text style={[styles.backLink, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
            {step === 1 ? 'Back to Login' : 'Go Back'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  logoContainer: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logo: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  formContainer: { width: '100%' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    borderRadius: 12, paddingHorizontal: 12, height: 55, elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  actionButton: { 
    backgroundColor: '#B71C1C', paddingVertical: 16, borderRadius: 12, 
    alignItems: 'center', marginBottom: 20, elevation: 3 
  },
  actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  backLink: { fontSize: 16, fontWeight: 'bold' },
});