import { collection, doc, setDoc, getDocs, getDoc, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Timestamp } from "firebase/firestore";

// add user to collection
export const addUser = async (user, username, displayName) => {
  // access users collection
  const usersCollection = collection(db, "users");

  // add user to collection with user.id as document id
  await setDoc(doc(usersCollection, user.uid), {
    email: user.email, // set email
    username: username, // set username
    displayName: displayName, // set display name
    createdAt: Timestamp.now(), // set current date
    profileImageUrl: null, // set default profile image
    groups: [], // reference to groups user is in
    friends: [], // reference to friends user has
    friendRequests: [], // friend requests user has
    notifications: [], // notifications user has
    groupInvites: [], // group invites user has
    settings: {
      // user settings
      notifications: true, // notifications setting
      emailNotifications: true, // email notifications setting
    },
    credits: 0, // user credits
    pledges: {
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
    }, // representing days of the week user has made a pledge to check in
    logs: [], // reference to logs of user check ins
    online: true, // user online status
    lastOnline: Timestamp.now(), // user last online
  });

  // return user
  return user;
};

export const checkPendingVotes = async (user) => {
  if (!user?.uid) {
    console.error("User UID is undefined");
    return { hasPendingVotes: false, pendingVotes: [] };
  }

  try {
    const userRef = doc(db, "users", user.uid);
    // Fetch the user's gropus
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const gropus = userData.groups || [];

    const pendingVotes = [];

    // Loop through each group
    for (const groupRef of gropus) {
      const useractivitiesQuery = query(
        collection(db, "users"),
        where("groups", "==", groupRef)
      );
      const activitiesSnapshot = await getDocs(useractivitiesQuery);

      // check if the user has voted on all activities
      activitiesSnapshot.forEach((activitiesDoc) => {
        const activityData = activitiesDoc.data();
        if (!activityData.voters.includes(userRef)) {
          // add to pending votes if the user hasn't voted
          pendingVotes.push({
            activityId: activitiesDoc.id,
            ...activityData,
          });
        }
      });
    }
    // return results
    return {
      hasPendingVotes: pendingVotes.length > 0,
      pendingVotes,
    };
  } catch (error) {
    console.error("Error checking pending votes: ", error);
    return { hasPendingVotes: false, pendingVotes: [] };
  }
};
