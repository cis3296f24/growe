import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DaysSelectorProps {
  selectedDays: string[]; // Array of selected day abbreviations (e.g., ['m', 'w', 'f'])
}

const DaysSelector: React.FC<DaysSelectorProps> = ({ selectedDays }) => {
  const days = ['s', 'm', 't', 'w', 'th', 'f', 's']; // Days of the week

  return (
    <View style={styles.container}>
      {days.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          {/* Circle Indicator */}
          <View
            style={[
              styles.circle,
              selectedDays.includes(day) && styles.filledCircle, // Apply filled style if the day is selected
            ]}
          />
          {/* Day Label */}
          <Text style={styles.dayText}>{day}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Align the days horizontally
    justifyContent: 'space-around', // Space them evenly
    alignItems: 'center',
    marginVertical: 16,
    width: "60%"
  },
  dayContainer: {
    alignItems: 'center', // Center the circle and text
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10, // Fully rounded
    backgroundColor: '#E5E5E5', // Default unselected circle color (gray)
    marginBottom: 4, // Space between circle and text
  },
  filledCircle: {
    backgroundColor: '#BED3BD', // Filled circle color (light green)
  },
  dayText: {
    fontSize: 12,
    color: '#FFFFFF', // Light gray-green text color
  },
});

export default DaysSelector;
