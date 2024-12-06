import { Timestamp, addDoc, collection, doc, getDoc } from "firebase/firestore";
import { updateDoc, arrayUnion } from "firebase/firestore";
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
      console.error("Approved logs field is not an array, assuming it is new empty array:", approvedLogs);
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
