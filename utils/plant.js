import { collection, getDocs, query, where, doc, addDoc, updateDoc, getDoc, QuerySnapshot, DocumentSnapshot, DocumentReference } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const createPlant = async (growState = 0, growStateImageUrls, decayAt, isOwned, common, scientific, family, genus, species, habitat, region, uses, description, habit, flowering, edible, toxicity) => {
    const plantRef = collection(db, 'plants');
    const plantDoc = {
        growState: growState,
        growStateImageUrls: growStateImageUrls,
        decayAt: decayAt,
        isOwned: isOwned,
        common: common,
        scientific: scientific,
        family: family,
        genus: genus,
        species: species,
        habitat: habitat,
        region: region,
        uses: uses,
        description: description,
        habit: habit,
        flowering: flowering,
        edible: edible,
        toxicity: toxicity
    };
    const newPlantDoc = await addDoc(plantRef, plantDoc);
    const plantDocRef = doc(db, 'plants', newPlantDoc.id);
    return plantDocRef;
}

export const getDecayDate = (currentDate) => {
  
  if (!(currentDate instanceof Date)) {
      throw new Error('Invalid Input: currentDate must be a Date object');
    }
  const decayDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days in milliseconds

  return decayDate.toUTCString(); 
};

export const checkDecayDate = (decayAt, currentDate) => {
  if (!(decayAt instanceof Date) || ! (currentDate instanceof Date)) {
      throw new Error('Invalid Input: currentDate must be a Date object');
    }

  if (currentDate.getTime() >= decayAt.getTime()) {
    return true;
  } else {
    return false;
  }
};

export const getDecayProgress = (plantingDate) => {
  if (!(plantingDate instanceof Date)) {
    throw new Error('Invalid Input: currentDate must be a Date object');
  }

  // Get the decay date using the existing getDecayDate function
  const decayAt = getDecayDate(plantingDate);

  // Check if the plant has fully decayed using checkDecayDate function
  const now = new Date();
  if (checkDecayDate(decayAt, now)) {
    return 0; // Once fully decayed, set progress to 0 to indicate the plant is decayed
  }

  // Calculate days elapsed since the planting date
  const timeElapsed = now.getTime() - plantingDate.getTime();
  const daysElapsed = Math.floor(timeElapsed / (24 * 60 * 60 * 1000)); // Convert milliseconds to full days

  // Each day accounts for 15% decay
  let decayProgress = daysElapsed * 15;

  // Ensure the decay percentage is capped at 100%
  decayProgress = Math.min(100, Math.max(0, decayProgress));

  return decayProgress.toFixed(2); // Return decay progress with two decimal points
};

export const getCurrentGrowStateImage = async (plantRef) => {
  const plantDoc = await getDoc(plantRef);
  const plantData = plantDoc.data();
  const growState = plantData.growState;
  const growStateImageUrls = plantData.growStateImageUrls;
  return growStateImageUrls[growState];
}

export const updatePlantGrowState = async (plantRef, growState) => {
  const plantDoc = await getDoc(plantRef);
  const plantData = plantDoc.data();
  const growStateImageUrls = plantData.growStateImageUrls;
  if (growState >= growStateImageUrls.length) {
    throw new Error('Invalid Grow State');
  }
  await updateDoc(plantRef, { growState: growState });
  console.log('Plant grow state updated to:', growState);
  return growState;
}