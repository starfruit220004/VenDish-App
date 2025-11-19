import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setExpanded(!expanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const heightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[
      styles.item,
      { 
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
        borderColor: isDarkMode ? '#2C2C2E' : '#F0F0F0',
      }
    ]}>
      <TouchableOpacity 
        style={styles.questionContainer} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.questionContent}>
          <View style={[
            styles.iconCircle,
            { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFEBEE' }
          ]}>
            <Ionicons 
              name="help-circle" 
              size={20} 
              color={isDarkMode ? '#FF5252' : '#B71C1C'} 
            />
          </View>
          <Text style={[
            styles.question,
            { color: isDarkMode ? '#FFFFFF' : '#212121' }
          ]}>
            {question}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons 
            name="chevron-down" 
            size={24} 
            color={isDarkMode ? '#BDBDBD' : '#757575'} 
          />
        </Animated.View>
      </TouchableOpacity>
      
      {expanded && (
        <Animated.View style={[
          styles.answerContainer,
          { 
            opacity: heightInterpolate,
            transform: [{ 
              scaleY: heightInterpolate 
            }]
          }
        ]}>
          <View style={[
            styles.answerDivider,
            { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F0' }
          ]} />
          <View style={styles.answerContent}>
            <Ionicons 
              name="checkmark-circle" 
              size={18} 
              color={isDarkMode ? '#4CAF50' : '#43A047'} 
              style={styles.checkIcon}
            />
            <Text style={[
              styles.answer,
              { color: isDarkMode ? '#BDBDBD' : '#616161' }
            ]}>
              {answer}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { 
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  questionContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16,
  },
  questionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  question: { 
    fontWeight: '600', 
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  answerContainer: {
    transformOrigin: 'top',
  },
  answerDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  answerContent: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  answer: { 
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
});