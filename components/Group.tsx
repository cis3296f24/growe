import React, { useState, useEffect, memo } from 'react';
import { Image, View, TextInput, Button, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollViewBase } from 'react-native';
import { useUser } from './UserContext';
import { fetchApprovedLogs } from '../utils/log'
import { DocumentReference, DocumentSnapshot, getDoc } from 'firebase/firestore';
import { checkUserHasGroup, joinGroup, createGroup } from '../utils/group';
import { checkPendingVotes } from '../utils/user';
import { LinearGradient } from 'expo-linear-gradient';
import VerificationBar from './extra/VerificationBar';
import FrequencyBar from './extra/FrequencyBar';
import DaysOfTheWeek from './extra/DaysOfTheWeek';
import Plant from '../assets/images/Plant.png';
import UserProgress from './extra/UserProgress';
import { getPlant } from '@/utils/group';
import { G } from 'react-native-svg';
import { Box } from '@/components/ui/box';
import { generateAndUploadImage } from '@/utils/diffusion';
import uuid from 'react-native-uuid';
import { Spinner } from '@/components/ui/spinner';
import colors, { current } from 'tailwindcss/colors';
import { createPlant, getDecayDate } from '@/utils/plant';
import VotingModal from './VotingModal'
import ProfilePic from '../assets/images/Avatar.png'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';


const { width, height } = Dimensions.get('window');

