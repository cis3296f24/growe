import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc, QuerySnapshot, DocumentSnapshot, DocumentReference } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const createPlant = async (growState = 0, growStateImageUrls, plantName, plantLatinName, decayAt, isOwned) => {
    const plantRef = collection(db, 'plants');
    const plantDoc = {
        growState: growState,
        growStateImageUrls: growStateImageUrls,
        plantName: plantName,
        plantLatinName: plantLatinName,
        decayAt: decayAt,
        isOwned: isOwned,
    };
    const newPlantDoc = await addDoc(plantRef, plantDoc);
    const plantDocRef = doc(db, 'plants', newPlantDoc.id);
    return plantDocRef;
}