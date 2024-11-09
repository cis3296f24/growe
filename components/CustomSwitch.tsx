import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CustomStaticSwitch() {
  return (
    <View style={styles.switchContainer}>
      <View style={styles.circle} />
      <Text style={styles.text}>50</Text>
    </View>
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
    position: "absolute",
    left: -10,
    backgroundColor: '#FFE590',
    marginLeft: 2, // Keeps the circle on the left side
  },
  text: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
    lineHeight: 14,
  },
});
