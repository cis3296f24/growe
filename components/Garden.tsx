import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from './UserContext';
import { DocumentReference } from 'firebase/firestore';
import { checkUserHasGroup } from '../utils/group';
import PlantGrid from '../components/Platform';
import GardenLocalImage from '../assets/images/Garden.png'; // Local image
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Svg, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

export function Garden() {
    const router = useRouter();
    const [groups, setGroups] = useState<DocumentReference[]>([]);
    const [hasGroups, setHasGroups] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        const fetchGroups = async () => {
            if (!user) {
                console.error('User not found in Garden component');
                setHasGroups(false);
                return;
            }
            const groupResult = await checkUserHasGroup(user);
            if (!groupResult) setHasGroups(false);
            setGroups(groupResult);
            setHasGroups(true);
        };
        fetchGroups();
    }, [user]);

       return (
        <LinearGradient
            colors={['#8E9F8D', '#596558']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: "100%", height: "100%" }}
        >
            <Box className='flex-col justify-center items-center align-middle translate-y-[200]'>
                <Heading className='text-center text-white translate-y-[-50]' size='2xl'>{`Hi ${user?.displayName?.charAt(0).toUpperCase()}${user?.displayName?.slice(1)}`}</Heading>
                <Box className='justify-center items-center'>
                    <Box className='w-80 h-80 relative items-center justify-center'>
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
                                <Stop offset="0%" stopColor="rgb(190,211,189)" stopOpacity={0.75} />
                                <Stop offset="100%" stopColor="#6B796A" stopOpacity={0} /> 
                            </RadialGradient>
                            </Defs>
                            {/* A rectangle covering the whole area, filled by the radial gradient */}
                            <Rect x="0" y="0" width="100%" height="100%" fill="url(#radialGradient)" />
                        </Svg>
                    
                        <PlantGrid />
                    </Box>
                </Box>
            </Box>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gardenImage: {
        width: 250,
        height: '50%',
        borderRadius: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
    },
    noGroupContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    noGroupText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Garden;
