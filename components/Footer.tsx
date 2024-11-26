import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Log from '../assets/icons/log.svg';
import Group from '../assets/icons/group.svg';
import Garden from '../assets/icons/garden.svg';
import { usePathname } from 'expo-router';

export default function Footer() {
  const router = useRouter();
  const [selected, setSelected] = useState('home');
  const pathname = usePathname();

  useEffect(() => {
    console.log(pathname);
    setSelected(pathname.replace('/', ''));
  }, [pathname]);

  const handlePress = (screen: string) => {
    setSelected(screen);
    router.push(`./${screen}`);
  };

  return (
    <View style={styles.footer} testID="footer">
      <TouchableOpacity
        onPress={() => handlePress('home')}
        disabled={selected === 'home'}
        testID="home-button"
      >
        <Garden color={selected === 'home' ? '#ECFFEB' : '#B0C5AF'} testID="home-icon" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handlePress('log')}
        disabled={selected === 'log'}
        testID="log-button"
      >
        <Log color={selected === 'log' ? '#ECFFEB' : '#B0C5AF'} testID="log-icon" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handlePress('group')}
        disabled={selected === 'group'}
        testID="group-button"
      >
        <Group color={selected === 'group' ? '#ECFFEB' : '#B0C5AF'} testID="group-icon" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#4F584F',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
