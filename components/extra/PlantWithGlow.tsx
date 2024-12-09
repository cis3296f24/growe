import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { SvgUri } from 'react-native-svg'; // Assuming you're already using this.
import { Spinner } from '@/components/ui/spinner';
import colors, { current } from 'tailwindcss/colors';
import  { Box } from '@/components/ui/box';

interface PlantWithGlowProps {
    currentPlantVector: string | null;
}

const PlantWithGlow: React.FC<PlantWithGlowProps> = ({ currentPlantVector }) => {
  return (
    <Box className='w-80 h-80 relative items-center justify-center'>
      {/* Radial Glow Background */}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient
            id="radialGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            {/* Adjust these stops to get the desired glow effect */}
            <Stop offset="0%" stopColor="rgb(190,211,189)" stopOpacity={0.5} />
            <Stop offset="100%" stopColor="#6B796A" stopOpacity={0} /> 
          </RadialGradient>
        </Defs>
        {/* A rectangle covering the whole area, filled by the radial gradient */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#radialGradient)" />
      </Svg>

      {/* Your Plant Vector Above the Glow */}
      {currentPlantVector ? (
        <SvgUri
          uri={currentPlantVector}
          onError={(e) => console.log('Image failed to load', e)}
          width="100%"
          height="100%"
        />
      ) : (
        <Spinner size="small" color={colors.gray[500]} />
      )}
    </Box>
  );
}

export default PlantWithGlow;