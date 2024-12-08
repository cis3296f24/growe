import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface VerificationProgressProps {
  frequency?: number;    // Frequency value (cells per user)
  totalUsers?: number;   // Total number of users
  approvedLogs?: number; // Approved logs
  totalLogs?: number;    // Total logs
}

const VerificationProgress: React.FC<VerificationProgressProps> = ({
  frequency = 0,
  totalUsers = 0,
  approvedLogs = 0,
  totalLogs = 0,
}) => {
  const totalNeeded = frequency * totalUsers;
  const stages = 6; // Fixed number of plant stages
  const logsPerStage = totalNeeded > 0 ? totalNeeded / stages : 0;

  if (totalNeeded === 0) {
    return <Text>No data available</Text>;
  }

  return (
    <View className="justify-center items-center">
      {/* Outer tube */}
      <View className="flex-row bg-[#92A491] rounded-full h-5 w-80 overflow-hidden items-center justify-center p-1">
        {Array.from({ length: stages }).map((_, index) => {
          // Calculate how many logs fall into this cell
          const cellStart = index * logsPerStage;
          const cellEnd = (index + 1) * logsPerStage;

          // Approved logs in this cell
          const approvedInCell = Math.max(0, Math.min(approvedLogs - cellStart, logsPerStage));
          const approvedFraction = logsPerStage > 0 ? approvedInCell / logsPerStage : 0;

          // Total logs in this cell (approved + pending)
          const totalInCell = Math.max(0, Math.min(totalLogs - cellStart, logsPerStage));
          const totalFraction = logsPerStage > 0 ? totalInCell / logsPerStage : 0;

          // Pending fraction = totalFraction - approvedFraction
          const pendingFraction = Math.max(0, totalFraction - approvedFraction);

          // Determine cell style
          let cellContent = null;

          if (totalFraction > 0) {
            // The cell is partially or fully filled
            // If fully filled (totalFraction === 1), just solid color (#BED3BD)
            // If partially filled (totalFraction < 1), show a gradient from #BED3BD to #92A491
            const cellWidth = 0; // We'll use flex:1, so we rely on parent layout for sizing
            const gradientColors: [string, string] = totalFraction < 1
              ? ['#BED3BD', '#92A491'] // partial fill gradient
              : ['#BED3BD', '#BED3BD']; // full fill (no gradient visually, same color start & end)

            cellContent = (
              <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[
                    styles.fillContainer,
                    { flex: totalFraction }, // fill up to the fraction
                  ]}
                >
                  {/* Approved portion: solid fill (no glow) */}
                  {approvedFraction > 0 && (
                    <View
                      style={[
                        styles.innerSegment,
                        { flex: approvedFraction / totalFraction }, // proportion of the filled area
                      ]}
                    />
                  )}

                  {/* Pending portion: if any, has a glow */}
                  {pendingFraction > 0 && (
                    <View
                      style={[
                        styles.innerSegment,
                        styles.pendingGlow,
                        { flex: pendingFraction / totalFraction },
                      ]}
                    />
                  )}
                </LinearGradient>
              </View>
            );
          }

          return (
            <View key={index} style={styles.cellOuter}>
              {/* Base cell */}
              <View style={styles.cell}>
                {cellContent}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cellOuter: {
    flex: 1,
    marginHorizontal: 1,
    position: 'relative',
  },
  cell: {
    flex: 1,
    backgroundColor: '#92A491', // default background
    borderRadius: 50,
    overflow: 'hidden',
  },
  fillContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  innerSegment: {
    backgroundColor: '#BED3BD', // approved/pending base color
  },
  pendingGlow: {
    // Add glow/shadow for pending portion
    shadowColor: '#BED3BD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default VerificationProgress;
