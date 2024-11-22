
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Timestamp } from 'firebase/firestore';



export const checkPendingVotes = async (user) => {
  if (!user?.uid) {
    console.error('User UID is undefined');
    return { hasPendingVotes: false, pendingVotes: [] };
  }

  try {
    const userRef = doc(db, 'users', user.uid);

    // Fetch the user's groups
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const groups = userData.groups || []; // Array of group references

    const pendingVotes = [];

    // Loop through each group
    for (const groupRef of groups) {
      const logsQuery = query(
        collection(db, 'logs'),
        where('group', '==', groupRef) // Match logs belonging to the group
      );
      const logsSnapshot = await getDocs(logsQuery);

      // Check if the user has voted on all logs
      logsSnapshot.forEach((logDoc) => {
        const logData = logDoc.data();

        // Check if the user has not voted (not in voteApprove, voteDeny, or voteUnsure)
        const hasVoted =
          logData.voteApprove?.includes(userRef.path) ||
          logData.voteDeny?.includes(userRef.path) ||
          logData.voteUnsure?.includes(userRef.path);

        if (!hasVoted) {
          // Add to pending votes if the user hasn't voted
          pendingVotes.push({
            logId: logDoc.id,
            author: logData.author?.path || '',
            voteApprove: logData.voteApprove || [],
            voteDeny: logData.voteDeny || [],
            voteUnsure: logData.voteUnsure || [],
            logImageUrl: logData.logImageUrl || '',
            loggedAt: logData.loggedAt?.toDate ? logData.loggedAt.toDate() : new Date(), // Ensure loggedAt is a Date
            group: logData.group?.path || '',
          });
        }
      });
    }

    // Return results
    return {
      hasPendingVotes: pendingVotes.length > 0,
      pendingVotes,
    };
  } catch (error) {
    console.error('Error checking pending votes: ', error);
    return { hasPendingVotes: false, pendingVotes: [] };
  }
};


// add user to collection
export const addUser = async (user, username, displayName) => {
    // access users collection
    const usersCollection = collection(db, 'users');

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
        settings: { // user settings
            notifications: true, // notifications setting
            emailNotifications: true, // email notifications setting
        },
        credits: 0, // user credits
        pledges: {0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false}, // representing days of the week user has made a pledge to check in
        logs: [], // reference to logs of user check ins
        online: true, // user online status
        lastOnline: Timestamp.now(), // user last online
    });

    // return user
    return user;
}