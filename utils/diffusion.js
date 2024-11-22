import axios from 'axios';
import FormData from "form-data";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebaseConfig';

export async function generateImage(prompt) {
  const payload = {
    prompt: prompt,
    output_format: 'png',
  };

  const apiKey = process.env.EXPO_PUBLIC_STABILITY_AI_API_KEY;

  try {
    const response = await axios.postForm(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json', // image as base64 encoded JSON.
        },
        responseType: "json",
      }
    );

    if (response.status === 200) {
      const base64Image = response.data.image; // Adjust the key based on your API response
      console.log('Image generated:', base64Image);
      // log the type
      console.log('Type:', typeof base64Image);
      return base64Image;
    } else {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export async function uploadImageToFirebase(base64Image, filePath) {
  const storageRef = ref(storage, filePath);

  try {
    // Convert base64 string to a Blob
    const response = await fetch(`data:image/png;base64,${base64Image}`);
    const blob = await response.blob();

    // Upload the Blob to Firebase Storage
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Image uploaded to Firebase:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    throw error;
  }
}