import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, useColorScheme } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useReviews } from './ReviewsContext';
import { useAuth } from '../context/AuthContext';
import FeedbackModal, { FeedbackAction, FeedbackVariant } from './FeedbackModal';

type Food = {
  id: number;
  name: string;
  description: string;
  image: any;
  category: string;
};

type FeedStackParamList = {
  WriteReview: { food: Food };
};

type Props = NativeStackScreenProps<FeedStackParamList, "WriteReview">;

export default function WriteReview({ route, navigation }: Props) {
  const { food } = route.params;
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const { addFoodReview, hasReviewedFood } = useReviews();
  const { isLoggedIn, userData } = useAuth();

  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [media, setMedia] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {

    if (isSubmitting || feedbackModal.visible) return;

    if (isLoggedIn && userData) {
      if (hasReviewedFood(food.id, userData.username)) {
        showFeedback(
          "Already Reviewed",
          "You have already shared your thoughts on this dish. Thank you!",
          'info',
          [{ label: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }
  }, [isLoggedIn, userData, food.id, hasReviewedFood, isSubmitting, feedbackModal.visible]);

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
      showFeedback('Error', 'You must be logged in to submit a review', 'error');
      return;
    }

    if (rating === 0) {
      showFeedback('Error', 'Please select a rating!', 'error');
      return;
    }
    
    if (review.trim() === "") {
      showFeedback('Error', 'Please write a review!', 'error');
      return;
    }

    if (hasReviewedFood(food.id, userData.username)) {
      showFeedback('Error', 'You have already reviewed this food item.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addFoodReview({
        foodId: food.id,
        username: userData.username,
        rating,
        review: review.trim(),
        media: media || undefined,
      });

      showFeedback('Review Submitted!', 'Thank you for sharing your experience', 'success');
      
      setTimeout(() => {
        closeFeedback();
        setReview("");
        setRating(0);
        setMedia(null);
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      console.error("Review Error:", error);
      console.error("Review Error Status:", error.response?.status);
      console.error("Review Error Data:", JSON.stringify(error.response?.data));
      
      let msg = 'Failed to submit review. Please try again.';
      if (error.response?.data) {
          if (typeof error.response.data === 'object') {
             msg = Object.entries(error.response.data)
               .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
               .join('\n');
          } else {
             msg = String(error.response.data);
          }
      }
      
      showFeedback('Error', msg, 'error');
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
          Write Review
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Food Info Card */}
        <View style={[styles.foodCard, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
          <Image source={food.image} style={styles.foodImage} />
          <View style={styles.foodInfo}>
            <Text style={[styles.foodName, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
              {food.name}
            </Text>
            <Text style={[styles.foodCategory, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
              {food.category}
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
            placeholder="What did you think about this dish?"
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

      <FeedbackModal
        visible={feedbackModal.visible}
        title={feedbackModal.title}
        message={feedbackModal.message}
        variant={feedbackModal.variant}
        actions={feedbackModal.actions}
        onClose={closeFeedback}
      />
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
    paddingVertical: 5,
    paddingTop: 10,
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
  foodCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  foodInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  foodCategory: {
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
});