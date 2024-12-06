import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../assets/icons/logo.svg';
import Avatar from '../assets/images/Avatar.png';
import CustomSwitch from './extra/CustomSwitch';

export default function Header() {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient
                colors={['#8E9F8D', '#596558']}
                start={{ x: 1, y: 1 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            >
                <View style={styles.header}>
                    <TouchableOpacity>
                        <Logo height={40} width={40} />
                    </TouchableOpacity>
                    <View style={styles.headerRightContainer}>
                        <CustomSwitch />
                        <TouchableOpacity>
                            <Image source={Avatar} style={styles.avatar} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 0, // Prevents overlap with content below
        backgroundColor: 'transparent', // Matches gradient to avoid visual breaks
    },
    gradientBackground: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginLeft: 10,
    },
});
