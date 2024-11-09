import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Camera from '../assets/images/Camera.png'
import Connections from '../assets/images/Connections.png'
import Leaves from '../assets/images/Leaves.png'


export default function Footer() {
    const [selectedButton, setSelectedButton] = useState<number | null>(null);
    const navigationImages = [Connections, Camera, Leaves];



    return (
        <View style={styles.footer}>
            {navigationImages.map((image, i) => {
                return <TouchableOpacity key={i} onPress={() => setSelectedButton(i)} >
                    <Image source={image} style={[
                        styles.image,
                        selectedButton === i && styles.selectedImage
                    ]} />
                </TouchableOpacity>
            })}
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
        borderTopRightRadius: 20
    },
    image: {
        width: 30,
        height: 30,
        opacity: 0.5,
    },
    selectedImage: {
        opacity: 1,
    },
});
