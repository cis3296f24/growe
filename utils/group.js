import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const checkUserHasGroup = async (user) => {
    const q = query(collection(db, 'users'), where('uid', '==', user?.uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
        return false;
    }
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return data.groups;
};

export const createGroup = async (user, groupName, habit, frequency) => {
    const groupRef = collection(db, 'groups');
    if (!user?.uid) {
        console.error('User UID is undefined');
        return false;
    }
    const userRef = doc(db, 'users', user.uid);

    // Fetch the user's existing groups
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const groups = userData.groups || [];

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const groupDoc = {
        users: [userRef],
        name: groupName,
        admin: userRef,
        habit: habit,
        frequency: frequency,
        garden: null,
        streak: 0,
        joinCode: joinCode,
    };
    const newGroupDoc = await addDoc(groupRef, groupDoc);

    // Update the user's groups with the new group ID
    await updateDoc(userRef, {
        groups: [...groups, newGroupDoc.id]
    });
    return newGroupDoc;
}

export const joinGroup = async (user, joinCode) => {

    // get user groups
    const q = query(collection(db, 'groups'), where('joinCode', '==', joinCode));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
        return false;
    }
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const groupRef = doc.ref;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = {
        groups: [...groups, groupRef]
    };
    await updateDoc(userRef, userDoc);
    const groupDoc = {
        users: [...data.users, user.uid]
    };
    await updateDoc(groupRef, groupDoc);
    return groupRef;
}