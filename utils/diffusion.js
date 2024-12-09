import axios from 'axios';
import FormData from "form-data";
import { ref, uploadString, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, auth } from './firebaseConfig';
import { decode, encode } from 'base-64';

const user = auth.currentUser;

/**
 * Function to remove the background from an image using the remove.bg API.
 * @param {string} imageUrl - URL of the image to remove the background from.
 * @returns {string} - Base64 encoded image string with the background removed.
 * @throws {Error} - If the background removal fails.
 * @see https://www.remove.bg/api
 * @returns {string} - Base64 encoded image string with the background removed.
 */
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

/**
 * 
 * @param {string} prompt
 * @param {string} filePath
 * @returns {string} - Download URL of the uploaded image.
 */
export async function generateTransparentAndUploadImage(prompt, filePath) {
  try {

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

/**
 * 
 * @param {string} prompt
 * @param {string} filePath
 * @returns {string} - Download URL of the uploaded image.
 */
export async function generateAndUploadImage(prompt, filePath) {
  try {

    // Step 1: Generate the image
    const base64Image = await generateImage(prompt);

    // Step 2: Upload the generated image to Firebase Storage
    const downloadURL = await uploadImageToFirebase(base64Image, filePath);
    console.log('Generated image uploaded to Firebase:', downloadURL);

    // Return the new download URL
    return downloadURL;
  } catch (error) {
    console.error('Error in generating and uploading image:', error);
    throw error;
  }
}

/**
 * 
 * @param {string} prompt 
 * @returns {string} - Base64 encoded image string.
 */
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

/**
 * 
 * @param {string} base64Image
 * @param {string} filePath 
 * @returns {string} - Download URL of the uploaded image.
 */
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

/**
 * Function to vectorize an image using Vectorizer.AI API.
 * @param {string} imageUrl - URL of the image to be vectorized.
 * @returns {string} - Download URL of the vectorized SVG.
 */
export async function vectorize(imageUrl) {
  const apiId = process.env.EXPO_PUBLIC_VECTORIZER_API_ID;
  const apiSecret = process.env.EXPO_PUBLIC_VECTORIZER_API_KEY;

  try {
    const formData = new FormData();
    formData.append("image.url", imageUrl);
    formData.append("output.file_format", "svg");
    // Remove white and near-white colors
    formData.append("processing.palette", "#FFFFFF -> #00000000 ~ 0.02;");

    // Enable gap filler to handle missing shapes due to transparency
    formData.append("output.gap_filler.enabled", "true");
    formData.append("output.gap_filler.stroke_width", "0.1");

    const response = await axios.post('https://api.vectorizer.ai/api/v1/vectorize', formData, {
      auth: {
        username: apiId,
        password: apiSecret,
      },
      responseType: 'json',
    });

    if (response.status === 200) {
      console.log('Vectorization successful');
      return response.data;
    } else {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error during vectorization:', error.message);
    throw error;
  }
}

/**
 * Function to generate an image, vectorize it, remove the background, delete the bitmap, and upload the SVG.
 * @param {string} prompt - Prompt for image generation.
 * @param {string} imageFilePath - Path for storing the image in Firebase.
 * @param {string} svgFilePath - Path for storing the SVG in Firebase.
 * @returns {string} - Download URL of the SVG file.
 */
export async function generateVectorAndUploadImage(prompt, imageFilePath, svgFilePath) {
  try {
    // Step 0: If SVG already exists, return its download URL
    const svgRef = ref(storage, svgFilePath);
    try {
      const svgExists = await getDownloadURL(svgRef);
      console.log('SVG already exists:', svgExists);
      return svgExists;
    } catch (error) {
      if (error.code !== 'storage/object-not-found') {
        throw error;
      }
      // If the SVG does not exist, continue with the process
    }

    // Step 1: Generate and upload the image, getting its download URL
    const imageDownloadUrl = await generateAndUploadImage(prompt, imageFilePath);

    // Step 2: Vectorize the image URL
    const vectorizedSvg = await vectorize(imageDownloadUrl);

    // Step 3: Delete the original image from Firebase
    const imageRef = ref(storage, imageFilePath);
    await deleteObject(imageRef);
    console.log(`Deleted original image: ${imageFilePath}`);

    const svgDownloadUrl = await uploadSvgToFirebase(vectorizedSvg, svgFilePath);
    console.log('SVG uploaded to Firebase:', svgDownloadUrl);

    return svgDownloadUrl;
  } catch (error) {
    console.error('Error in generateVectorAndUploadImage:', error.message);
    throw error;
  }
}

/**
 * 
 * @param {string} svgString - The raw SVG markup as a string.
 * @param {string} filePath - The path in Firebase Storage where the SVG should be uploaded.
 * @returns {string} - Download URL of the uploaded SVG.
 */
export async function uploadSvgToFirebase(svgString, filePath) {
  const storageRef = ref(storage, filePath);

  try {
    // Convert the SVG string to base64
    const base64Svg = encode(svgString);

    // Create a data URL for the SVG
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

    // Convert the data URL to a Blob via fetch
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Upload the Blob to Firebase Storage
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    console.log('SVG uploaded to Firebase:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading SVG to Firebase:', error);
    throw error;
  }
}