import { Timestamp, addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { checkUserHasGroup } from '@/utils/group';

export const createLogEntry = async (user, imageUrl) => {
  try {
    if (!user) {
      throw new Error('User not found');
    }

    const userRef = doc(db, 'users', user.uid);
    const groupRefs = await checkUserHasGroup(user);

    const logRef = await addDoc(collection(db, 'logs'), {
      author: userRef,
      voteUnsure: [],
      voteApprove: [],
      voteDeny: [],
      logImageUrl: imageUrl,
      loggedAt: Timestamp.now(),
      group: groupRefs.at(-1),
    });

    await updateDoc(userRef, {
      logs: arrayUnion(logRef),
    });

    return logRef;
  } catch (error) {
    console.error('Error creating log entry: ', error);
    throw error;
  }
};

export const fetchApprovedLogs = async (groupRef) => {
  try {
    // Fetch the document
    const groupDoc = await getDoc(groupRef);

    // Check if the document exists and retrieve the approvedLogs field
    if (groupDoc.exists()) {
      const approvedLogs = groupDoc.data().approvedLogs;
      console.log("Approved Logs:", approvedLogs);
      return approvedLogs;
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching approved logs:", error);
    return [];
  }
};