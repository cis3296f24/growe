import { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useUser } from './UserContext';
import { fetchApprovedLogs, fetchUserLogs, fetchGroupLogs, clearAllLogs } from '@/utils/log'
import { arrayUnion, arrayRemove, DocumentReference, DocumentSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { checkUserHasGroup, joinGroup, createGroup } from '@/utils/group';
import { createChoices, getUndecidedChoices, getNewChoices } from '@/utils/choice';
import { checkPendingVotes } from '../utils/user';
import { LinearGradient } from 'expo-linear-gradient';
import VerificationBar from './extra/VerificationBar';
import FrequencyBar from './extra/FrequencyBar';
import DaysOfTheWeek from './extra/DaysOfTheWeek';
import UserProgress from './extra/UserProgress';
import { getPlant, setPlant } from '@/utils/group';
import { Box } from '@/components/ui/box';
import { generateVectorAndUploadImage } from '@/utils/diffusion';
import uuid from 'react-native-uuid';
import { Spinner } from '@/components/ui/spinner';
import colors from 'tailwindcss/colors';
import { createPlant, getDecayDate, getCurrentGrowStateImage } from '@/utils/plant';
import VotingModal from './VotingModal'
import ProfilePic from '../assets/images/Avatar.png'
import { ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import {
    Button as ButtonGluestack,
    ButtonText,
    ButtonSpinner,
    ButtonIcon,
    ButtonGroup,
} from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { useFonts } from 'expo-font';
import JoinGroup from '@/assets/icons/joinGroup.svg';
import CreateGroup from '@/assets/icons/createGroup.svg';
import { Heading } from '@/components/ui/heading';
import { generatePlantInfo } from '@/utils/completion';
import { SvgUri } from 'react-native-svg';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '@/utils/firebaseConfig';
import PlantWithGlow from './extra/PlantWithGlow';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { createGarden, getGarden } from '@/utils/garden';

const { width, height } = Dimensions.get('window');

interface PlantTextChoice {
    common: string;
    scientific: string;
    family: string;
    genus: string;
    species: string;
    habitat: string;
    region: string;
    uses: string[];
    description: string;
    habit: string;
    flowering: string;
    edible: boolean;
    toxicity: string;
}

interface PlantChoice {
    growState: number;
    growStateImageUrls: string[];
    decayAt: string;
    isOwned: boolean;
    common: string;
    scientific: string;
    family: string;
    genus: string;
    species: string;
    habitat: string;
    region: string;
    uses: string[];
    description: string;
    habit: string;
    flowering: string;
    edible: boolean;
    toxicity: string;
}

export function Group() {

    const [isGrown, setIsGrown] = useState(false);
    const [step, setStep] = useState<'initial' | 'name-group' | 'create-habit' | 'set-frequency' | 'display-code' | 'enter-code'>('initial');
    const [generatingPlant, setGeneratingPlant] = useState(false);
    const [generatingPlantProgress, setGeneratingPlantProgress] = useState(0);
    const [groups, setGroups] = useState<DocumentReference[]>([]);
    const [hasGroups, setHasGroups] = useState<boolean | null>(null);
    const { user } = useUser();
    const [groupName, setGroupName] = useState(`${user?.displayName}'s group`);
    const [codeInput, setCodeInput] = useState('');
    const [habit, setHabit] = useState('Go for a walk');
    const [frequency, setFrequency] = useState(1);
    const [error, setError] = useState('');
    const [groupMembers, setGroupMembers] = useState<DocumentReference[]>([]);
    const [groupCode, setGroupCode] = useState('');
    const [groupLogs, setGroupLogs] = useState<DocumentReference[]>([]);
    const [groupApprovedLogs, setGroupApprovedLogs] = useState<DocumentReference[]>([]);
    const [groupMemberNames, setGroupMemberNames] = useState<string[]>([]);
    const [currentPlant, setCurrentPlant] = useState<DocumentReference | null>(null);
    const [currentPlantVector, setCurrentPlantVector] = useState<string | null>(null);
    const [plantVectorChoices, setPlantVectorChoices] = useState<string[]>([]);
    const [plantTextChoices, setPlantTextChoices] = useState<PlantTextChoice[]>([]);
    const [plantChoicesRef, setPlantChoicesRef] = useState<DocumentReference | null>(null);
    const [plantName, setPlantName] = useState('');
    const [plantLatinName, setPlantLatinName] = useState('');
    const [approvedLogs, setApprovedLogs] = useState<DocumentReference[]>([])
    const [modalVisible, setModalVisible] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [hasShownModal, setHasShownModal] = useState(false);
    const [currentLogRef, setCurrentLogRef] = useState<DocumentReference | null>(null);
    const [streak, setStreak] = useState(0);
    const [userProgress, setUserProgress] = useState<{ userId: string, approvedLogs: number }[]>([]);
    const [userProgressComponents, setUserProgressComponents] = useState<JSX.Element[]>([]);
    const [daysOfTheWeek, setDaysOfTheWeek] = useState(null)
    const [fontsLoaded] = useFonts({
        "SF-Pro-Rounded-Regular": require("../assets/fonts/SF-Pro-Rounded-Regular.ttf"),
        "SF-Pro-Rounded-Bold": require("../assets/fonts/SF-Pro-Rounded-Bold.ttf"),
        "cmunci": require("../assets/fonts/cmunci.ttf"),
      });
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log("User is signed in");
          } else {
            console.log("No user signed in");
          }
        });
        return () => unsubscribe();
      }, []);

    const fetchGroups = async () => {
        const groupRefs = await checkUserHasGroup(user);

        if (Array.isArray(groupRefs) && groupRefs.length > 0) {
            //console.log("Fetched Group References:", groupRefs);
            setGroups(groupRefs);
            setHasGroups(true);

            const groupData = await getDoc(groupRefs[0]);
            if (groupData.exists()) {
                const users = groupData.get("users") || [];
                const approvedLogs = groupData.get("approvedLogs") || [];
                setGroupMembers(users);
                setApprovedLogs(approvedLogs);
                setFrequency(groupData.get("frequency") || 1);
                setGroupCode(groupData.get("joinCode"));
                setGroupName(groupData.get("name") || "Unnamed Group");
                const groupDataLogs = await fetchGroupLogs(groupRefs[0]);
                setGroupLogs(groupDataLogs);
            }
        } else {
            setGroups([]);
            setHasGroups(false);
            setGroupMembers([]);
            setApprovedLogs([]);
            console.warn("No groups found for the user.");
        }
    };

    useEffect(() => {
        fetchGroups();
        console.log('Checked groups.');
    }, []);

    useEffect(() => {
        if (hasGroups != null) {
            checkPlant();
            console.log('Checked plant.');
        }
    }, [hasGroups]);

    useEffect(() => {
        // Only call grabVotes if groupMembers is populated
        if (groupMembers.length > 0) {
            console.log('groupMembers updated. Grabbing votes.');
            grabVotes();
        } else {
            console.log('groupMembers is empty. Skipping grabVotes.');
        }
    }, [groupMembers]);

    useEffect(() => {
        if (plantTextChoices.length > 0 && plantVectorChoices?.length === 0) {
            handleGeneratePlantVectors();
            console.log('B >>> Generated plant vectors');
        }
    }, [plantTextChoices]);

    useEffect(() => {
        if (plantVectorChoices.length > 0 && plantTextChoices.length > 0 && plantChoicesRef === null) {
            console.log('Plant vectors and text choices are available. Constructing plant choices.');
            handleConstructPlantChoices();
            console.log('C >>> Constructed plant choices');
        }
    }, [plantVectorChoices]);

    useEffect(() => {
        if (groups.length > 0) {
            fetchApprovedLogs(groups.at(-1));
        }
    });

    useEffect(() => {
        if (groupMembers.length > 0) {
            fetchUserProgress();
        }
    }, [groupMembers]);

    const fetchUserProgress = async () => {
        if (groupMembers.length === 0 || groups.length === 0) {
            console.warn("Group members or group reference is not available.");
            return;
        }
        const userProgressComponents = await Promise.all(
            groupMembers.map(async (member, i) => {
                // get the member's snapshot, then get id field
                const memberDoc: DocumentSnapshot = await getDoc(member);
                const memberData = memberDoc.data();
                const memberApprovedLogs = memberData?.approvedLogs || [];
                console.log("Member Approved Logs:", memberApprovedLogs);
                const userLogs = await fetchUserLogs(member);
                console.log("User Logs:", userLogs);

                return (
                    <UserProgress
                        key={member.id || i}
                        frequency={frequency}
                        approvedUserLogs={memberApprovedLogs.length ? memberApprovedLogs.length : 0}
                        totalUserLogs={userLogs.length ? userLogs.length : 0}
                    />
                );
            })
        );
        // update the state with the user progress components
        setUserProgressComponents(userProgressComponents);
    }

    const checkPlant = async () => {
        console.log('Checking plant');
        const plant: DocumentReference = await getPlant(user);
        console.log('Plant:', plant);
        if (plant) {
            console.log('Plant exists.');
            setCurrentPlant(plant);
            const plantData = await getDoc(plant);
            setPlantName(plantData.get('common'));
            const isGrown = plantData.get('growState') === 5;
            setIsGrown(isGrown);
            setPlantLatinName(plantData.get('scientific'));
            const currentVectorUri = await getCurrentGrowStateImage(plant);
            // console.log('currentVectorUri', currentVectorUri);
            if (currentVectorUri) {
                setCurrentPlantVector(currentVectorUri);
            } else {
                console.warn('currentVectorUri is null or undefined');
            }
        } else {
            try {
                console.warn('No plant exists.');
                setCurrentPlant(null);

                // check if in group
                if (groups.length === 0) {
                    console.warn('No groups available. Waiting until user has group...');
                    return;
                }

                const undecidedChoicesRef: DocumentReference | null = await getUndecidedChoices(groups.at(-1));
                if (undecidedChoicesRef) {
                    console.log('Has undecided choices');
                    setPlantChoicesRef(undecidedChoicesRef);
                    const undecidedChoicesDoc = await getDoc(undecidedChoicesRef);

                    undecidedChoicesDoc.get('plants').forEach( async (plantDoc: DocumentReference) => {
                        const choiceData = await getDoc(plantDoc);
                        // Use functional updates for state
                        setPlantVectorChoices(prev => [...prev, choiceData.get('growStateImageUrls').at(-1)]);
                        setPlantTextChoices(prev => [...prev, {
                            common: choiceData.get('common'),
                            scientific: choiceData.get('scientific'),
                            family: choiceData.get('family'),
                            genus: choiceData.get('genus'),
                            species: choiceData.get('species'),
                            habitat: choiceData.get('habitat'),
                            region: choiceData.get('region'),
                            uses: choiceData.get('uses'),
                            description: choiceData.get('description'),
                            habit: choiceData.get('habit'),
                            flowering: choiceData.get('flowering'),
                            edible: choiceData.get('edible'),
                            toxicity: choiceData.get('toxicity'),
                        }]);
                    });
                    return;
                }

                console.log('No undecided choices. Checking for new choices.');
                const plantNewChoicesRef = await getNewChoices(groups.at(-1));
                if (plantNewChoicesRef) {
                    console.log('Has new choices');
                    setPlantChoicesRef(plantNewChoicesRef);
                    const plantNewChoices = await getDoc(plantNewChoicesRef);

                    await updateDoc(plantNewChoicesRef, {
                        undecided: arrayUnion(groups.at(-1)),
                    });

                    plantNewChoices.get('plants').forEach( async (plantDoc: DocumentReference) => {
                        // get the doc ref data
                        const choiceData = await getDoc(plantDoc);
                        // add the data to vector and text choices states
                        setPlantVectorChoices(prev => [...prev, choiceData.get('growStateImageUrls').at(-1)]);
                        setPlantTextChoices(prev => [...prev, {
                            common: choiceData.get('common'),
                            scientific: choiceData.get('scientific'),
                            family: choiceData.get('family'),
                            genus: choiceData.get('genus'),
                            species: choiceData.get('species'),
                            habitat: choiceData.get('habitat'),
                            region: choiceData.get('region'),
                            uses: choiceData.get('uses'),
                            description: choiceData.get('description'),
                            habit: choiceData.get('habit'),
                            flowering: choiceData.get('flowering'),
                            edible: choiceData.get('edible'),
                            toxicity: choiceData.get('toxicity'),
                        }]);
                    });
                    return;
                } else if (plantTextChoices.length === 0) {
                    console.warn('No new choices available. Generating new choices.');
                    await handleGeneratePlantTextChoices();
                    console.log('A >>> Generated new choices.');
                    return;
                } else {
                    console.warn('No new choices available.');
                    return;
                }
            } catch (error) {
                console.error('Error checking plant:', error);
            }
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
                    }
                }
            }
        } else {
            console.log('No pending votes.');
        }
    };

    const handleCreateGroup = async () => {
        console.log("a;lskdjfa;lskdjf;lksadjf");


        const newUserGroupRef = await createGroup(user, groupName, habit, frequency);
        const gardenRef = await createGarden(newUserGroupRef)

        if (!newUserGroupRef) {
            setError('Failed to create group');
            return;
        }

        setGroups([newUserGroupRef]);
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
        setError('');
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

        setGeneratingPlant(true);

        const plantStages = ['sprouting', 'seedling', 'vegetating', 'budding', 'flowering'];

        try {
            const plantStagesPromises = plantStages.map(async (stage) => {
                const downloadURL = await generateVectorAndUploadImage(
                    `isolated ${plantTextChoices[plantChoiceIndex].common} plant at the ${stage} growth stage, white background, isometric perspective, flat vector art style`,
                    `plants/${plantTextChoices[plantChoiceIndex].common}-${stage}.png`,
                    `plants/${plantTextChoices[plantChoiceIndex].common}-${stage}.svg`
                );
                return downloadURL;
            });

            setGeneratingPlantProgress(20);

            const plantStageImages = await Promise.all(plantStagesPromises);
            const currentDate = new Date();

            setGeneratingPlantProgress(40);

            // get choices ref and the chosen plant ref inside the choices ref

            if (!plantChoicesRef) {
                console.error('Plant choices ref is not available.');
                return;
            }

            await updateDoc(plantChoicesRef, {
                // remove group reference from undecided array and add it to decided array
                undecided: arrayRemove(groups.at(-1)),
                decided: arrayUnion(groups.at(-1)),
            });

            setGeneratingPlantProgress(60);

            const choicesDoc = await getDoc(plantChoicesRef)

            if (!choicesDoc.exists()) {
                console.error('Choices document does not exist.');
                return;
            }
            const plantDocRef: DocumentReference = choicesDoc.data().plants.at(plantChoiceIndex);

            // add stage images and new decay date to the plant
            const newDecayDate = getDecayDate(currentDate);

            await updateDoc(plantDocRef, {
                growStateImageUrls: [ ...plantStageImages, plantVectorChoices[plantChoiceIndex]],
                decayAt: newDecayDate,
            });

            setGeneratingPlantProgress(80);

            const groupDocRef = groups.at(-1);
            await setPlant(groupDocRef, plantDocRef);
            setCurrentPlant(plantDocRef);
            await fetchGroups();
            await checkPlant();

            setGeneratingPlantProgress(100);

            setGeneratingPlant(false);
        } catch (error) {
            console.error('Error choosing plant:', error);
        }
    }

    const handleGeneratePlantTextChoices = async () => {
        const plantObjects = await generatePlantInfo();
        console.log('Plant Names:', plantObjects);
        setPlantTextChoices(plantObjects);
    }

    const handleGeneratePlantVectors = async () => {
        try{
            if (plantTextChoices.length === 0 || plantVectorChoices.length != 0) return; // Ensure there are plant names
            console.log('Plant choices generation started');
            const plantChoicesPromises = plantTextChoices.map(async (plantChoice) => {
                console.log(`Generating vector for: ${plantChoice.common}`);
                const downloadURL = await generateVectorAndUploadImage(
                    `isolated ${plantChoice.common} plant at the fruiting growth stage, white background, isometric perspective, flat vector art style`,
                    `plants/${plantChoice.common}-${'fruiting'}.png`,
                    `plants/${plantChoice.common}-${'fruiting'}.svg`,
                );
                return downloadURL;
            });

            const plantChoices: string[] = await Promise.all(plantChoicesPromises);
            setPlantVectorChoices(plantChoices);
            console.log('Plant choices generation completed: ' + plantChoices);
        } catch (error) {
            console.error('Error generating plant vectors:', error);
        }
    };

    const handleConstructPlantChoices = async () => {
        try {
            if (plantTextChoices.length === 0) {
                console.error('Plant text choices are empty.');
                return;
            } else if (plantVectorChoices.length === 0) {
                console.error('Plant vector choices are empty.');
                return;
            } else if (plantVectorChoices.length != plantTextChoices.length) {
                console.error('Plant text and vector choices do not match in length.');
                console.error('Plant Text Choices:', plantTextChoices);
                console.error('Plant Vector Choices:', plantVectorChoices);
                return;
            }

            let plantChoicesData: PlantChoice[] = [];

            const plantRefs = plantTextChoices.map(async (plant, i) => {
                const plantChoiceData: PlantChoice = {
                    growState: 0,
                    growStateImageUrls: [plantVectorChoices[i]],
                    decayAt: getDecayDate(new Date()),
                    isOwned: false,
                    common: plant.common,
                    scientific: plant.scientific,
                    family: plant.family,
                    genus: plant.genus,
                    species: plant.species,
                    habitat: plant.habitat,
                    region: plant.region,
                    uses: plant.uses,
                    description: plant.description,
                    habit: plant.habit,
                    flowering: plant.flowering,
                    edible: plant.edible,
                    toxicity: plant.toxicity,
                };
                plantChoicesData.push(plantChoiceData);
                const plantRef = await createPlant(
                    0,
                    [plantVectorChoices[i]],
                    getDecayDate(new Date()),
                    false,
                    plant.common,
                    plant.scientific,
                    plant.family,
                    plant.genus,
                    plant.species,
                    plant.habitat,
                    plant.region,
                    plant.uses,
                    plant.description,
                    plant.habit,
                    plant.flowering,
                    plant.edible,
                    plant.toxicity,
                );
                return plantRef;
            }
            );

            const plantRefsArray = await Promise.all(plantRefs);

            const choicesRef = await createChoices(groups.at(-1), plantRefsArray);

            console.log('Choices Ref:', choicesRef);

            setPlantChoicesRef(choicesRef);
        } catch (error) {
            console.error('Error constructing plant choices:', error);
        }
    }

    const handleModalClose = async (userResponse: string) => {
        setModalVisible(false);
        setResponse(userResponse);
        await grabVotes();
    };

    useEffect(() => {
        const fetchUserProgress = async () => {
            if (groupMembers.length === 0 || groups.length === 0) return;

            const logs = await fetchApprovedLogs(groups.at(-1)); // Fetch approved logs
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
    }, [groupMembers, groups]); // Dependencies: re-run when groupMembers or groupRef change

    const handleChooseNewPlant = async () => {
        try {
            const gardenRef = await getGarden(groups.at(-1));
            if (!gardenRef) {
                console.error('Garden reference is not available.');
                return;
            }
            await updateDoc(gardenRef, {
                plants: arrayUnion(currentPlant),
            });

            const groupRef = groups.at(-1);
            if (!groupRef) {
                console.error('Group reference is not available.');
                return;
            }
            await updateDoc(groupRef, {
                plant: null,
            });

            // clear approvedLogs from each user
            groupMembers.forEach(async (member) => {
                await clearAllLogs(member, groupRef);
            });
            await checkPlant();
            setIsGrown(false);
        } catch (error) {
            console.error('Error choosing new plant:', error);
        }
    }

    return (
        <LinearGradient
            colors={['#8E9F8D', '#596558']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: "100%", height: "100%" }}
        >
            <View style={styles.container}>
                {generatingPlant ? (
                    <View className='p-5 gap-4 pb-28'>
                        <Heading size='2xl' className="font-bold text-neutral-300">
                            Generating Plant...
                        </Heading>
                        <Box className='flex-col align-middle justify-center items-center'>
                            <Progress className='bg-primaryGreen' value={generatingPlantProgress} size="2xl" orientation="horizontal">
                                <ProgressFilledTrack className='bg-neutral-300'/>
                            </Progress>
                        </Box>
                    </View>
                ) : isGrown ? (
                    <Box className='flex flex-col items-center align-middle gap-4'>
                        
                        <Heading size='2xl' className="font-bold text-white">
                        Your plant has grown!
                        </Heading>
                        <FrequencyBar
                            frequency={frequency}
                            code={groupCode}
                        />
                        <Box>
                            {groups.length > 0 ? (
                                <DaysOfTheWeek groupRef={groups.at(-1)} />
                            ) : (
                                <Text size='xl' className="font-regular text-neutral-300">
                                Loading group information...
                                </Text>
                            )}
                        </Box>
                        <Box className='w-80 h-80'>
                        <PlantWithGlow currentPlantVector={currentPlantVector} />
                        </Box>
                        <Box className='flex-row gap-1'>
                            <Text size='xl' className="font-regular text-neutral-300">
                                {plantName}
                            </Text>
                            <Text size='xl' className="font-regular text-neutral-300">
                                |
                            </Text>
                            <Text size='xl' className="font-italic text-neutral-300">
                                {plantLatinName}
                            </Text>
                        </Box>
                        <VerificationBar frequency={frequency} totalUsers={groupMembers.length} approvedLogs={approvedLogs.length} totalLogs={groupLogs.length} />

                        <Box className='p-14'>
                            <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-64" size="xl" onPress={handleChooseNewPlant}>
                                <ButtonText className='font-bold'>Choose a new plant</ButtonText>
                            </ButtonGluestack>
                        </Box>

                    </Box>
                ) : !currentPlant && hasGroups ? (
                    // {!plant && hasGroups ? (
                    <View className='p-5 gap-4 pb-28'>
                        <Heading size='2xl' className="font-regular text-neutral-300">
                            Choose a plant to get started.
                        </Heading>
                        <Box>
                            <View className='flex-row gap-4'>
                                <View className='p-2 rounded-2xl bg-primaryGreen'>
                                    <TouchableOpacity onPress={() => handleChoosePlant(0)} disabled={plantVectorChoices && plantVectorChoices.length >= 4 ? false : true}>
                                        <Box className='flex-col flex justify-center align-middle items-center w-40 h-auto'>

                                            <Box className='flex w-40 h-40 justify-center'>
                                            {plantVectorChoices.length > 0 ? <SvgUri uri={plantVectorChoices[0]} onError={(e) => console.log('Image failed to load', e)} className='w-40 h-40'/> : <Spinner size="large" color={'#788478'} />}
                                            </Box>

                                            {plantTextChoices.length > 0 ? (
                                                <Box className='flex-col align-middle justify-center items-center'>
                                                    <Heading size='lg' className="font-bold text-neutral-300 pt-2">
                                                        {plantTextChoices[0]?.common}
                                                    </Heading>
                                                    <Text size='lg' italic className="font-italic text-neutral-300">
                                                        {plantTextChoices[0]?.scientific}
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Box className='flex-col align-middle justify-center items-center gap-2 pb-4'>
                                                    <SkeletonText _lines={1} className='h-4 w-32 bg-slightGreen'/>
                                                    <SkeletonText _lines={1} className='h-4 w-20 bg-slightGreen'/>
                                                </Box>
                                            )}
                                        </Box>
                                    </TouchableOpacity>
                                </View>
                                <View className='p-2 rounded-2xl bg-primaryGreen'>
                                    <TouchableOpacity onPress={() => handleChoosePlant(1)} disabled={plantVectorChoices && plantVectorChoices.length >= 4 ? false : true}>
                                        <Box className='flex-col flex justify-center align-middle items-center w-40 h-auto'>

                                            <Box className='flex w-40 h-40 justify-center'>
                                            {plantVectorChoices.length > 0 ? <SvgUri uri={plantVectorChoices[1]} onError={(e) => console.log('Image failed to load', e)} className='w-40 h-40'/> : <Spinner size="large" color={'#788478'} />}
                                            </Box>
                                            {plantTextChoices.length > 0 ? (
                                                <Box className='flex-col align-middle justify-center items-center'>
                                                    <Heading size='lg' className="font-bold text-neutral-300 pt-2">
                                                        {plantTextChoices[1]?.common}
                                                    </Heading>
                                                    <Text size='lg' italic className="font-italic text-neutral-300">
                                                        {plantTextChoices[1]?.scientific}
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Box className='flex-col align-middle justify-center items-center gap-2 pb-4'>
                                                    <SkeletonText _lines={1} className='h-4 w-32 bg-slightGreen'/>
                                                    <SkeletonText _lines={1} className='h-4 w-20 bg-slightGreen'/>
                                                </Box>
                                            )}
                                        </Box>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className='flex-row pt-4 gap-4'>
                            <View className='p-2 rounded-2xl bg-primaryGreen'>
                                    <TouchableOpacity onPress={() => handleChoosePlant(2)} disabled={plantVectorChoices && plantVectorChoices.length >= 4 ? false : true}>
                                        <Box className='flex-col flex justify-center align-middle items-center w-40 h-auto'>

                                            <Box className='flex w-40 h-40 justify-center'>
                                            {plantVectorChoices.length > 0 ? <SvgUri uri={plantVectorChoices[2]} onError={(e) => console.log('Image failed to load', e)} className='w-40 h-40'/> : <Spinner size="large" color={'#788478'} />}
                                            </Box>
                                            {plantTextChoices.length > 0 ? (
                                                <Box className='flex-col align-middle justify-center items-center'>
                                                    <Heading size='lg' className="font-bold text-neutral-300 pt-2">
                                                        {plantTextChoices[2]?.common}
                                                    </Heading>
                                                    <Text size='lg' italic className="font-italic text-neutral-300">
                                                        {plantTextChoices[2]?.scientific}
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Box className='flex-col align-middle justify-center items-center gap-2 pb-4'>
                                                    <SkeletonText _lines={1} className='h-4 w-32 bg-slightGreen'/>
                                                    <SkeletonText _lines={1} className='h-4 w-20 bg-slightGreen'/>
                                                </Box>
                                            )}
                                        </Box>
                                    </TouchableOpacity>
                                </View>
                                <View className='p-2 rounded-2xl bg-primaryGreen'>
                                    <TouchableOpacity onPress={() => handleChoosePlant(3)} disabled={plantVectorChoices && plantVectorChoices.length >= 4 ? false : true}>
                                        <Box className='flex-col flex justify-center align-middle items-center w-40 h-auto'>

                                            <Box className='flex w-40 h-40 justify-center'>
                                            {plantVectorChoices.length > 0 ? <SvgUri uri={plantVectorChoices[3]} onError={(e) => console.log('Image failed to load', e)} className='w-40 h-40'/> : <Spinner size="large" color={'#788478'} />}
                                            </Box>
                                            {plantTextChoices.length > 0 ? (
                                                <Box className='flex-col align-middle justify-center items-center'>
                                                    <Heading size='lg' className="font-bold text-neutral-300 pt-2">
                                                        {plantTextChoices[3]?.common}
                                                    </Heading>
                                                    <Text size='lg' italic className="font-italic text-neutral-300">
                                                        {plantTextChoices[3]?.scientific}
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Box className='flex-col align-middle justify-center items-center gap-2 pb-4'>
                                                    <SkeletonText _lines={1} className='h-4 w-32 bg-slightGreen'/>
                                                    <SkeletonText _lines={1} className='h-4 w-20 bg-slightGreen'/>
                                                </Box>
                                            )}
                                        </Box>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Box>
                    </View>
                ) : currentPlant && hasGroups ? (
                    <Box className='flex flex-col items-center align-middle gap-4'>
                        <VotingModal
                            visible={modalVisible}
                            onClose={handleModalClose}
                            profilePic={ProfilePic}
                            question={`Did ${user?.displayName?.charAt(0).toUpperCase()}${user?.displayName?.slice(1)} ${habit.toLowerCase()}?`}
                            logRef={currentLogRef} // Pass the Firestore document reference
                            totalMembers={groupMembers.length}
                        />
                        
                        <Heading size='2xl' className="font-bold text-white pt-12">
                        {habit}
                        </Heading>
                        <FrequencyBar
                            frequency={frequency}
                            code={groupCode}
                        />
                        <Box>
                            {groups.length > 0 ? (
                                <DaysOfTheWeek groupRef={groups.at(-1)} />
                            ) : (
                                <Text size='xl' className="font-regular text-neutral-300">
                                Loading group information...
                                </Text>
                            )}
                        </Box>
                        <Box className='w-80 h-80'>
                        <PlantWithGlow currentPlantVector={currentPlantVector} />
                        </Box>
                        <Box className='flex-row gap-1'>
                            <Text size='xl' className="font-regular text-neutral-300">
                                {plantName}
                            </Text>
                            <Text size='xl' className="font-regular text-neutral-300">
                                |
                            </Text>
                            <Text size='xl' className="font-italic text-neutral-300">
                                {plantLatinName}
                            </Text>
                        </Box>
                        <VerificationBar frequency={frequency} totalUsers={groupMembers.length} approvedLogs={approvedLogs.length} totalLogs={groupLogs.length} />

                        <ScrollView className='w-96'>
                            <Box className='flex-col gap-2 pt-4'>
                            {
                                userProgressComponents.map((component, i) => (
                                    <Box key={i}>
                                        {component}
                                    </Box>
                                ))
                            }
                            </Box>
                        </ScrollView>

                    </Box>
                ) : (
                    <View className='pb-28'>
                        {step === 'initial' && (
                            <Box className='flex-1 justify-center items-center gap-4'>
                            <Heading size='xl' className="font-bold text-neutral-300">
                            It's time to plant a new seed.
                            </Heading>
                            <ButtonGluestack className="bg-primaryGreen p-4 rounded-2xl" style={{ width: 200, height: 150 }} size="xl" variant="solid" action="primary" onPress={() => handleStep('name-group')}>
                                <Box className='flex flex-col items-center justify-center gap-1'>
                                    <CreateGroup height={50} width={50}/>
                                    <ButtonText className='font-bold'>Create a Group</ButtonText>
                                </Box>
                            </ButtonGluestack>
                            <ButtonGluestack className="bg-primaryGreen p-4 rounded-2xl" style={{ width: 200, height: 150 }} size="xl" variant="solid" action="primary" onPress={() => handleStep('enter-code')}>
                                <Box className='flex flex-col items-center justify-center gap-1'>
                                    <JoinGroup height={50} width={50}/>
                                    <ButtonText className='font-bold'>Join a Group</ButtonText>
                                </Box>
                            </ButtonGluestack>
                        </Box>

                        )}
                        {step === 'name-group' && (
                            <Box className='flex-1 justify-center items-center gap-4'>
                                <Heading size='xl' className="font-regular text-neutral-300">
                                What is the group's name?
                                </Heading>
                                <Input
                                    variant="outline"
                                    size="xl"
                                    isDisabled={false}
                                    isInvalid={false}
                                    isReadOnly={false}
                                    className='rounded-2xl min-w-72'
                                >
                                    <InputField
                                    className='font-regular'
                                    placeholder="Group Name"
                                    value={groupName}
                                    onChangeText={setGroupName}
                                    />
                                </Input>
                                <Box className='w-full'>
                                    <Box className='flex-row justify-between'>
                                        <ButtonGluestack
                                        className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                                        size="xl"
                                        onPress={() => handleStep('initial')}
                                        >
                                            <ButtonText className='font-bold'>Back</ButtonText>
                                        </ButtonGluestack>
                                        <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-16" size="xl" onPress={() => handleStep('create-habit')}>
                                            <ButtonText className='font-bold'>Next</ButtonText>
                                        </ButtonGluestack>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                        {step === 'create-habit' && (
                            <Box className='flex-1 justify-center items-center gap-4'>
                                <Heading size='xl' className="font-regular text-neutral-300">
                                What is the group's habit?
                                </Heading>
                                <Input
                                    variant="outline"
                                    size="xl"
                                    isDisabled={false}
                                    isInvalid={false}
                                    isReadOnly={false}
                                    className='rounded-2xl min-w-72'
                                >
                                    <InputField
                                    className='font-regular'
                                    placeholder="Habit"
                                    value={habit}
                                    onChangeText={setHabit}
                                    />
                                </Input>
                                <Box className='w-full'>
                                    <Box className='flex-row justify-between'>
                                        <ButtonGluestack
                                        className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                                        size="xl"
                                        onPress={() => handleStep('name-group')}
                                        >
                                            <ButtonText className='font-bold'>Back</ButtonText>
                                        </ButtonGluestack>
                                        <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-16" size="xl" onPress={() => handleStep('set-frequency')}>
                                            <ButtonText className='font-bold'>Next</ButtonText>
                                        </ButtonGluestack>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                        {step === 'set-frequency' && (
                            <Box className='flex-1 flex flex-col justify-center items-center gap-10'>
                                <Heading size='xl' className="font-regular text-neutral-300 text-center pl-16 pr-16">
                                How many days a week would your group like to commit to practicing this habit?
                                </Heading>
                                <Box className='flex-row gap-10'>
                                    <Box className='flex-col justify-center'>
                                        <Heading size='5xl' className='text-baseGreen'>{frequency}</Heading>
                                        <Heading size='xl' className="font-bold text-neutral-300">
                                        Days a Week
                                        </Heading>
                                    </Box>
                                    <Box className='flex-col gap-2'>
                                        <ButtonGluestack className={`bg-primaryGreen p-2 rounded-2xl w-12`} size="xl" onPress={() => handleFrequency(frequency + 1)}>
                                            <ButtonText className='font-bold'>+</ButtonText>
                                        </ButtonGluestack>
                                        <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-12" size="xl" onPress={() => handleFrequency(frequency - 1)}>
                                            <ButtonText className='font-bold'>-</ButtonText>
                                        </ButtonGluestack>
                                    </Box>
                                </Box>
                                {error && <Text size='lg' className='color-red-400 font-regular'>{error}</Text>}
                                <Box className='w-72'>
                                    <Box className='flex-row justify-between'>
                                        <ButtonGluestack
                                        className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                                        size="xl"
                                        onPress={() => handleStep('create-habit')}
                                        >
                                            <ButtonText className='font-bold'>Back</ButtonText>
                                        </ButtonGluestack>
                                        <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-32" size="xl" onPress={() => handleCreateGroup()}>
                                            <ButtonText className='font-bold'>Create Group</ButtonText>
                                        </ButtonGluestack>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                        {step === 'enter-code' && (
                            <Box className='flex-1 justify-center items-center gap-4'>
                                <Heading size='xl' className="font-regular text-neutral-300 text-center pl-16 pr-16">
                                Enter the group's code to join.
                                </Heading>
                                <Input
                                    variant="outline"
                                    size="xl"
                                    isDisabled={false}
                                    isInvalid={false}
                                    isReadOnly={false}
                                    className='rounded-2xl min-w-72'
                                >
                                    <InputField
                                    className='font-regular'
                                    placeholder="Group Code"
                                    value={codeInput}
                                    onChangeText={setCodeInput}
                                    placeholderTextColor={'white'}
                                    />
                                </Input>
                                {error && <Text size='lg' className='color-red-400 font-regular'>{error}</Text>}
                                <Box className='w-72'>
                                    <Box className='flex-row justify-between'>
                                        <ButtonGluestack
                                        className={`bg-primaryGreen p-2 rounded-2xl w-16`}
                                        size="xl"
                                        onPress={() => handleStep('initial')}
                                        >
                                            <ButtonText className='font-bold'>Back</ButtonText>
                                        </ButtonGluestack>
                                        <ButtonGluestack className="bg-primaryGreen p-2 rounded-2xl w-16" size="xl" onPress={() => handleJoinGroup()}>
                                            <ButtonText className='font-bold'>Join</ButtonText>
                                        </ButtonGluestack>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </View>
                )}
            </View >
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    choose: {
        flex: 1,
        justifyContent: 'center',
    },
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
    container: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    inner_container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: "10%",
        width: "100%",
        alignItems: "center",
        height: "100%",
    },
});