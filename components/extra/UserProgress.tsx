import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Avatar from '../../assets/images/Avatar.png';
import colors, { current } from 'tailwindcss/colors';
import { Box } from '@/components/ui/box';

interface UserProgressProps {
  frequency: number; // Total votes needed to fill the tube
  totalVotes: number; // Votes already completed
}

const UserProgress: React.FC<UserProgressProps> = ({ frequency, totalVotes }) => {
  const totalCells = frequency; // Fixed number of normal cells
  const excessVotes = totalVotes > frequency ? totalVotes - frequency : 0; // Calculate excess votes

  return (
    <Box className='flex-row items-center gap-2 w-full'>
      {/* Avatar */}
      <Box className='pr-1'>
        <Image source={Avatar} className='h-12 w-12 rounded-full' />
      </Box>

      {/* Progress Bar with Outer Tube */}
      <Box className='flex-1'>
        <Box className='flex-row bg-[#92A491] rounded-full h-5 items-center justify-between p-2'>
          {/* Render normal cells */}
          {Array.from({ length: totalCells }).map((_, index) => {
            const isFilled = index < totalVotes;

            return (
              <Box
                key={`normal-${index}`}
                style={[
                  styles.cell,
                  isFilled && styles.filledCell, // Highlight filled cells
                ]}
              />
            );
          })}

          {/* Render excess cells */}
          {Array.from({ length: excessVotes }).map((_, index) => (
            <Box
              key={`excess-${index}`}
              style={[styles.cell, styles.goldCell]} // Excess cells are gold
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1, // Ensures cells evenly distribute space
    height: '100%',
    backgroundColor: '#92A491', // Default unfilled cell color
    borderRadius: 10,
    marginHorizontal: 1, // Reduced space between cells
  },
  filledCell: {
    backgroundColor: '#BED3BD', // Color for filled cells
  },
  goldCell: {
    backgroundColor: 'gold', // Color for excess cells
  },
});

export default UserProgress;
