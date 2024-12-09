import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Log from '../assets/icons/log.svg';
import Group from '../assets/icons/group.svg';
import Garden from '../assets/icons/garden.svg';
import { usePathname } from 'expo-router';
import { useUser } from './UserContext';
import { getPlant } from '../utils/group';
import { User } from 'firebase/auth';
import { Box } from '@/components/ui/box';
import { DocumentReference } from 'firebase/firestore';

export default function Footer() {
  const router = useRouter();
  const [selected, setSelected] = useState('home');
  const pathname = usePathname();
  const { user } = useUser();
  const [hasPlant, setHasPlant] = useState(false);

  useEffect(() => {
    console.log(pathname);
    setSelected(pathname.replace('/', ''));
  }, [pathname]);

  useEffect(() => {
    const checkForPlant = async (user: User) => {
      if (user) {
        const result = await getPlant(user)
        if (result) {
          setHasPlant(true);
        } else {
          setHasPlant(false);
        }
      }
    }
    if (user) {
      checkForPlant(user);
    } else {
      setHasPlant(false);
    }
  });

  const handlePress = (screen: string) => {
    setSelected(screen);
    router.push(`./${screen}`);
  };

  return (
    <Box className="absolute bottom-0 left-0 right-0 h-24 bg-[#4F584F] flex flex-row justify-around items-center px-2.5 rounded-tl-2xl rounded-tr-2xl pb-6">
      <TouchableOpacity onPress={() => handlePress('home')} disabled={selected === 'home'}>
        <Garden height={30} width={30} color={selected === 'home' ? '#ECFFEB' : '#B0C5AF'} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('log')} disabled={selected === 'log' || !hasPlant}>
        {hasPlant ? (
          <Log height={30} width={30} color={selected === 'log' ? '#ECFFEB' : '#B0C5AF'} />
        ) : (
          <Log height={30} width={30} color={'#757C75'} />
        )  
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePress('group')} disabled={selected === 'group'}>
        <Group height={30} width={30} color={selected === 'group' ? '#ECFFEB' : '#B0C5AF'} />
      </TouchableOpacity>
    </Box>
  );
}