import { Timestamp, addDoc, collection, doc } from 'firebase/firestore';
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
      logs: arrayUnion(logRef.id),
    });

    return logRef.id;
  } catch (error) {
    console.error('Error creating log entry: ', error);
    throw error;
  }
};
