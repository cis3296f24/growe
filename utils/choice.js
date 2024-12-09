import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc, QuerySnapshot, DocumentSnapshot, DocumentReference, arrayUnion } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const createChoices = async (groupRef, plantRefs) => {
    const choicesRef = collection(db, 'choices');
    const choicesDoc = {
        undecided: [groupRef],
        decided: [],
        plants: plantRefs
    };
    const newChoicesDoc = await addDoc(choicesRef, choicesDoc);
    const choicesDocRef = doc(db, 'choices', newChoicesDoc.id);
    return choicesDocRef;
}

export const getUndecidedChoices = async (groupRef) => {
    const choicesQuery = query(collection(db, 'choices'), where('undecided', 'array-contains', groupRef));
    const choicesSnapshot = await getDocs(choicesQuery);
    const choices = choicesSnapshot.docs.map(doc => doc.data());
    if (choices.length === 0) {
        return null;
    }
    // return the first doc ref
    const firstChoicesDocRef = doc(db, 'choices', choicesSnapshot.docs[0].id);
    return firstChoicesDocRef;
}

export const getNewChoices = async (groupRef) => {
    console.log('Getting new choices...');

    if (!groupRef) {
        throw new Error('Invalid groupRef: groupRef is undefined');
    }

    try {
        const choicesQuery = query(collection(db, 'choices'));
        const choicesSnapshot = await getDocs(choicesQuery);
        const choices = choicesSnapshot.docs
            .filter(
                (doc) => {
                    const choice = doc.data();
                    return !choice.undecided.includes(groupRef) && !choice.decided.includes(groupRef);
                }
            )
            .map(doc => doc.ref);
        if (choices.length === 0) {
            console.warn('No new choices found');
            return null;
        }
        console.warn('choices', choices);
        return choices[0];
    } catch (error) {
        console.error('Error getting new choices', error);
    }
};