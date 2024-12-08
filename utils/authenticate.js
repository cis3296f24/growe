import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile} from 'firebase/auth';
//@ts-ignore
import { collection, getDocs, setDoc, waitForPendingWrites } from 'firebase/firestore';
import { addUser, updateProfilePicture } from './user';
import { auth, db } from './firebaseConfig';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { doc } from "firebase/firestore";


// Sign Up Function

export const signUp = async (email, password, username, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User signed up:", user);

    // Step 2: Update Firebase Auth profile with displayName
    await updateProfile(user, { displayName });

    console.log("User profile updated:", { displayName});
    await addUser (user, username, displayName);
    return user;
  } catch (error) {
    console.error(`Error signing up with email ${email}:`, error.message);
    throw error; // Throw the error for the caller to handle
  }
};

export const uploadProfilePicture = async (user, profileImageUrl) => {
  try {
    if (!profileImageUrl) {
      throw new Error('No profile image provided');
    }

    const storage = getStorage();
    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    const response = await fetch(profileImageUrl);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);

    // Update user's Firestore document with the profile picture URL
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { profileImageUrl: downloadURL });

    // Optionally update Firebase Auth profile
    await updateProfile(user, { photoURL: downloadURL });

    console.log("Profile picture uploaded and updated successfully:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Login Function
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error.message);
    return null;
  }
};


// Logout Function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Error logging out:', error.message);
  }
};
// Password Reset Function
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    return false;
  }
};

export const checkUsernameExists = async (username) => {
  // Check if username exists in database

  // Access the users collection
  const usersCollection = collection(db, 'users');

  // Get all users
  const usersSnapshot = await getDocs(usersCollection);

  // Check if username exists
  const usernameExists = usersSnapshot.docs.some((doc) => doc.data().username === username);
  return usernameExists;
};

export const checkEmailExists = async (email) => {
  // Check if email exists in database

  // Access the users collection
  const usersCollection = collection(db, 'users');

  // Get all users
  const usersSnapshot = await getDocs(usersCollection);

  // Check if email exists
  const emailExists = usersSnapshot.docs.some((doc) => doc.data().email === email);
  return emailExists;
}