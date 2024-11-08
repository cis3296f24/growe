import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import Logo from '../assets/icons/logo.svg';
import Avatar from '../assets/images/Avatar.png'


export default function Header() {
    const [isEnabled, setIsEnabled] = useState(false);
     const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    return (
        <View style={styles.header}>
            <TouchableOpacity >
                <Logo height={40} width={40} />
            </TouchableOpacity>
            <View style={styles.headerRightContainer}>
                <Switch
                    trackColor={{ false: '#596558', true: '#596558', }} // Dark green background for both states
                    thumbColor={isEnabled ? '#FFD700' : '#FFD700'}     // Yellow toggle button for both states
                     onValueChange={toggleSwitch}
                     value={isEnabled}
                />
                <TouchableOpacity >
                    <Image source={Avatar} style={styles.avatar} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
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
