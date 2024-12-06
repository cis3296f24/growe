import React from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../utils/firebaseConfig"; // Update path if needed

type ProfilePictureUploadProps = {
  userId: string;
  onComplete?: (uri: string | null) => void; // onComplete callback for updating the parent state
};

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ userId, onComplete }) => {
  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "Permission to access the camera roll is required.");
        return;
      }

      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const downloadURL = await uploadImage(result.assets[0].uri);
        onComplete?.(downloadURL); // Notify the parent about the uploaded image URL
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

      // Upload the image to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${userId}`);
      await uploadBytes(storageRef, blob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore user document with the new profile picture URL
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { profileImageUrl: downloadURL });

      Alert.alert("Success", "Profile picture uploaded successfully!");
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload the image. Please try again.");
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
        <AntDesign name="camera" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
});

export default ProfilePictureUpload;
