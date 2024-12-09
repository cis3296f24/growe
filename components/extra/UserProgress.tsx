import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Avatar from '../../assets/images/Avatar.png';
import { Box } from '@/components/ui/box';

interface UserProgressProps {
  frequency: number;        // Total votes needed to fill the tube
  approvedUserLogs: number; // Total approved logs
  totalUserLogs: number;    // Total logs
}

const UserProgress: React.FC<UserProgressProps> = ({ frequency, approvedUserLogs, totalUserLogs }) => {
  // Determine how many cells to render
  const totalCells = Math.max(frequency, totalUserLogs);

  return (
    <Box className='flex-row items-center gap-2 w-full px-4'>
      {/* Avatar */}
      <Box className='pr-1'>
        <Image source={Avatar} className='h-12 w-12 rounded-full' />
      </Box>

      {/* Progress Bar */}
      <Box className='flex-1'>
        <Box className='flex-row bg-[#92A491] rounded-full h-6 items-center justify-between p-1'>
          {Array.from({ length: totalCells }).map((_, index) => {
            const isWithinFrequency = index < frequency;
            const isApproved = index < approvedUserLogs;
            const isPending = index >= approvedUserLogs && index < totalUserLogs;

            let cellColor = '#92A491'; // default (unfilled)
            let cellStyle: any = [styles.cell];

            if (isApproved) {
              // Approved cell
              if (isWithinFrequency) {
                // Approved within frequency
                cellColor = '#BED3BD';
              } else {
                // Approved beyond frequency
                cellColor = '#FFF8AA';
              }
            } else if (isPending) {
              // Pending cell
              if (isWithinFrequency) {
                // Pending within frequency (greenish cell but with a greenish glow)
                cellColor = '#BED3BD';
                cellStyle.push(styles.pendingGlowGreen);
              } else {
                // Pending beyond frequency (gold cell with gold glow)
                cellColor = '#FFF8AA';
                cellStyle.push(styles.pendingGlowGold);
              }
            }

            cellStyle.push({ backgroundColor: cellColor });

            return (
              <View
                key={index}
                style={cellStyle}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    height: '100%',
    borderRadius: 10,
    marginHorizontal: 1,
  },
  // Glow styles for pending cells within frequency
  pendingGlowGreen: {
    opacity: 0.7,
    // iOS shadow
    shadowColor: '#BED3BD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    // For Android, try elevation or background layering tricks
    elevation: 4,
  },
  // Glow styles for pending cells beyond frequency
  pendingGlowGold: {
    // iOS shadow
    opacity: 0.7,
    shadowColor: '#FFF8AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default UserProgress;
