import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Avatar from '../../assets/images/Avatar.png';

interface UserProgressProps {
  frequency: number; // Total votes needed to fill the tube
  totalVotes: number; // Votes already completed
}

const UserProgress: React.FC<UserProgressProps> = ({ frequency, totalVotes }) => {
  const totalCells = Math.max(frequency, totalVotes); // Expand tube for overflow votes

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={Avatar} style={styles.avatar} />
      </View>

      {/* Progress Bar with Outer Tube */}
      <View style={styles.barContainer}>
        <View style={styles.tube}>
          {Array.from({ length: totalCells }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                index < totalVotes && index < frequency && styles.filledCell, // Normal filled cells
                index < totalVotes && index >= frequency && styles.overflowCell, // Overflow cells in gold
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    width: '90%',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  barContainer: {
    flex: 1,
  },
  tube: {
    flexDirection: 'row',
    backgroundColor: '#92A491', // Tube background color
    borderRadius: 10,
    paddingHorizontal: 2, // Adjusted for snug fit
    paddingVertical: 2,
    height: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1, // Ensures cells evenly distribute space
    height: '100%',
    backgroundColor: '#92A491', // Default unfilled cell color
    borderRadius: 10,
    marginHorizontal: 1, // Reduced space between cells
  },
  filledCell: {
    backgroundColor: '#BED3BD', // Normal filled cell color (brighter green)
  },
  overflowCell: {
    backgroundColor: '#FFF8AA', // Gold for overflow cells
  },
});

export default UserProgress;
