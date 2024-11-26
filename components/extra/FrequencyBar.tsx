import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FrequecyBar = () => {
  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.label}>
        <Text style={styles.labelText}>three days a week</Text>
      </View>

      {/* Badge */}
      <View style={styles.badge}>
        <View style={styles.icon} />
        <Text style={styles.badgeText}>25</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Align the label and badge side by side
    alignItems: 'center', // Center them vertically
  },
  label: {
    backgroundColor: '#A7BEE6', // Light blue background
    borderRadius: 15, // Fully rounded corners
    paddingVertical: 5,
    paddingHorizontal: 10, // Add some padding
    marginRight: 8, // Space between label and badge
  },
  labelText: {
    color: '#FFFFFF', // White text
    fontSize: 14,
    fontWeight: '500', // Semi-bold text
  },
  badge: {
    backgroundColor: '#92A491', // Light green background
    borderRadius: 15, // Fully rounded corners
    flexDirection: 'row', // Align icon and text side by side
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  icon: {
    backgroundColor: '#FFD700', // Gold circle
    width: 12, // Circle size
    height: 12,
    borderRadius: 6, // Fully rounded
    marginRight: 5, // Space between circle and text
  },
  badgeText: {
    color: '#FFFFFF', // White text
    fontSize: 14,
    fontWeight: '500', // Semi-bold text
  },
});

export default FrequecyBar;
