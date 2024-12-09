import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchApprovedLogs } from '@/utils/log'; // Import your fetch function

interface DaysOfTheWeekProps {
  groupRef: any; // Firestore reference for the group
}

const DaysOfTheWeek: React.FC<DaysOfTheWeekProps> = ({ groupRef }) => {
  const [dayLogCounts, setDayLogCounts] = useState<{ [key: string]: number }>({});
  const [totalLogs, setTotalLogs] = useState(0); // Keep track of total logs

  const days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']; // Unique abbreviations for internal use
  const displayDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Original abbreviations for display

  const currentDayIndex = new Date().getDay(); // Get current day index (0 = Sunday, 6 = Saturday)

  useEffect(() => {
    const fetchDays = async () => {
      if (!groupRef) {
        console.error('Group reference is not available.');
        return;
      }

      try {
        // Fetch logs using the provided groupRef
        const approvedLogs = await fetchApprovedLogs(groupRef);

        // Count logs for each day of the week
        const logCounts = approvedLogs.reduce<{ [key: string]: number }>((acc, log) => {
          if (log.loggedAt?.seconds) {
            const date = new Date(log.loggedAt.seconds * 1000); // Convert seconds to milliseconds
            const dayIndex = date.getDay(); // Get day index (0 = Sunday, 6 = Saturday)
            const dayAbbreviation = days[dayIndex];
            acc[dayAbbreviation] = (acc[dayAbbreviation] || 0) + 1; // Increment count for the day
          }
          return acc;
        }, {});

        setDayLogCounts(logCounts); // Update state with log counts
        setTotalLogs(approvedLogs.length); // Update total logs
      } catch (error) {
        console.error('Error fetching approved logs:', error);
      }
    };

    fetchDays();
  }, [groupRef]);

  const getOpacity = (percentage: number): number => {
    return percentage / 100; // Convert percentage to opacity (0 to 1)
  };

  return (
    <View className='flex-row gap-2'>
      {days.map((day, index) => {
        const logCount = dayLogCounts[day] || 0; // Get log count for the day
        const percentage = totalLogs ? (logCount / totalLogs) * 100 : 0; // Calculate percentage
        const opacity = getOpacity(percentage); // Determine opacity based on percentage
        const isCurrentDay = index === currentDayIndex; // Check if it's the current day

        return (
          <View key={index} className='items-center'>
            {/* Gray Circle Indicator */}
            <View style={styles.circle} />
            {/* Green Circle Indicator with varying opacity */}
            {logCount > 0 && (
              <View
                style={[
                  styles.circle,
                  { backgroundColor: `rgba(181, 226, 181, ${opacity})` }, // Apply green color with dynamic opacity
                  styles.overlayCircle,
                ]}
              />
            )}
            {/* Inner Dark Green Stroke for Current Day */}
            {isCurrentDay && (
              <View style={styles.currentDayCircle} />
            )}
            {/* Day Label */}
            <Text style={styles.dayText}>{displayDays[index]}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 16,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E5E5', // Default unselected color
    marginBottom: 4,
  },
  overlayCircle: {
    position: 'absolute',
  },
  currentDayCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#99BA99',
  },
  dayText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default DaysOfTheWeek;
