import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc, QuerySnapshot, DocumentSnapshot, DocumentReference, documentId } from 'firebase/firestore';
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

export const progresscheck = async (documentId) => {
    try{
    const DocumentReference = doc(db, 'groups', documentId)
    const docSnapshot = await getDoc(DocumentReference)
    if (docSnapshot.exists()){
        const frequency = docSnapshot.data().frequency;
        return frequency;
    }
    else{
        return null;
    }
} catch (error){
        throw error;
    }
}