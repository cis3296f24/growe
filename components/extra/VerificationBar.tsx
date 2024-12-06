import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface VerificationProgressProps {
  frequency?: number; // Frequency value (cells per user)
  totalUsers?: number; // Total number of users
  approvedLogs?: number; // Approved logs
}

const VerificationProgress: React.FC<VerificationProgressProps> = ({
  frequency = 0,
  totalUsers = 0,
  approvedLogs = 0,
}) => {
  const totalCells = frequency * totalUsers; // Total number of cells
  const cappedApprovedCells = Math.min(approvedLogs, totalCells); // Ensure approved cells do not exceed total cells

  return (
    <View style={styles.container}>
      {totalCells > 0 ? (
        <View style={styles.tube}>
          {Array.from({ length: totalCells }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                index < cappedApprovedCells && styles.cellApproved, // Highlight approved cells
              ]}
            />
          ))}
        </View>
      ) : (
        <Text>No data available</Text> // Fallback UI
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  tube: {
    flexDirection: 'row',
    backgroundColor: '#92A491', // Tube background
    borderRadius: 50,
    height: 20,
    width: 300, // Fixed width of the tube
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cell: {
    flex: 1,
    backgroundColor: '#92A491', // Default cell color
    height: '100%',
    marginHorizontal: 0.5,
    borderRadius: 50,
  },
  cellApproved: {
    backgroundColor: '#BED3BD', // Approved cell color
  },
});

export default VerificationProgress;
