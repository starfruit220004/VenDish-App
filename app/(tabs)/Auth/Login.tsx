import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Modal 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// CHANGED: Import from the new Context file and your API
import { AuthContext, UserData } from '../../context/AuthContext';
import api from '../../../api/api'; 

type DrawerParamList = {
  Tabs: undefined;
  Login: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  Signup: { redirect?: string; promoId?: string; promoTitle?: string } | undefined;
  ForgotPassword: undefined;
  // ... any other routes you need
};

type LoginNavigationProp = DrawerNavigationProp<DrawerParamList, 'Login'>;
type LoginRouteProp = RouteProp<DrawerParamList, 'Login'>;

type ModalType = 'error' | 'success' | null;

export default function Login() {
  const navigation = useNavigation<LoginNavigationProp>();
  const route = useRoute<LoginRouteProp>();
  
  // Destructure the login function from context
  const { login } = useContext(AuthContext);
  
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      navigation.navigate('Tabs');
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!usernameOrEmail || !password) {
      showModal('error', 'Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Call Backend API
      // Adjust '/api/token/' if your Django URL is different (e.g., /api-token-auth/)
      const response = await api.post('/firstapp/token/', { 
        username: usernameOrEmail, 
        password: password 
      });

      const { access, refresh } = response.data;

      // 2. Prepare User Data 
      // (Ideally, you fetch profile info here with another GET request using the new token)
      const userData: UserData = {
        firstname: "",
        lastname: "",
        username: usernameOrEmail.trim(),
        email: usernameOrEmail.trim(), 
      };

      // 3. Call Context Login (This saves the token to AsyncStorage)
      await login(userData, access, refresh);
      
      // 4. Handle Redirection Logic (e.g. Back to Promos)
      const { redirect, promoId, promoTitle } = route.params || {};
      
      if (redirect === 'promo-claim' && promoId) {
        showModal('success', 'Success! 🎉', `Welcome back!\n\nYou've claimed: ${promoTitle}`);
      } else {
        showModal('success', 'Success!', `Welcome back!`);
      }

    } catch (error: any) {
      console.error('Login Error:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      showModal('error', 'Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/images/Logo2.jpg')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#B71C1C' }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                Login to your account
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={isDarkMode ? '#E0E0E0' : '#757575'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
                  placeholder="Username"
                  placeholderTextColor="#9E9E9E"
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                  autoCapitalize="none"
                  editable={!isLoading}
                  returnKeyType="next"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF' }]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={isDarkMode ? '#E0E0E0' : '#757575'} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFF' : '#424242' }]}
                  placeholder="Password"
                  placeholderTextColor="#9E9E9E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={isDarkMode ? '#E0E0E0' : '#757575'} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={isLoading}
                style={styles.forgotPasswordContainer}
              >
                <Text style={[styles.forgotPasswordText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin} 
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={[styles.signupText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                  Don't have an account? 
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    const params = route.params;
                    if (params?.redirect) {
                      navigation.navigate('Signup', params);
                    } else {
                      navigation.navigate('Signup');
                    }
                  }} 
                  disabled={isLoading}
                >
                  <Text style={[styles.signupLink, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
            <Ionicons 
              name={modalType === 'success' ? 'checkmark-circle' : 'alert-circle'} 
              size={64} 
              color={isDarkMode ? '#FF5252' : '#B71C1C'} 
            />
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              {modalTitle}
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              {modalMessage}
            </Text>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#B71C1C' }]}
              onPress={handleModalClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: { 
    flex: 1, 
    padding: 20,
    minHeight: '100%',
  },
  logoContainer: { 
    alignItems: 'center', 
    marginTop: 30, 
    marginBottom: 40 
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 70,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16 
  },
  formContainer: { 
    width: '100%',
    paddingBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 16, 
    borderRadius: 12, 
    backgroundColor: 'transparent' 
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: { 
    backgroundColor: '#B71C1C', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 20 
  },
  loginButtonDisabled: { 
    opacity: 0.6 
  },
  loginButtonText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  signupContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: { 
    fontSize: 14 
  },
  signupLink: { 
    fontSize: 14, 
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 120,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});