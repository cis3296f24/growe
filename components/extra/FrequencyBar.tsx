import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';

interface FrequencyBarProps {
  frequency: number;
  code: string;
}

const FrequencyBar: React.FC<FrequencyBarProps> = ({ frequency, code }) => {
  const days: { [key: number]: string } = {
    1: 'one day a week',
    2: 'two days a week',
    3: 'three days a week',
    4: 'four days a week',
    5: 'five days a week',
    6: 'six days a week',
    7: 'seven days a week',
  };
  return (
    <Box className="flex-row items-center gap-2">
      <Box className="bg-blue-300 p-1 px-3 rounded-full">
        <Text className="text-white font-bold">{days[frequency]}</Text>
      </Box>
      <Box className="bg-violet-300 p-1 px-3 rounded-full">
        <Text className="text-white font-bold">{code}</Text>
      </Box>
    </Box>
  );
};

export default FrequencyBar;
