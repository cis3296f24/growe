import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

export default function CustomSwitch() {
  const [isEnabled, setIsEnabled] = useState(false);
  const togglePosition = useState(new Animated.Value(0))[0]; 

  const toggleSwitch = () => {
    Animated.timing(togglePosition, {
      toValue: isEnabled ? -10 : 37, 
      duration: 200,
      useNativeDriver: false,
    }).start();
    setIsEnabled(!isEnabled);
  };

  return (
    <TouchableOpacity onPress={toggleSwitch} style={styles.switchContainer}>
      <Animated.View style={[styles.circle, { transform: [{ translateX: togglePosition }] }]} />
      <Text style={styles.text}>50</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    width: 57,
    height: 17,
    borderRadius: 8.5, 
    backgroundColor: '#596558', 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10, 
    backgroundColor: '#FFE590', 
    position: 'absolute',
    left: 2, 
  },
  text: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF', 
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
    lineHeight: 14,
    marginLeft: 4 
  },
});
