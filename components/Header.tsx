import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Alert, Modal, View, Text, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Svg, Circle, Path } from 'react-native-svg';
import Logo from '@/assets/icons/logo.svg';
import LogOut from '@/assets/icons/logOut.svg';
import Profile from '@/assets/icons/profile.svg';
import { Box } from '@/components/ui/box';
import {
    Menu,
    MenuItem,
    MenuItemLabel,
} from '@/components/ui/menu';
import { Icon } from '@/components/ui/icon';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { getAuth, updateProfile } from 'firebase/auth';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '@/utils/firebaseConfig';
import { useRouter } from 'expo-router';

export default function Header() {
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUserProfile = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                setProfileImageUrl(currentUser.photoURL || null);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogOut = async () => {
        try {
            router.push('/');
            await auth.signOut();
            console.log('Logged out');
        } catch (error) {
            console.log(error);
        }
    };

    const handleChangeAvatar = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Denied', 'Permission to access the camera roll is required.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]?.uri) {
                const uri = result.assets[0].uri;
                const downloadURL = await uploadImage(uri);
                if (downloadURL) {
                    setProfileImageUrl(downloadURL); // Update local state
                    await updateUserProfileImage(downloadURL); // Save URL to Firebase
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick an image. Please try again.');
        }
    };

    const uploadImage = async (uri: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No user is logged in.');
            return null;
        }

        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const storage = getStorage();
            const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
            await uploadBytes(storageRef, blob);

            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload the image. Please try again.');
            return null;
        }
    };

    const updateUserProfileImage = async (downloadURL: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'No user is logged in.');
            return;
        }

        try {
            await updateProfile(currentUser, { photoURL: downloadURL });

            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                await updateDoc(userRef, { profileImageUrl: downloadURL });
            } else {
                await setDoc(userRef, { profileImageUrl: downloadURL });
            }

            console.log('Profile image updated successfully');
        } catch (error) {
            console.error('Error updating profile image:', error);
            Alert.alert('Error', 'Failed to update the profile image. Please try again.');
        }
    };

    return (
        <Box className="flex-row items-center justify-between bg-[#637162] p-5 pt-16">
            <Box className="flex-row items-center justify-between w-full">
                <Logo height={40} width={40} color={'#8F9C8F'} />

                <Menu
                    className="bg-primaryGreen w-48 outline-none"
                    placement="top"
                    offset={5}
                    disabledKeys={['Settings']}
                    trigger={({ ...triggerProps }) => (
                        <TouchableOpacity {...triggerProps}>
                            <Avatar size="md" className='bg-primaryGreen'>
                                {profileImageUrl ? (
                                    <AvatarImage source={{ uri: profileImageUrl }} />
                                ) : (
                                    <Icon as={Profile} size="lg" className="text-white" />
                                )}
                            </Avatar>
                        </TouchableOpacity>
                    )}
                >
                    <MenuItem
                        key="Change Avatar"
                        textValue="Change Avatar"
                        onPress={handleChangeAvatar}
                    >
                        <Icon as={Profile} size="lg" className="mr-3 text-white" />
                        <MenuItemLabel size="lg" className="text-white">
                            Change Avatar
                        </MenuItemLabel>
                    </MenuItem>
                    <MenuItem key="Log Out" textValue="Log Out" onPress={handleLogOut}>
                        <Icon as={LogOut} size="lg" className="mr-3 text-white" />
                        <MenuItemLabel size="lg" className="text-white">
                            Log Out
                        </MenuItemLabel>
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#8F9C8F',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
