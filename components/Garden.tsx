import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from './UserContext';
import { DocumentReference } from 'firebase/firestore';
import { checkUserHasGroup } from '../utils/group';
import PlantGrid from '@/components/PlantGrid';
import GardenLocalImage from '../assets/images/Garden.png'; // Local image

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
            <PlantGrid />
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
