import React, { useState } from "react";
import { View, Button, Text, StyleSheet, Image, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig"; // Update the path if needed
import { updateProfilePicture } from "../utils/user";
import { useUser } from "./UserContext";

type ProfilePictureUploadProps = {
  onComplete: (uploadedUri: string | null) => void; // Pass the uploaded URI to the parent
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onComplete }) => {
  const { user } = useUser(); // Ensure `useUser` provides the current logged-in user
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

 

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "Permission to access the camera roll is required.");
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // Correct lowercase value
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick an image. Please try again.");
    }
  };
  
  
  
  

  const handleUpload = async () => {
    if (!user) {
      Alert.alert("Not Logged In", "You need to be logged in to upload a profile picture.");
      return;
    }

    if (!selectedImage) {
      Alert.alert("No Image Selected", "Please select an image to upload.");
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const userRef = doc(db, "users", user.uid); // Firestore reference to the user's document
      const downloadURL = await updateProfilePicture(userRef, blob);

      Alert.alert("Success", "Profile picture uploaded successfully!");
      console.log("Profile picture URL:", downloadURL);
      onComplete(downloadURL ?? null); // Pass the download URL to the parent component
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Alert.alert("Error", "Failed to upload the profile picture. Please try again.");
      onComplete(null); // Notify the parent component of failure
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={handlePickImage} />
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      )}
      <Button title="Upload" onPress={handleUpload} disabled={uploading} />
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 16,
  },
});
