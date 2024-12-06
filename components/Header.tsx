import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { getAuth, User } from "firebase/auth"; // Import User type
import Logo from "../assets/icons/logo.svg";
import CustomSwitch from "./extra/CustomSwitch";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../utils/firebaseConfig"; // Update path if needed

export default function Header() {
    const [user, setUser] = useState<User | null>(null); // Allow null or User type
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null); // Allow null or string

    useEffect(() => {
        const auth = getAuth(); // Access Firebase Auth
        const currentUser = auth.currentUser; // Get the currently logged-in user

        if (currentUser) {
            setUser(currentUser); // Store the user object
            setProfileImageUrl(currentUser.photoURL || null); // Set the profile image URL
        }
    }, []);

    const handleImageUpdate = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "Permission to access the camera roll is required.");
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
                setProfileImageUrl(downloadURL); // Update the profile image in the state
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to pick an image. Please try again.");
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            const storage = getStorage();
            const storageRef = ref(storage, `profile_pictures/${user?.uid}`);
            await uploadBytes(storageRef, blob);

            const downloadURL = await getDownloadURL(storageRef);

            const userRef = doc(db, "users", user?.uid);
            await updateDoc(userRef, { profileImageUrl: downloadURL });

            return downloadURL;
        } catch (error) {
            console.error("Error uploading image:", error);
            Alert.alert("Error", "Failed to upload the image. Please try again.");
            return null;
        }
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity>
                <Logo height={40} width={40} />
            </TouchableOpacity>
            <View style={styles.headerRightContainer}>
                <CustomSwitch />
                {/* Make the avatar clickable */}
                <TouchableOpacity onPress={handleImageUpdate}>
                    <Image
                        source={profileImageUrl ? { uri: profileImageUrl } : require("../assets/images/Avatar.png")}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "transparent",
    },
    headerRightContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginLeft: 10,
    },
});
