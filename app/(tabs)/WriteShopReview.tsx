import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, useColorScheme, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useReviews } from './ReviewsContext';
import api from "../../api/api";
import { useAuth } from '../context/AuthContext';

type WriteShopReviewProps = {
  navigation: any;
  route?: {
    params?: {
      editReview?: {
        id: string;
        rating: number;
        review: string;
        media?: string | null;
      };
    };
  };
};

export default function WriteShopReview({ navigation, route }: WriteShopReviewProps) {
  const editReview = route?.params?.editReview;
  const isEditMode = Boolean(editReview?.id);
  const editReviewId = editReview?.id;
  const editReviewRating = editReview?.rating ?? 0;
  const editReviewText = editReview?.review ?? '';
  const editReviewMedia = editReview?.media ?? null;
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const { hasReviewedShopToday, updateReview } = useReviews();
  const { isLoggedIn, userData } = useAuth();

  const [review, setReview] = useState(editReviewText);
  const [rating, setRating] = useState(editReviewRating);
  const [media, setMedia] = useState<string | null>(editReviewMedia);
  const [mediaRemoved, setMediaRemoved] = useState(false);
  const [hasNewMedia, setHasNewMedia] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    if (!isEditMode || !editReviewId) return;
    setReview(editReviewText);
    setRating(editReviewRating);
    setMedia(editReviewMedia);
    setMediaRemoved(false);
    setHasNewMedia(false);
  }, [isEditMode, editReviewId, editReviewRating, editReviewText, editReviewMedia]);

  useEffect(() => {
    if (isLoggedIn && userData) {
      // Check profile completeness — phone, address, and profile picture are all required
      const missingFields: string[] = [];
      if (!userData.phone) missingFields.push('Phone Number');
      if (!userData.address) missingFields.push('Address');
      if (!userData.profilePic) missingFields.push('Profile Picture');

      if (missingFields.length > 0) {
        setProfileIncomplete(true);
        return; // Don't check daily limit yet — profile gate takes priority
      }
      setProfileIncomplete(false);

      if (!isEditMode && hasReviewedShopToday(userData.username)) {
        setErrorMessage("You can only submit one shop review per day. Please come back tomorrow!");
        setErrorModalVisible(true);
      }
    }
  }, [isLoggedIn, userData, hasReviewedShopToday, isEditMode]);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      setMediaRemoved(false);
      setHasNewMedia(true);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn || !userData) {
      setErrorMessage('You must be logged in to submit a review');
      setErrorModalVisible(true);
      return;
    }

    if (profileIncomplete) {
      setProfileIncomplete(true);
      return;
    }

    if (rating === 0) {
      setErrorMessage('Please select a rating!');
      setErrorModalVisible(true);
      return;
    }
    if (review.trim() === "") {
      setErrorMessage('Please write a review!');
      setErrorModalVisible(true);
      return;
    }
    if (!isEditMode && hasReviewedShopToday(userData.username)) {
      setErrorMessage('You can only submit one shop review per day. Please come back tomorrow!');
      setErrorModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editReviewId) {
        await updateReview(editReviewId, {
          rating,
          review: review.trim(),
          media,
          removeMedia: mediaRemoved,
          hasNewMedia,
        });
      } else {
        const formData = new FormData();
        formData.append('review_type', 'shop');
        formData.append('rating', rating.toString());
        formData.append('comment', review.trim());
        
        if (media) {
          // @ts-ignore
          formData.append('image', {
            uri: media,
            name: 'review_image.jpg',
            type: 'image/jpeg',
          });
        }

        await api.post('/firstapp/reviews/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        setReview("");
        setRating(0);
        setMedia(null);
        setMediaRemoved(false);
        setHasNewMedia(false);
        navigation.goBack();
      }, 2000);

    } catch (error: any) {
      console.error("Review Error:", error);
      // Cleanly extract the error message from the backend
      const errorData = error.response?.data;
      const msg = errorData?.error ? errorData.error : (errorData ? JSON.stringify(errorData) : 'Failed to submit review.');
      
      setErrorMessage(msg);
      setErrorModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaRemoved(true);
    setHasNewMedia(false);
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
    // If they hit the daily limit, pop them back to the previous screen when they dismiss the error
    if (!isEditMode && isLoggedIn && userData && hasReviewedShopToday(userData.username)) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : 'transparent' }]}> 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={26} color={isDarkMode ? '#FFFFFF' : '#B71C1C'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          {isEditMode ? 'Edit Shop Review' : 'Review Shop'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shop Info Card */}
        <View style={[styles.shopCard, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
          <Image 
            source={require('../../assets/images/Logo2.jpg')} 
            style={styles.shopLogo}
          />
          <View style={styles.shopInfo}>
            <Text style={[styles.shopName, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              Kuya Vince Carenderia
            </Text>
            <Text style={[styles.shopDesc, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              Share your experience with our shop
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
            Rate Your Experience
          </Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={42}
                  color={star <= rating ? "#FFC107" : (isDarkMode ? "#424242" : "#E0E0E0")}
                  style={{ marginHorizontal: 6 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={[styles.ratingText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              {rating === 5 ? "Excellent! 🌟" : rating === 4 ? "Great! 😊" : rating === 3 ? "Good 👍" : rating === 2 ? "Fair 😐" : "Needs Improvement 😕"}
            </Text>
          )}
        </View>

        {/* Review Section */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
            Share Your Thoughts
          </Text>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDarkMode ? '#000' : '#F5F5F5',
                color: isDarkMode ? '#FFFFFF' : '#424242',
                borderColor: isDarkMode ? '#424242' : '#E0E0E0'
              }
            ]}
            placeholder="Tell us about your experience at our shop..."
            placeholderTextColor={isDarkMode ? '#757575' : '#9E9E9E'}
            multiline
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
            {review.length} characters
          </Text>
        </View>

        {/* Media Section */}
        <View style={[styles.section, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
            Add Photo or Video
          </Text>
          
          {!media ? (
            <TouchableOpacity 
              style={[styles.mediaButton, { borderColor: isDarkMode ? '#424242' : '#E0E0E0' }]} 
              onPress={pickMedia}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={32} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
              <Text style={[styles.mediaButtonText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                Upload Photo/Video
              </Text>
              <Text style={[styles.mediaButtonSubtext, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
                Optional
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: media }} style={styles.preview} />
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={removeMedia}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={32} color="#B71C1C" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!rating || review.trim() === "" || isSubmitting) && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!rating || review.trim() === "" || isSubmitting}
        >
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Review' : 'Submit Review')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalBox,
            { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <Ionicons name="checkmark-circle" size={64} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              {isEditMode ? 'Review Updated!' : 'Review Submitted!'}
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              {isEditMode ? 'Your review changes were saved.' : 'Thank you for sharing your experience'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Profile Incomplete Gate Modal */}
      <Modal visible={profileIncomplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="person-circle-outline" size={48} color="#E65100" />
            </View>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Complete Your Profile
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575', marginBottom: 12 }]}>
              Please fill up the following fields on your Profile page before writing a review:
            </Text>
            <View style={{ alignSelf: 'stretch', marginBottom: 16, gap: 8 }}>
              {!userData?.phone && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(183, 28, 28, 0.06)' }}>
                  <Ionicons name="call-outline" size={18} color="#B71C1C" />
                  <Text style={{ fontSize: 15, fontWeight: '500', color: isDarkMode ? '#FFF' : '#333' }}>Phone Number</Text>
                </View>
              )}
              {!userData?.address && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(183, 28, 28, 0.06)' }}>
                  <Ionicons name="location-outline" size={18} color="#B71C1C" />
                  <Text style={{ fontSize: 15, fontWeight: '500', color: isDarkMode ? '#FFF' : '#333' }}>Address</Text>
                </View>
              )}
              {!userData?.profilePic && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(183, 28, 28, 0.06)' }}>
                  <Ionicons name="image-outline" size={18} color="#B71C1C" />
                  <Text style={{ fontSize: 15, fontWeight: '500', color: isDarkMode ? '#FFF' : '#333' }}>Profile Picture</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F5F5F5', flex: 1 }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#B71C1C', flex: 1 }]}
                onPress={() => {
                  navigation.navigate('Profile');
                }}
              >
                <Text style={styles.modalButtonText}>Go to Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={errorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalBox,
            { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <Ionicons name="alert-circle" size={64} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Oops!
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              {errorMessage}
            </Text>
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#B71C1C' }]}
              onPress={handleErrorModalClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  shopCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  shopLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  shopInfo: {
    flex: 1,
    marginLeft: 16,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shopDesc: {
    fontSize: 14,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    height: 150,
    fontSize: 16,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  mediaButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  mediaButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
  },
  submitButton: {
    backgroundColor: '#B71C1C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    elevation: 4,
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9E9E9E',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    borderRadius: 20,
    padding: 40,
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
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 9,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 120,
    marginTop: 16,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});