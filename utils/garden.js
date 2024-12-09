import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc, QuerySnapshot, DocumentSnapshot, DocumentReference } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const createGarden = async (groupRef) => {
    // add document to gardens collection with `group` field and `plants` field
    const gardenRef = await addDoc(collection(db, 'gardens'), {
        group: groupRef,
        plants: [],
        grid: [],
    });
    return gardenRef;
}

export const getGarden = async (user) => {

    const userRef = doc(db, 'users', user.uid);

    // Fetch the user's existing groups
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const groups = userData.groups || [];

    if (groups.length === 0) {
        throw new Error('No groups found for the user.');
    }

    // Fetch the garden associated with the user's last group in the gardens collection
    const groupRef = doc(db, 'groups', groups[groups.length - 1]);
    // Query the gardens collection for the garden with the groupRef as `group` field
    const q = query(collection(db, 'gardens'), where('group', '==', groupRef));
    const querySnapshot = await getDocs(q);
    let gardenRef;
    querySnapshot.forEach((doc) => {
        gardenRef = doc.ref;
    });

    if (!gardenRef) {
        throw new Error('No garden found for the user\'s group.');
    }

    return gardenRef;
}