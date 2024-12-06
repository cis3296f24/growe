import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile} from 'firebase/auth';
//@ts-ignore
import { collection, getDocs, setDoc } from 'firebase/firestore';
import { addUser, updateProfilePicture } from './user';
import { auth, db } from './firebaseConfig';


// Sign Up Function
export const signUp = async (email, password, username, displayName, profileImageUrl = null) => {
  try {
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User signed up:", user);

    // Step 2: Update Firebase Auth profile with displayName
    await updateProfile(user, { displayName });

    // Step 3: Create a Firestore document for the user
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      email,
      username,
      displayName,
      profileImageUrl, // Save the profile picture URL (or null if not provided)
      createdAt: new Date(),
    });

    // Step 4: Additional setup via addUser (if defined)
    if (addUser) {
      await addUser(user, username, displayName);
    }

    return user; // Return the user object
  } catch (error) {
    console.error(`Error signing up with email ${email}:`, error.message);
    throw error; // Throw the error for the caller to handle
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