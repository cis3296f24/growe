import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from './UserContext';
import { DocumentReference } from 'firebase/firestore';
import { checkUserHasGroup } from '../utils/group';
import GardenLocalImage from '../assets/images/Garden.png'; // Local image

export function Garden() {
    const router = useRouter();
    const [groups, setGroups] = useState<DocumentReference[]>([]);
    const [hasGroups, setHasGroups] = useState(false);
    const [gardenImage, setGardenImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
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

        // Fetch a random garden image from Lorem Picsum
        const fetchGardenImage = async () => {
            try {
                const response = await fetch('https://picsum.photos/800/600?random');
                setGardenImage(response.url); // Set the remote URL
            } catch (error) {
                console.error('Error fetching garden image:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGardenImage();
    }, [user]);

    return (
        <LinearGradient
            colors={['#8E9F8D', '#596558']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientContainer}
        >
            {hasGroups ? (
                <View style={styles.container}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : (
                        <Image
                            source={
                                gardenImage
                                    ? { uri: gardenImage } // Dynamically fetched image
                                    : GardenLocalImage // Fallback to local image
                            }
                            style={styles.gardenImage}
                            resizeMode="cover"
                        />
                    )}
                    <Text style={styles.text}>Welcome to Your Garden!</Text>
                </View>
            ) : (
                <View style={styles.noGroupContainer}>
                    <Text style={styles.noGroupText}>
                        You need to be in a group to start a garden!
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push({ pathname: '/group', params: {} })}
                    >
                        <Text style={styles.buttonText}>Go to Groups</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        width: '100%',
        height: '70%',
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
