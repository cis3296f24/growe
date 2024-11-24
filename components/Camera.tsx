import React, { useState, useRef } from 'react';
import { View, Button, StyleSheet, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { storage } from "../utils/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import uuid from 'react-native-uuid';
import * as ImageManipulator from 'expo-image-manipulator';
import { useUser } from './UserContext';
import { createLogEntry } from '../utils/log'; 


export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useUser();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);

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

  const takePictureAndShowPreview = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();

        if (!photo) {
          Alert.alert('Failed to take photo');
          return;
        }

        setPhotoUri(photo.uri); 
        setIsPreviewVisible(true); // show the preview
      } catch (error) {
        console.error('Error taking photo: ', error);
        Alert.alert( 'Failed to take photo');
      }
    }
  };

  const uploadPicture = async () => {
    if (!photoUri) {
      Alert.alert('Error', 'No photo to upload');
      return;
    }

    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        photoUri,
        [],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      const filename = `${uuid.v4()}.jpg`;
      const storageRefPath = `logs/${user?.uid}/${filename}`;
      const storageRef = ref(storage, storageRefPath);

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      await createLogEntry(user,downloadURL);

      Alert.alert('Photo uploaded and log entry created!');
      setIsPreviewVisible(false); 
      setPhotoUri(null); // reset photo URI
    } catch (error) {
      console.error('Error uploading photo: ', error);
      Alert.alert( 'Failed to upload photo');
    }
  };

  const retakePicture = () => {
    setIsPreviewVisible(false); 
    setPhotoUri(null); 
  };

  

  return (
    <View style={styles.container}>
      {isPreviewVisible && photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={retakePicture}>
              <Text style={styles.text}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={uploadPicture}>
              <Text style={styles.text}>Keep</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        >
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePictureAndShowPreview}>
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

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
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#00000080',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});