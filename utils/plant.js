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