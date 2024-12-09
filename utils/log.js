import { Timestamp, addDoc, collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { checkUserHasGroup } from "@/utils/group";

export const createLogEntry = async (user, imageUrl) => {
  try {
    if (!user) {
      throw new Error("User not found");
    }

    const userRef = doc(db, "users", user.uid);
    const groupRefs = await checkUserHasGroup(user);

    const logRef = await addDoc(collection(db, "logs"), {
      author: userRef,
      voteUnsure: [],
      voteApprove: [],
      voteDeny: [],
      logImageUrl: imageUrl,
      loggedAt: Timestamp.now(),
      group: groupRefs.at(-1),
    });

    await updateDoc(userRef, {
      logs: arrayUnion(logRef),
    });

    return logRef;
  } catch (error) {
    console.error("Error creating log entry: ", error);
    throw error;
  }
};

export const fetchApprovedLogs = async (groupRef) => {
  try {
    if (!groupRef) {
      throw new Error("Group reference is null or undefined.");
    }

    // Fetch the document from Firestore
    const groupDoc = await getDoc(groupRef);

    // Check if the document exists
    if (!groupDoc.exists()) {
      console.error("Group document does not exist.");
      return [];
    }

    // Retrieve the `approvedLogs` field
    const groupData = groupDoc.data();
    const approvedLogs = groupData?.approvedLogs;

    // Validate that `approvedLogs` is an array
    if (!Array.isArray(approvedLogs)) {
      //console.error("Approved logs field is not an array, assuming it is new empty array:", approvedLogs);
      return [];
    }

    // Fetch details of each log reference
    const logDetails = await Promise.all(
      approvedLogs.map(async (logRef) => {
        if (logRef instanceof Object && typeof logRef.path === "string") {
          const logDoc = await getDoc(logRef);
          if (logDoc.exists()) {
            return logDoc.data();
          } else {
            console.warn("Log document does not exist:", logRef.path);
          }
     } else {
          console.error("Invalid log reference:", logRef);
        }
        return null; // Ensure invalid references don't break the array
      })
    );

    // Filter out null entries and log the results
    const filteredLogs = logDetails.filter((log) => log !== null);
    // console.log("Approved Logs Details:", filteredLogs); // Log all approved logs

    return filteredLogs;
  } catch (error) {
    console.error("Error fetching approved logs:", error);
    return [];
  }
};

export const fetchUserLogs = async (userRef) => {
  try {
    // Ensure userRef is valid
    if (!userRef) {
      throw new Error("User reference is null or undefined.");
    }

    // Create a query to fetch logs where the author is userRef
    const logsCollection = collection(db, "logs");
    const logsQuery = query(logsCollection, where("author", "==", userRef));

    // Execute the query
    const userLogsSnapshot = await getDocs(logsQuery);

    // Log the snapshot size
    //console.log("User logs snapshot size:", userLogsSnapshot.size);

    // Convert the snapshot to an array of log data
    const userLogs = userLogsSnapshot.docs.map(doc => doc.data());

    // Log the user logs
    //console.log("User logs:", userLogs.length);

    return userLogs;
  } catch (error) {
    console.error("Error fetching user logs:", error);
    return [];
  }
};

export const clearAllLogs = async (userRef, groupRef) => {
  try {
    // Ensure userRef is valid
    if (!userRef) {
      throw new Error("User reference is null or undefined.");
    }

    // clear the group document's approvedLogs field
    await updateDoc(groupRef, {
      approvedLogs: [],
    });

    // clear the user document's approvedLogs field
    await updateDoc(userRef, {
      approvedLogs: [],
    });

    // Create a query to fetch logs where the author is userRef
    const logsCollection = collection(db, "logs");
    const logsQuery = query(logsCollection, where("author", "==", userRef));

    // Execute the query
    const userLogsSnapshot = await getDocs(logsQuery);

    // Log the snapshot size
    //console.log("User logs snapshot size:", userLogsSnapshot.size);

    // Convert the snapshot to an array of log references
    const userLogs = userLogsSnapshot.docs.map(doc => doc.ref);

    // Log the user logs
    //console.log("User logs:", userLogs.length);

    // Delete each log reference
    await Promise.all(userLogs.map(async (logRef) => {
      await deleteDoc(logRef);
    }));

    return true;
  }
  catch (error) {
    console.error("Error clearing user logs:", error);
    return false;
  }
};

export const fetchGroupLogs = async (groupRef) => {
  try {
    // Ensure groupRef is valid
    if (!groupRef) {
      throw new Error("Group reference is null or undefined.");
    }

    // Create a query to fetch logs where the group is groupRef
    const logsCollection = collection(db, "logs");
    const logsQuery = query(logsCollection, where("group", "==", groupRef));

    // Execute the query
    const groupLogsSnapshot = await getDocs(logsQuery);

    // Log the snapshot size
    //console.log("Group logs snapshot size:", groupLogsSnapshot.size);

    // Convert the snapshot to document references
    const groupLogs = groupLogsSnapshot.docs.map(doc => doc.ref);

    // Log the group logs
    //console.log("Group logs:", groupLogs.length);

    return groupLogs;
  } catch (error) {
    console.error("Error fetching group logs:", error);
    return [];
  }
}