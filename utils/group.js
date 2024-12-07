import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc, QuerySnapshot, DocumentSnapshot, DocumentReference } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const checkUserHasGroup = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    const data = userSnapshot.data();
    const groups = data.groups || [];
    return groups.length > 0 ? groups : false;
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
        plant: null,
    };
    const newGroupDoc = await addDoc(groupRef, groupDoc);

    const newGroups = [...groups, newGroupDoc];
    await updateDoc(userRef, { groups: newGroups });
    return newGroupDoc;
}

export const joinGroup = async (user, joinCode) => {

    // get user groups
    const q = query(collection(db, 'groups'), where('joinCode', '==', joinCode));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
        return false;
    }

    let docSnapshot = querySnapshot.docs;
    if (docSnapshot.length === 0) {
        return false;
    } else {
        docSnapshot = docSnapshot[0];
    }
    const groupRef = docSnapshot.ref;
    const docSnapshotData = docSnapshot.data();
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const userDoc = {
        groups: [...userData.groups, groupRef]
    };
    await updateDoc(userRef, userDoc);
    const groupDoc = {
        users: [...docSnapshotData.users, userRef]
    };
    await updateDoc(groupRef, groupDoc);
    return groupRef;
}

// get plant attribute with plant doc ref from group doc associated with user
export const getPlant = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const groups = userData.groups || [];
    if (groups.length === 0) {
        return false;
    }
    const groupRef = groups.at(-1);
    const groupSnapshot = await getDoc(groupRef);
    const groupData = groupSnapshot.data();
    return groupData.plant;
}

export const setPlant = async (groupRef, plantRef) => {
    const groupSnapshot = await getDoc(groupRef);
    const groupData = groupSnapshot.data();
    const groupDoc = {
        plant: plantRef
    };
    await updateDoc(groupRef, groupDoc);
    return groupRef;
}