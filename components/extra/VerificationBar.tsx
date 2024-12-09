import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

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
    <View style={styles.container}>
      {/* Outer tube */}
      <View style={styles.outerTube}>
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
            const fillWidthPercent = totalFraction * 100;

            cellContent = (
              <View style={[styles.fillContainer, { width: `${fillWidthPercent}%` }]}>
                {/* Approved portion */}
                {approvedFraction > 0 && (
                  <View
                    style={[
                      styles.innerSegment,
                      { flex: approvedFraction / totalFraction },
                    ]}
                  />
                )}

                {/* Pending portion */}
                {pendingFraction > 0 && (
                  <View
                    style={[
                      styles.innerSegment,
                      styles.pendingGlow,
                      { flex: pendingFraction / totalFraction },
                    ]}
                  />
                )}
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
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerTube: {
    flexDirection: 'row',
    backgroundColor: '#92A491',
    borderRadius: 50,
    height: 20,
    width: 320,
    overflow: 'hidden',
    padding: 2,
  },
  cellOuter: {
    flex: 1,
    marginHorizontal: 1,
  },
  cell: {
    flex: 1,
    backgroundColor: '#92A491',
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  fillContainer: {
    flexDirection: 'row',
    height: '100%',
    backgroundColor: '#BED3BD',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  innerSegment: {
    backgroundColor: '#BED3BD',
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
