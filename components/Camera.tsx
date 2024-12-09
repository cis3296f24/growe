import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { storage } from "../utils/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import uuid from 'react-native-uuid';
import * as ImageManipulator from 'expo-image-manipulator';
import { useUser } from './UserContext';
import { createLogEntry } from '../utils/log'; 
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useFonts } from 'expo-font';
import {
    Button,
    ButtonText,
    ButtonSpinner,
    ButtonIcon,
    ButtonGroup,
} from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { LinearGradient } from 'expo-linear-gradient';
import Shutter from '@/assets/icons/shutter.svg';
import FlipCamera from '@/assets/icons/flipCamera.svg';
import FlashOn from '@/assets/icons/flashOn.svg';
import FlashOff from '@/assets/icons/flashOff.svg';
import FlashAuto from '@/assets/icons/flashAuto.svg';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useUser();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [fontsLoaded] = useFonts({
    "SF-Pro-Rounded-Regular": require("../assets/fonts/SF-Pro-Rounded-Regular.ttf"),
    "SF-Pro-Rounded-Bold": require("../assets/fonts/SF-Pro-Rounded-Bold.ttf"),
    "cmunci": require("../assets/fonts/cmunci.ttf"),
  });
  // cycle flash
  const [flash, setFlash] = useState(2);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <LinearGradient
      colors={['#8E9F8D', '#596558']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ width: "100%", height: "100%" }}
      >
        <Box className='flex-1 justify-center items-center gap-2'>
          <Heading className='text-center pb-2 font-regular text-white' size='xl'>We need to use the camera.</Heading>
          <Button className="bg-primaryGreen w-auto rounded-2xl" size="xl" variant="solid" action="primary" onPress={requestPermission}>
            <ButtonText className='font-bold'>Grant Permission</ButtonText>
          </Button>
        </Box>
      </LinearGradient>
    );
  }

  const cycleFlash = () => {
    if (flash === 0) {
      setFlash(1);
    } else if (flash === 1) {
      setFlash(2);
    } else {
      setFlash(0);
    }
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
        <LinearGradient
        colors={['#8E9F8D', '#596558']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: "100%", height: "100%" }}
        >
          <Box className='flex-1 pb-32 gap-8'>
            <Image source={{ uri: photoUri }} className='flex-1' />
            <Box className='flex-row justify-evenly'>
              <Button className="bg-primaryGreen w-32 rounded-2xl" size="xl" variant="solid" action="primary" onPress={retakePicture}>
                <ButtonText className='font-bold'>Retake</ButtonText>
              </Button>
              <Button className="bg-primaryGreen w-32 rounded-2xl" size="xl" variant="solid" action="primary" onPress={uploadPicture}>
                <ButtonText className='font-bold'>Keep</ButtonText>
              </Button>
            </Box>
          </Box>
        </LinearGradient>
      ) : (
        <LinearGradient
        colors={['#8E9F8D', '#596558']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: "100%", height: "100%" }}
        >
        <Box className='flex-1 pb-32 gap-8'>
          <CameraView
            style={styles.camera}
            facing={facing}
            ref={cameraRef}
            flash={flash === 0 ? 'off' : flash === 1 ? 'on' : 'auto'}
          >
          </CameraView>
          <Box className='flex-row items-center px-10 justify-between'>
            <TouchableOpacity className='rounded-full bg-primaryGreen p-2' onPress={cycleFlash}>
              {flash === 0 ? <FlashOff height={30} width={30}/> : flash === 1 ? <FlashOn height={30} width={30}/> : <FlashAuto height={30} width={30}/>}
            </TouchableOpacity>
            <TouchableOpacity className='rounded-full bg-primaryGreen p-2' onPress={takePictureAndShowPreview}>
              <Shutter height={50} width={50}/>
            </TouchableOpacity>
            <TouchableOpacity className='rounded-full bg-primaryGreen p-2' onPress={toggleCameraFacing}>
              <FlipCamera height={30} width={30}/>
            </TouchableOpacity>
          </Box>
        </Box>
        </LinearGradient>
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
    flex: 1,
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