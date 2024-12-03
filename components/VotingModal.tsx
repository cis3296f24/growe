import React, { useState } from 'react';
import { db } from "../utils/firebaseConfig";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
} from 'react-native';
import ThumbsDown from '../assets/icons/ThumbsDown.png';
import ThumbsUp from '../assets/icons/ThumbsUp.png';
import Unsure from '../assets/icons/Unsure.png';
import { LinearGradient } from 'expo-linear-gradient';
import { updateDoc, arrayUnion, getDoc, DocumentReference, DocumentData, query, where, increment, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useUser } from './UserContext';


interface ModalComponentProps {
    visible: boolean;
    onClose: (response: string) => void; // Callback for button responses
    profilePic: ImageSourcePropType; // URL or local path for the profile picture
    question: string; // Question text to display in the header
    logRef?: DocumentReference<DocumentData, DocumentData> | null;
    totalMembers: number
}


const VotingModal: React.FC<ModalComponentProps> = ({
    visible,
    onClose,
    profilePic,
    question,
    logRef,
    totalMembers
}) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const [image, setImage] = useState(null)
    const { user } = useUser();
    let votesNeeded = divideAndRoundDown(totalMembers)

    function divideAndRoundDown(num: number) {
        if (num % 2 !== 0) {
            // If the number is odd, subtract 1 before dividing
            return Math.floor(num / 2);
        }
        // If the number is even, divide normally
        return num / 2;
    }

    const getImageFromLogRef = async () => {
        if (!logRef) {
            console.error('logRef is null or undefined');
            return null;
        }

        try {
            // Fetch the document
            const docSnapshot = await getDoc(logRef);

            if (docSnapshot.exists()) {
                const logData = docSnapshot.data();
                console.log('Document data:', logData);

                // Access the imageUrl field
                if (logData.logImageUrl) {
                    console.log('Image URL:', logData.logImageUrl);
                    setImage(logData.logImageUrl) // Return the image URL
                } else {
                    console.warn('No imageUrl found in the document');
                    return null;
                }
            } else {
                console.warn('No such document exists');
                return null;
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            return null;
        }
    };
    getImageFromLogRef()

    const handleUpvote = async () => {
        if (!logRef || !currentUser) {
            console.warn('Missing logRef or current user.');
            return;
        }
        // @ts-ignore
        const userRef = doc(db, 'users', user.uid);

        try {
            // Update the Firestore document by adding the user's ID to voteApprove
            await updateDoc(logRef, {
                voteApprove: arrayUnion(userRef),
            });

            console.log(`User ${currentUser.uid} added to voteApprove.`);

            // Fetch the updated document to check the total votes
            const updatedDoc = await getDoc(logRef);

            if (updatedDoc.exists()) {
                const data = updatedDoc.data();

                const voteApprove = Array.isArray(data.voteApprove) ? data.voteApprove : [];
                const groupRef = data.group;
                const authorRef = data.author; // Author reference from the log document

                if (!groupRef) {
                    console.warn('No group reference found in the log document.');
                    return;
                }

                if (!authorRef) {
                    console.warn('No author reference found in the log document.');
                    return;
                }

                // Calculate the required majority
                const requiredMajority = Math.floor(totalMembers / 2);
                console.log(`Required majority: ${requiredMajority}`);
                console.log(`Current voteApprove count: ${voteApprove.length}`);

                // Check if the total votes meet or exceed the majority
                if (voteApprove.length >= requiredMajority) {
                    console.log('Majority has been reached for voteApprove!');

                    try {
                        // Fetch the group document
                        const groupSnapshot = await getDoc(groupRef);
                        if (groupSnapshot.exists()) {
                            const groupData = groupSnapshot.data();
                            // @ts-ignore
                            const currentApprovedLogs = groupData.approvedLogs || [];

                            // Allow duplicates by appending the new reference
                            const updatedApprovedLogs = [...currentApprovedLogs, logRef];

                            // Update the group document
                            await updateDoc(groupRef, {
                                approvedLogs: updatedApprovedLogs, // Overwrite the array with duplicates allowed
                            });

                            console.log('Streak incremented and author added to approvedLogs in the group (duplicates allowed).');
                        } else {
                            console.error('Group document does not exist.');
                        }
                    } catch (error) {
                        //@ts-ignore
                        console.error('Error updating streak or approvedLogs in group:', error.message, error.code);
                    }
                } else {
                    console.log('Majority has not been reached yet.');
                }
            } else {
                console.warn('Log document does not exist.');
            }

            onClose('yes'); // Notify parent of successful upvote
        } catch (error) {
            //@ts-ignore
            console.error('Error adding upvote or checking majority:', error.message, error.code);
        }
    };


    const handleDownvote = async () => {
        if (!logRef || !currentUser) {
            console.warn('Missing logRef or current user.');
            return;
        }

        // @ts-ignore
        const userRef = doc(db, 'users', user.uid);
        try {
            // Update the Firestore document by adding the user's ID to voteDeny
            await updateDoc(logRef, {
                voteDeny: arrayUnion(userRef),
            });
            console.log(`User ${currentUser.uid} added to voteDeny.`);
            onClose('no'); // Notify parent of successful downvote
        } catch (error) {
            console.error('Error adding downvote:', error);
        }
    };


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={() => onClose('not sure')}
        >
            <LinearGradient colors={['#8E9F8D', '#596558']} style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Profile Picture */}
                    <Image source={profilePic} style={styles.profilePic} />

                    {/* Question */}
                    <Text style={styles.question}>{question}</Text>

                    {/* Main Image */}
                    <Image source={image ? { uri: image } : undefined} style={styles.mainImage} />




                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleDownvote}>
                            <Image style={styles.buttons} source={ThumbsDown} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onClose('not sure')}>
                            <Image style={styles.buttons} source={Unsure} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleUpvote}>
                            {/* <TouchableOpacity onPress={() => console.log(votesNeeded)}> */}
                            <Image style={styles.buttons} source={ThumbsUp} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '90%',
        height: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 10,
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttons: {
        width: 40,
        height: 40,
    },
    mainImage: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 20,
        objectFit: "contain"
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});

export default VotingModal;
