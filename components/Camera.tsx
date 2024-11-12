import React, { useState, useRef } from 'react';
import { View, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { storage, db } from "../utils/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import uuid from 'react-native-uuid';
import * as ImageManipulator from 'expo-image-manipulator';
import { useUser } from './UserContext';
import { Timestamp } from 'firebase/firestore';
import { addDoc, collection, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useUser();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePictureAndUpload = async () => {

    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();

        if (!photo) {
          alert('Failed to take photo');
          return;
        }

        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        const response = await fetch(manipResult.uri);
        const blob = await response.blob();

        const filename = `${uuid.v4()}.jpg`;
        const storageRef = ref(storage, `logs/${user?.uid}/${filename}`);

        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);

        await createLogEntry(downloadURL);

        alert('Photo uploaded and log entry created!');
      } catch (error) {
        console.error('Error uploading photo: ', error);
        alert('Failed to upload photo');
      }
    }
  };

  const createLogEntry = async (imageUrl: string) => {
    try {
      if (!user) {
        alert('User not found');
        return;
      }

      const userRef = doc(db, 'users', user.uid);

      await addDoc(collection(db, 'logs'), {
        author: userRef,
        voteUnsure: [],
        voteApprove: [],
        voteDeny: [],
        logImageUrl: imageUrl,
        loggedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error creating log entry: ', error);
      alert('Failed to create log entry');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePictureAndUpload}>
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});