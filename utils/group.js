import { collection, getDocs, query, where, doc, addDoc, updateDoc } from 'firebase/firestore';
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
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const groupDoc = {
        users: [user?.uid],
        // get name from user input or user display to make a group
        name: groupName,
        // set user reference as admin
        admin: userRef,
        habit: habit,
        frequency: frequency,
        garden: null,
        streak: 0,
        // generate random phrase for join code
        joinCode: joinCode,
    };
    const newUserGroup = await addDoc(groupRef, groupDoc);
    const userDoc = {
        groups: [...groups, newUserGroup]
    };
    await updateDoc(userRef, userDoc);
    return newUserGroup;
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