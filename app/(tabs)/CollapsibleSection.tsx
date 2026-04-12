import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
};

export default function CollapsibleSection({ title, children, defaultExpanded = false }: CollapsibleSectionProps) {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [animation] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;

    Animated.timing(animation, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();

    setExpanded(!expanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const bodyInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View
      style={[
        styles.item,
        {
          backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
          borderColor: isDarkMode ? '#2C2C2E' : '#F0F0F0',
        },
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.75}
      >
        <Text style={[styles.title, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
          {title}
        </Text>

        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons
            name="chevron-down"
            size={22}
            color={isDarkMode ? '#BDBDBD' : '#757575'}
          />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View
          style={[
            styles.body,
            {
              opacity: bodyInterpolate,
              transform: [{ scaleY: bodyInterpolate }],
            },
          ]}
        >
          <View
            style={[
              styles.divider,
              { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F0' },
            ]}
          />
          <View style={styles.content}>{children}</View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  body: {
    transformOrigin: 'top',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
}
);