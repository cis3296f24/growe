import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Camera from '../assets/images/Camera.png'
import Connections from '../assets/images/Connections.png'
import Leaves from '../assets/images/Leaves.png'


export default function Footer() {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => alert("Home pressed")}>
                    <Image source={Connections} style={{width: 33, height: 30}} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => alert("Settings pressed")}>
                    <Image source={Camera} style={{width: 30, height: 30}} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => alert("Profile pressed")}>
                    <Image source={Leaves} style={{width: 30, height: 30}} />
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
    borderTopRightRadius: 20
  },
});
