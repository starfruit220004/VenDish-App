import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, useColorScheme, Modal, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useReviews } from './ReviewsContext';
import { AuthContext } from './MainDrawer';

type WriteShopReviewProps = {
  navigation: any;
  route?: any;
};

export default function WriteShopReview({ navigation }: WriteShopReviewProps) {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const { addShopReview } = useReviews();
  const { isLoggedIn, userData } = useContext(AuthContext);

  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [media, setMedia] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn || !userData) {
      Alert.alert('Error', 'You must be logged in to submit a review');
      return;
    }

    if (rating === 0) {
      Alert.alert("Error", "Please select a rating!");
      return;
    }
    if (review.trim() === "") {
      Alert.alert("Error", "Please write a review!");
      return;
    }

    setIsSubmitting(true);
    try {
      await addShopReview({
        username: userData.username,
        rating,
        review: review.trim(),
        media: media || undefined,
      });

      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        setReview("");
        setRating(0);
        setMedia(null);
        navigation.goBack();
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = () => {
    setMedia(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
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
          Review Shop
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
          <Ionicons name="restaurant" size={64} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
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
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
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
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Review Submitted!
            </Text>
            <Text style={[styles.modalText, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              Thank you for sharing your experience
            </Text>
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
});