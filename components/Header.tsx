import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';
import Logo from '../assets/icons/logo.svg';
import Avatar from '../assets/images/Avatar.png'
import CustomSwitch from './extra/CustomSwitch';


export default function Header() {
    const [isEnabled, setIsEnabled] = useState(false);
     const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    return (
        <View style={styles.header}>
            <TouchableOpacity >
                <Logo height={40} width={40} color={'#8F9C8F'}/>
            </TouchableOpacity>
            <View style={styles.headerRightContainer}>
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
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingVertical: 15,
        backgroundColor: '#596558',
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
