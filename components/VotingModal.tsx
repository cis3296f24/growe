import React, { useEffect, useState } from 'react';
import { db } from "../utils/firebaseConfig";
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useFonts } from 'expo-font';
import ThumbsDown from '@/assets/icons/thumbsDown.svg';
import ThumbsUp from '@/assets/icons/thumbsUp.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { updateDoc, arrayUnion, getDoc, DocumentReference, DocumentData, query, where, increment, doc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useUser } from './UserContext';
import { Heading } from '@/components/ui/heading';

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
    const [fontsLoaded] = useFonts({
        "SF-Pro-Rounded-Regular": require("../assets/fonts/SF-Pro-Rounded-Regular.ttf"),
        "SF-Pro-Rounded-Bold": require("../assets/fonts/SF-Pro-Rounded-Bold.ttf"),
        "cmunci": require("../assets/fonts/cmunci.ttf"),
      });

    useEffect(() => {
        if (logRef) {
            getImageFromLogRef();
        }
    }, [logRef]); // Dependency array to only run when logRef changes

    const getImageFromLogRef = async () => {
        if (!logRef) {
            return null;
        }

        try {
            // Fetch the document
            const docSnapshot = await getDoc(logRef);

            if (docSnapshot.exists()) {
                const logData = docSnapshot.data();
                // console.log('Document data:', logData);

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

                            // Increment the streak of the author
                            await updateDoc(authorRef, {
                                // add to array with no duplicates
                                approvedLogs: arrayUnion(logRef),
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
            // Update the Firestore document by adding the userref to voteDeny
            await updateDoc(logRef, {
                voteDeny: arrayUnion(userRef),
            });
            console.log(`User ${currentUser.uid} added to voteDeny.`);

            // Fetch the updated document to check the total votes
            const updatedDoc = await getDoc(logRef);

            if (updatedDoc.exists()) {
                const data = updatedDoc.data();

                const voteDeny = Array.isArray(data.voteDeny) ? data.voteDeny : [];
                const authorRef = data.author; // Author reference from the log document

                if (!authorRef) {
                    console.warn('No author reference found in the log document.');
                    return;
                }

                // Calculate the required majority
                const requiredMajority = Math.floor(totalMembers / 2);
                console.log(`Required majority: ${requiredMajority}`);
                console.log(`Current voteDeny count: ${voteDeny.length}`);

                // Check if the total votes meet or exceed the majority
                if (voteDeny.length >= requiredMajority) {
                    console.log('Majority has been reached for voteDeny!');

                    try {
                        // Remove the logRef from the author's logs field
                        await updateDoc(authorRef, {
                            logs: arrayRemove(logRef),
                        });

                        // Remove the actual log document from the logs collection
                        await deleteDoc(logRef);

                        console.log('Log removed from author\'s logs and deleted from logs collection.');
                    } catch (error) {
                        //@ts-ignore
                        console.error('Error removing log from author\'s logs or deleting log document:', error.message, error.code);
                    }
                } else {
                    console.log('Majority has not been reached yet.');
                }
            } else {
                console.warn('Log document does not exist.');
            }

            onClose('no'); // Notify parent of successful downvote
        } catch (error) {
            console.error('Error adding downvote or checking majority:', error);
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
                {/* add width 90% and height 80% to the tailwind*/}
                <Box className='flex flex-col justify-between items-center w-auto h-auto p-20 gap-10'>
                    {/* Profile Picture */}
                    
                    <Image source={profilePic} className='rounded-full w-16 h-16'/>

                    {/* Question */}
                    <Heading size='xl' className='font-bold text-center text-white'>{question}</Heading>

                    {/* Main Image */}
                    <Box className='bg-primaryGreen p-2 rounded-3xl'>
                    <Image source={image ? { uri: image } : undefined} className='object-contain rounded-3xl' width={300} height={400}/>
                    </Box>
                    {/* Buttons */}
                    <View className='flex-row justify-between w-full'>
                        <TouchableOpacity onPress={handleDownvote}>
                            <ThumbsDown width={50} height={50} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleUpvote}>
                            {/* <TouchableOpacity onPress={() => console.log(votesNeeded)}> */}
                            <ThumbsUp width={50} height={50} />
                        </TouchableOpacity>
                    </View>
                </Box>
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
});

export default VotingModal;