export function Group() {

    const [step, setStep] = useState<'initial' | 'name-group' | 'create-habit' | 'set-frequency' | 'display-code' | 'enter-code'>('initial');
    const [groups, setGroups] = useState<DocumentReference[]>([]);
    const [groupRef, setGroupRef] = useState<DocumentReference[]>([]);
    const [hasGroups, setHasGroups] = useState(false);
    const { user } = useUser();
    const [groupName, setGroupName] = useState(`${user?.displayName}'s group`);
    const [codeInput, setCodeInput] = useState('');
    const [habit, setHabit] = useState('Go for a walk');
    const [frequency, setFrequency] = useState(3);
    const [error, setError] = useState(' ');
    const [groupMembers, setGroupMembers] = useState<DocumentReference[]>([]);
    const [groupCode, setGroupCode] = useState('');
    const [groupMemberNames, setGroupMemberNames] = useState<string[]>([]);
    const [plant, setPlant] = useState<DocumentReference | null>(null);
    const [plantImageChoices, setPlantImageChoices] = useState<string[] | null>(null);
    const [plantNameChoices, setPlantNameChoices] = useState<string[]>([]);
    const [plantLatinNames, setPlantLatinNames] = useState<string[]>([]);
    const [approvedLogs, setApprovedLogs] = useState<DocumentReference[]>([])
    const [modalVisible, setModalVisible] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [hasShownModal, setHasShownModal] = useState(false);
    const [currentLogRef, setCurrentLogRef] = useState<DocumentReference | null>(null);
    const [streak, setStreak] = useState(0);
    const [userProgress, setUserProgress] = useState<{ userId: string, approvedLogs: number }[]>([]);
    const [userProgressComponents, setUserProgressComponents] = useState<JSX.Element[]>([]);
    const [daysOfTheWeek, setDaysOfTheWeek] = useState(null)




    const fetchGroups = async () => {
        const groupRefs = await checkUserHasGroup(user);

        if (Array.isArray(groupRefs) && groupRefs.length > 0) {
            setGroups(groupRefs);
            setHasGroups(true);

            const groupData = await getDoc(groupRefs[0]);

            if (groupData.exists()) {
                const users = groupData.get("users") || [];
                const approvedLogs = groupData.get("approvedLogs") || [];
                setGroupMembers(Array.isArray(users) ? users : []);
                setApprovedLogs(Array.isArray(approvedLogs) ? approvedLogs : []);
                setFrequency(groupData.get("frequency") || 1);
                setGroupName(groupData.get("name") || "Unnamed Group");
            }
        } else {
            setHasGroups(false);
            setGroupMembers([]);
            setApprovedLogs([]);
        }
    };



    useEffect(() => {
        fetchGroups();
        // console.log('fetching groups');
        checkPlant();
        // console.log('fetching plant');
    }, [user]);

    useEffect(() => {
        // Only call grabVotes if groupMembers is populated
        if (groupMembers.length > 0) {
            // console.log('groupMembers updated:', groupMembers);
            grabVotes();
        } else {
            // console.log('groupMembers is empty. Skipping grabVotes.');
        }
    }, [groupMembers]); // 


    useEffect(() => {
        if (plantNameChoices.length > 0) {
            handleGeneratePlantChoices();
            // console.log('generating plant choices');
        }
    }, [plantNameChoices]);

    // USE THIS AND TRY TO GET THE DATA ---------------------------------------------------------------------------------------------------------------------------------------
    const fetchGroupData = async () => {
        try {
            if (groupRef.length === 0 || !groupRef[0]) {
                console.error("Group reference is not available.");
                return;
            }

            const groupDocSnapshot = await getDoc(groupRef[0]);
            if (!groupDocSnapshot.exists()) {
                console.error("Group document does not exist.");
                return;
            }

            // Fetch approved logs and group members
            const approvedLogs = groupDocSnapshot.get("approvedLogs") || [];
            if (!Array.isArray(approvedLogs)) {
                console.error("Approved logs field is not an array.");
                return;
            }

            const users: DocumentReference[] = groupDocSnapshot.get("users") || [];
            setGroupMembers(users);

            const userLogCounts: { [userId: string]: number } = {}; // Tracks the number of logs each user authored

            // Iterate over the `approvedLogs` references
            for (const logRef of approvedLogs) {
                if (logRef instanceof DocumentReference) {
                    const logSnapshot = await getDoc(logRef);

                    if (logSnapshot.exists()) {
                        const logData = logSnapshot.data();
                        const authorRef: DocumentReference = logData.author; // Get the `author` field

                        if (authorRef && authorRef.id) {
                            const authorId = authorRef.id;

                            // Increment the count of logs authored by this user
                            userLogCounts[authorId] = (userLogCounts[authorId] || 0) + 1;
                        }
                    } else {
                        console.warn("Log document does not exist for:", logRef.path);
                    }
                } else {
                    console.error("Invalid log reference in approvedLogs:", logRef);
                }
            }

            // Map the log counts to the group members
            const userProgressData = users.map((member) => ({
                userId: member.id,
                approvedLogs: userLogCounts[member.id] || 0, // Default to 0 if the user authored no logs
            }));

            setUserProgress(userProgressData); // Update the state with user progress
        } catch (error) {
            console.error("Error fetching group data:", error);
        }
    };

    useEffect(() => {
        if (groupRef.length > 0) {
            fetchApprovedLogs(groupRef[0]);
        }
    });

    useEffect(() => {
        if (groupMembers.length > 0) {
            fetchUserProgress();
        }
    }, [groupMembers]);

    const fetchUserProgress = async () => {
        const userProgressComponents = await Promise.all(
            groupMembers.map(async (member, i) => {
                // get the member's snapshot, then get id field
                const memberDoc: DocumentSnapshot = await getDoc(member);
                const memberData = memberDoc.data();
                const memberApprovedLogs = memberData?.approvedLogs || [];
                console.log("Member Approved Logs:", memberApprovedLogs);

                return (
                    <UserProgress
                        key={member.id || i}
                        frequency={frequency}
                        totalVotes={memberApprovedLogs.length ? memberApprovedLogs.length : 0}
                    />
                );
            })
        );
        // update the state with the user progress components
        setUserProgressComponents(userProgressComponents);
    }


    const checkPlant = async () => {
        const plant = await getPlant(user);
        if (plant != null) {
            // console.log('plant');
            setPlant(plant);
        } else {
            // console.log('no plant');
            setPlant(null);
            // console.log('generating plant names');
            await handleGeneratePlantNames();
        }
    };

    const grabVotes = async () => {
        if (groupMembers.length === 0) {
            console.warn('Group members are not available yet. Skipping grabVotes.');
            return;
        }

        //console.log('Group Members:', groupMembers); // Log group members for debugging

        let pendingVotes = await checkPendingVotes(user);
        // console.log("THese are the votes");

        //console.log(pendingVotes);
        // console.log("after the votes");




        if (pendingVotes && Array.isArray(pendingVotes)) {
            for (const docRef of pendingVotes) {
                const docSnapshot = await getDoc(docRef);
                const docData = docSnapshot.data();

                if (docData) {
                    // @ts-ignore
                    const voteApprove = docData.voteApprove?.length || 0; // Count of approved votes
                    const totalMembers = groupMembers.length; // Use groupMembers directly

                    // @ts-ignore
                    // console.log('Document data:', docData.voteApprove);
                    // console.log('Total Members:', totalMembers);

                    if (totalMembers === 0) {
                        console.warn('Total members are 0. Cannot calculate approval percentage.');
                        continue;
                    }

                    const approvalPercentage = (voteApprove / totalMembers) * 100;

                    // console.log('Approval Percentage:', approvalPercentage);

                    // Show modal only if not already shown
                    if (approvalPercentage < 50 && !hasShownModal) {
                        setCurrentLogRef(docRef)
                        setModalVisible(true); // Show the VotingModal
                        setHasShownModal(true); // Mark modal as shown
                    } else {
                        // console.log();

                    }
                }
            }
        } else {
            // console.log('No pending votes or an error occurred.');
        }
    };



    const handleCreateGroup = async () => {
        console.log("a;lskdjfa;lskdjf;lksadjf");


        const newUserGroup = await createGroup(user, groupName, habit, frequency);

        if (!newUserGroup) {
            setError('Failed to create group');
            return;
        }

        setGroups([newUserGroup]);
        setHasGroups(true);
        await fetchGroups();
    };

    const handleJoinGroup = async () => {
        const newUserGroup = await joinGroup(user, codeInput);
        if (!newUserGroup) {
            setError('Invalid group code');
            return;
        }
        setGroups([newUserGroup]);
        setHasGroups(true);
        await fetchGroups();
    };

    const handleStep = (newStep: typeof step) => {
        setStep(newStep);
        setError(' ');
    }

    const handleFrequency = (newFrequency: number) => {
        if (newFrequency < 1) {
            newFrequency = 1;
        } else if (newFrequency > 7) {
            newFrequency = 7;
        }
        setFrequency(newFrequency);
    }

    const handleChoosePlant = async (plantChoiceIndex: number) => {

        const plantStages = ['sprouting', 'seedling', 'vegetating', 'budding', 'flowering'];

        const plantStagesPromises = plantStages.map(async (stage) => {
            const downloadURL = await generateAndUploadImage(
                `isolated ${plantNameChoices[plantChoiceIndex]} plant at the ${stage} growth stage, white background, isometric perspective, 8-bit pixel art style`,
                `plants/${uuid.v4()}-${plantNameChoices[plantChoiceIndex]}-${stage}-${Date.now()}.png`
            );
            return downloadURL;
        });

        const plantStageImages = await Promise.all(plantStagesPromises);
        const currentDate = new Date();

        if (plantImageChoices && plantImageChoices.length >= 4) {
            const plantDocRef: DocumentReference = await createPlant(
                0,
                [...plantStageImages, plantImageChoices[plantChoiceIndex]],
                plantNameChoices[plantChoiceIndex],
                plantLatinNames[plantChoiceIndex],
                getDecayDate(currentDate),
                true,
            );
            setPlant(plantDocRef);
        } else {
            console.error('Plant image choices not found');
        }
    }

    const handleGeneratePlantNames = async () => {
        const plantNames = ['Aloe Vera', 'Yucca', 'Succulent', 'Sunflower'];
        setPlantNameChoices(plantNames);
    }

    const handleGeneratePlantChoices = async () => {
        if (plantNameChoices.length === 0) return; // Ensure there are plant names
        const plantChoicesPromises = plantNameChoices.map(async (plantName) => {
            const downloadURL = await generateAndUploadImage(
                `isolated ${plantName} plant at the fruiting growth stage, white background, isometric perspective, 8-bit pixel art style`,
                `plants/${uuid.v4()}-${plantName}-${'fruiting'}-${Date.now()}.png`
            );
            return downloadURL;
        });

        const plantChoices = await Promise.all(plantChoicesPromises);
        setPlantImageChoices(plantChoices);
        // console.log('Plant Image Choices:', plantChoices);
    };

    const handleModalClose = (userResponse: string) => {
        setModalVisible(false);
        setResponse(userResponse);
        grabVotes()
    };

    useEffect(() => {
        const fetchUserProgress = async () => {
            if (groupMembers.length === 0 || groupRef.length === 0) return;

            const logs = await fetchApprovedLogs(groupRef[0]); // Fetch approved logs
            const userProgressData = groupMembers.map((member) => {
                const authoredLogs = logs.filter((log) => log.author?.id === member.id); // Filter logs by member ID
                return {
                    userId: member.id,
                    approvedLogs: authoredLogs.length, // Count logs authored by the member
                };
            });

            setUserProgress(userProgressData); // Store in state
        };

        fetchUserProgress();
    }, [groupMembers, groupRef]); // Dependencies: re-run when groupMembers or groupRef change

    return (

        <LinearGradient
            colors={['#8E9F8D', '#596558']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: "100%", height: "100%" }}
        >
            <View style={styles.container}>
                {!plant && !hasGroups ? (
                    // <View className='p-5'>
                    //     <Text>Choose a plant to get started.</Text>
                    //     <View className='flex-row'>
                    //         <View className='p-2'>
                    //             <TouchableOpacity onPress={() => handleChoosePlant(0)} disabled={plantImageChoices && plantImageChoices.length >= 4 ? false : true}>
                    //                 <Box className='h-40 w-40'>
                    //                     {plantImageChoices && plantImageChoices.length >= 4 ? <Image source={{ uri: plantImageChoices[0] }} style={styles.image} onError={(e) => console.log('Image failed to load', e.nativeEvent)} /> : <Spinner size="small" color={colors.gray[500]} />}
                    //                 </Box>
                    //             </TouchableOpacity>
                    //         </View>
                    //         <View className='p-2'>
                    //             <TouchableOpacity onPress={() => handleChoosePlant(1)} disabled={plantImageChoices && plantImageChoices.length >= 4 ? false : true}>
                    //                 <Box className='h-40 w-40'>
                    //                     {plantImageChoices && plantImageChoices.length >= 4 ? <Image source={{ uri: plantImageChoices[1] }} style={styles.image} onError={(e) => console.log('Image failed to load', e.nativeEvent)} /> : <Spinner size="small" color={colors.gray[500]} />}
                    //                 </Box>
                    //             </TouchableOpacity>
                    //         </View>
                    //     </View>
                    //     <View className='flex-row'>
                    //         <View className='p-2'>
                    //             <TouchableOpacity onPress={() => handleChoosePlant(2)} disabled={plantImageChoices && plantImageChoices.length >= 4 ? false : true}>
                    //                 <Box className='h-40 w-40'>
                    //                     {plantImageChoices && plantImageChoices.length >= 4 ? <Image source={{ uri: plantImageChoices[2] }} style={styles.image} onError={(e) => console.log('Image failed to load', e.nativeEvent)} /> : <Spinner size="small" color={colors.gray[500]} />}
                    //                 </Box>
                    //             </TouchableOpacity>
                    //         </View>
                    //         <View className='p-2'>
                    //             <TouchableOpacity onPress={() => handleChoosePlant(3)} disabled={plantImageChoices && plantImageChoices.length >= 4 ? false : true}>
                    //                 <Box className='h-40 w-40'>
                    //                     {plantImageChoices && plantImageChoices.length >= 4 ? <Image source={{ uri: plantImageChoices[3] }} style={styles.image} onError={(e) => console.log('Image failed to load', e.nativeEvent)} /> : <Spinner size="small" color={colors.gray[500]} />}
                    //                 </Box>
                    //             </TouchableOpacity>
                    //         </View>
                    //     </View>
                    //     <Button title="Refresh Plants" onPress={() => {
                    //         handleGeneratePlantNames();
                    //         setPlant(null);
                    //     }} />
                    // </View>
                    <View style={styles.container}>
                        {step === 'initial' && (
                            <View>
                                <Text>Welcome to your garden.</Text>
                                <Text>It's time to plant a new seed.</Text>
                                <Button title="Create a Group" onPress={() => handleStep('name-group')} />
                                <Button title="Join a Group" onPress={() => handleStep('enter-code')} />
                            </View>
                        )}
                        {step === 'name-group' && (
                            <View>
                                <Text>What is the group's name?</Text>
                                <TextInput
                                    placeholder={'Group Name'}
                                    placeholderTextColor="gray"
                                    value={groupName}
                                    onChangeText={setGroupName}
                                    style={styles.input}
                                />
                                <Button title="Next" onPress={() => handleStep('create-habit')} />
                                <Button title="Back" onPress={() => handleStep('initial')} />
                            </View>
                        )}
                        {step === 'create-habit' && (
                            <View>
                                <Text>What is the group's habit?</Text>
                                <TextInput
                                    placeholder="Habit"
                                    placeholderTextColor="gray"
                                    value={habit}
                                    onChangeText={setHabit}
                                    style={styles.input}
                                />
                                <Button title="Next" onPress={() => handleStep('set-frequency')} />
                                <Button title="Back" onPress={() => handleStep('name-group')} />
                            </View>
                        )}
                        {step === 'set-frequency' && (
                            <View>
                                <Text>How many days a week would your group like to commit to practicing this habit?</Text>
                                <Text>{frequency} Days a Week</Text>
                                <Button title="+" onPress={() => handleFrequency(frequency + 1)} />
                                <Button title="-" onPress={() => handleFrequency(frequency - 1)} />
                                {error && <Text style={styles.error}>{error}</Text>}
                                <Button title="Create Group" onPress={() => handleCreateGroup()} />
                                <Button title="Back" onPress={() => handleStep('create-habit')} />
                            </View>
                        )}
                        {step === 'enter-code' && (
                            <View>
                                <TextInput
                                    placeholder="Group Code"
                                    placeholderTextColor="gray"
                                    value={codeInput}
                                    onChangeText={setCodeInput}
                                    style={styles.input}
                                />
                                {error && <Text style={styles.error}>{error}</Text>}
                                <Button title="Back" onPress={() => handleStep('initial')} />
                                <Button title="Join" onPress={() => handleJoinGroup()} />
                            </View>
                        )}
                    </View>
                ) : hasGroups ? (
                    <View style={styles.inner_container}>
                        {/* <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}><Text>Button</Text></TouchableOpacity> */}
                        <VotingModal
                            visible={modalVisible}
                            onClose={handleModalClose}
                            profilePic={ProfilePic}
                            question="Do you like this image?"
                            logRef={currentLogRef} // Pass the Firestore document reference
                            totalMembers={groupMembers.length} />
                        
                        <Text>{groupCode}</Text>
                        <View>
                            <Text style={styles.header}>{habit}</Text>
                            <FrequencyBar />
                            {groupRef.length > 0 ? (
                                <DaysOfTheWeek groupRef={groupRef[0]} />
                            ) : (
                                <Text>Loading group information...</Text>
                            )}
                        </View>
                        <View style={styles.image_container}>
                            {<Image source={Plant} style={styles.image} />}

                        </View>
                        <VerificationBar frequency={frequency} totalUsers={groupMembers.length} approvedLogs={approvedLogs.length} />

                        <ScrollView style={styles.scrollheight}>
                            {
                                userProgressComponents.map((component, i) => (
                                    <View key={i}>
                                        {component}
                                    </View>
                                ))
                            }
                        </ScrollView>


                    </View>
                ) : (
                    //////////////////////////////////////////////////////////////////////////
                    <View style={styles.container}>
                        {/* {step === 'initial' && (
                            <View>
                                <Text>Welcome to your garden.</Text>
                                <Text>It's time to plant a new seed.</Text>
                                <Button title="Create a Group" onPress={() => handleStep('name-group')} />
                                <Button title="Join a Group" onPress={() => handleStep('enter-code')} />
                            </View>
                        )}
                        {step === 'name-group' && (
                            <View>
                                <Text>What is the group's name?</Text>
                                <TextInput
                                    placeholder={'Group Name'}
                                    placeholderTextColor="gray"
                                    value={groupName}
                                    onChangeText={setGroupName}
                                    style={styles.input}
                                />
                                <Button title="Next" onPress={() => handleStep('create-habit')} />
                                <Button title="Back" onPress={() => handleStep('initial')} />
                            </View>
                        )}
                        {step === 'create-habit' && (
                            <View>
                                <Text>What is the group's habit?</Text>
                                <TextInput
                                    placeholder="Habit"
                                    placeholderTextColor="gray"
                                    value={habit}
                                    onChangeText={setHabit}
                                    style={styles.input}
                                />
                                <Button title="Next" onPress={() => handleStep('set-frequency')} />
                                <Button title="Back" onPress={() => handleStep('name-group')} />
                            </View>
                        )}
                        {step === 'set-frequency' && (
                            <View>
                                <Text>How many days a week would your group like to commit to practicing this habit?</Text>
                                <Text>{frequency} Days a Week</Text>
                                <Button title="+" onPress={() => handleFrequency(frequency + 1)} />
                                <Button title="-" onPress={() => handleFrequency(frequency - 1)} />
                                {error && <Text style={styles.error}>{error}</Text>}
                                <Button title="Create Group" onPress={() => handleCreateGroup()} />
                                <Button title="Back" onPress={() => handleStep('create-habit')} />
                            </View>
                        )}
                        {step === 'enter-code' && (
                            <View>
                                <TextInput
                                    placeholder="Group Code"
                                    placeholderTextColor="gray"
                                    value={codeInput}
                                    onChangeText={setCodeInput}
                                    style={styles.input}
                                />
                                {error && <Text style={styles.error}>{error}</Text>}
                                <Button title="Back" onPress={() => handleStep('initial')} />
                                <Button title="Join" onPress={() => handleJoinGroup()} />
                            </View>
                        )} */}
                    </View>
                    ///////////////////////////////////////////////
                )}
            </View >
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    error: {
        color: 'red',
    },
    input: {
        height: 40,
        minWidth: 300,
        width: '100%',
        borderColor: 'lightgray',
        marginBottom: 12,
        paddingHorizontal: 8,
        color: 'black',
        borderRadius: 10,
    },
    scrollheight: {
        width: "100%"
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 16,
        width: "100%",
        alignItems: "center",
        height: "100%",

    },
    inner_container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: "10%",
        width: "100%",
        alignItems: "center",
        height: "100%",
        borderWidth: 2


    },
    image_container: {
        height: height * .3,
        width: width * .5,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    header: {
        fontSize: 20,
        lineHeight: 23.87,
        textAlign: "center",
        color: "white",
        marginBottom: 20
    }
});