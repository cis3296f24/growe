import axios from 'axios';
import FormData from "form-data";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from './firebaseConfig';
import { Buffer } from 'buffer';

export async function removeBg(imageUrl) {
  try {
    const formData = new FormData();
    formData.append("image_url", imageUrl);
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY,
        "Accept": "application/json", // Request JSON response
      },
      body: formData,
    });

    if (response.ok) {
      console.log("Background removed successfully");

      // Parse the JSON response
      const jsonResponse = await response.json();
      const base64Image = jsonResponse.data.result_b64;

      return base64Image;
    } else {
      const errorText = await response.text();
      console.error(`${response.status}: ${errorText}`);
      throw new Error(`${response.status}: ${errorText}`);
    }
  } catch (errors) {
    console.error("Failed to remove background", errors);
    throw errors;
  }
}

export async function generateAndUploadImage(prompt, filePath) {
  try {
    return "https://firebasestorage.googleapis.com/v0/b/growe-5d9d1.firebasestorage.app/o/plants%2F5a7926e5-f4ef-4ba5-9f7a-78b19ea4a354-Succulent-1732605363449.png?alt=media&token=0a988c6b-70ad-4754-9487-90b2938813ca";
    // Step 1: Generate the image
    const base64Image = await generateImage(prompt);

    // Step 2: Upload the generated image to Firebase Storage
    const downloadURL = await uploadImageToFirebase(base64Image, filePath);
    console.log('Generated image uploaded to Firebase:', downloadURL);

    // Step 3: Remove the background using the image URL
    const bgRemovedBase64Image = await removeBg(downloadURL);
    console.log('Background removed from image');

    // Step 4: Re-upload the new image to Firebase Storage, replacing the previous one
    const newDownloadURL = await uploadImageToFirebase(bgRemovedBase64Image, filePath);
    console.log('Background removed image uploaded to Firebase:', newDownloadURL);

    // Return the new download URL
    return newDownloadURL;
  } catch (error) {
    console.error('Error in generating and uploading image:', error);
    throw error;
  }
}

export async function generateImage(prompt) {
  const payload = {
    prompt: prompt,
    output_format: 'png',
    seed: 227468720,
    cfg_scale: 3.5,
  };

  const apiKey = process.env.EXPO_PUBLIC_STABILITY_AI_API_KEY;

  try {
    console.log('Generating image...');
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
      console.log('Image generated successfully');
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