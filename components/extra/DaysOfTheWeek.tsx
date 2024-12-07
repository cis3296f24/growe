import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchApprovedLogs } from '../../utils/log'; // Import your fetch function

interface DaysOfTheWeekProps {
  groupRef: any; // Firestore reference for the group
}

const DaysOfTheWeek: React.FC<DaysOfTheWeekProps> = ({ groupRef }) => {
  const [dayLogCounts, setDayLogCounts] = useState<{ [key: string]: number }>({});
  const [totalLogs, setTotalLogs] = useState(0); // Keep track of total logs

  const days = ['su', 'm', 't', 'w', 'th', 'f', 'sa']; // Days of the week

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
            const dayIndex = date.getUTCDay(); // Get day index (0 = Sunday, 6 = Saturday)
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

  const getGoldShade = (percentage: number): string => {
    // Map percentages to gold shades
    if (percentage >= 70) return '#FFD700'; // Pure gold for 70%+
    if (percentage >= 50) return '#FFC107'; // Lighter gold for 50%-69%
    if (percentage >= 30) return '#FFB300'; // Darker gold for 30%-49%
    if (percentage > 0) return '#C7E6C4';
    // gray green
    return '#E5E5E5'; // Default gray for none <30%
  };

  return (
    <View className='flex-row justify-around items-center gap-2'>
      {days.map((day, index) => {
        const logCount = dayLogCounts[day] || 0; // Get log count for the day
        const percentage = totalLogs ? (logCount / totalLogs) * 100 : 0; // Calculate percentage
        const color = getGoldShade(percentage); // Determine color based on percentage

        return (
          <View key={index} style={styles.dayContainer}>
            {/* Circle Indicator */}
            <View
              style={[
                styles.circle,
                { backgroundColor: color }, // Apply gold shade dynamically
              ]}
            />
            {/* Day Label */}
            <Text style={styles.dayText}>{day}</Text>
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
  dayContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E5E5', // Default unselected color
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default DaysOfTheWeek;
