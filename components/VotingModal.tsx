import React from 'react';
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
import { updateDoc, arrayUnion, DocumentReference, DocumentData } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface ModalComponentProps {
    visible: boolean;
    onClose: (response: string) => void; // Callback for button responses
    profilePic: ImageSourcePropType; // URL or local path for the profile picture
    mainImage: ImageSourcePropType; // URL or local path for the main image
    question: string; // Question text to display in the header
    logRef: DocumentReference<DocumentData>; // Firestore document reference for the log
}

const VotingModal: React.FC<ModalComponentProps> = ({
    visible,
    onClose,
    profilePic,
    mainImage,
    question,
    logRef,
}) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const handleUpvote = async () => {
        if (!logRef || !currentUser) {
            console.warn('Missing logRef or current user.');
            return;
        }

        try {
            // Update the Firestore document by adding the user's ID to voteApprove
            await updateDoc(logRef, {
                voteApprove: arrayUnion(currentUser.uid),
            });
            console.log(`User ${currentUser.uid} added to voteApprove.`);
            onClose('yes'); // Notify parent of successful upvote
        } catch (error) {
            console.error('Error adding upvote:', error);
        }
    };

    const handleDownvote = async () => {
        if (!logRef || !currentUser) {
            console.warn('Missing logRef or current user.');
            return;
        }

        try {
            // Update the Firestore document by adding the user's ID to voteDeny
            await updateDoc(logRef, {
                voteDeny: arrayUnion(currentUser.uid),
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
                    <Image source={mainImage} style={styles.mainImage} />

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleDownvote}>
                            <Image style={styles.buttons} source={ThumbsDown} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onClose('not sure')}>
                            <Image style={styles.buttons} source={Unsure} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleUpvote}>
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
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});

export default VotingModal;
