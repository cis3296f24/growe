import { LinearGradient } from 'expo-linear-gradient';
import { DocumentReference, DocumentSnapshot, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Plant from '../assets/images/Plant.png';
import { checkUserHasGroup, createGroup, joinGroup } from '../utils/group';
import { checkPendingVotes } from '../utils/user';
import DaysOfTheWeek from './smaller_components/DaysOfTheWeek';
import FrequencyBar from './smaller_components/FrequencyBar';
import UserProgress from './smaller_components/UserProgress';
import VerificationBar from './smaller_components/VerificationBar';
import { useUser } from './UserContext';

const { width, height } = Dimensions.get('window');


export function Group() {

    const [step, setStep] = useState<'initial' | 'name-group' | 'create-habit' | 'set-frequency' | 'display-code' | 'enter-code'>('initial');
    const [groups, setGroups] = useState<DocumentReference[]>([]);
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
    const [approvals, setApprovals] = useState(0)
    const [newVotes, setNewVotes] = useState<DocumentReference[]>([])



    const votesArray = groupMembers.map(() => Math.floor(Math.random() * (frequency + 5)));



    // your functiont to scan for new votes

    useEffect(() => {
        // Calculate total approvals
        const totalApprovals = votesArray.reduce((total, votes) => total + votes, 0);
        setApprovals(totalApprovals);

    }, [votesArray]); // Update when votesArray changes

    const getVotes = async () => {
        let data = await checkPendingVotes(user)
        console.log(data);
    }

    useEffect(() => {
        getVotes()
    }, [])


    const fetchGroups = async () => {
        const groupRefs: DocumentReference[] = await checkUserHasGroup(user);
        if (groupRefs && groupRefs.length > 0) {
            setGroups(groupRefs);
            setHasGroups(true);
            const groupData = await getDoc(groupRefs[0]);
            const users = groupData.get("users");
            setGroupMembers(users);
            setHabit(groupData.get("habit"));
            setFrequency(groupData.get("frequency"));
            setGroupName(groupData.get("name"));
            setGroupCode(groupData.get("joinCode"));
            const memberNames = await Promise.all(users.map(async (member: DocumentReference) => {
                const memberDoc: DocumentSnapshot = await getDoc(member);
                if (!memberDoc.exists()) {
                    return 'Unknown';
                }
                return memberDoc.get("displayName");
            }));
            setGroupMemberNames(memberNames);
        } else {
            setHasGroups(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [user]);

    const handleCreateGroup = async () => {

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


    return (
        <LinearGradient
            colors={['#8E9F8D', '#596558']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ width: "100%", height: "100%" }}
        >
            <View style={styles.container}>
                {hasGroups ? (

                    <View style={styles.inner_container}>

                        <TouchableOpacity onPress={async () => {
                            console.log(checkPendingVotes(user));


                        }}><Text>Button</Text></TouchableOpacity>
                        <View>
                            <Text style={styles.header}>{habit}</Text>
                            <FrequencyBar />
                            <DaysOfTheWeek selectedDays={['m', 't', 'w']} />
                        </View>
                        <View style={styles.image_container}>
                            {<Image source={Plant} style={styles.image} />}
                        </View>
                        <Text>{approvals}</Text>
                        <VerificationBar frequency={frequency} totalUsers={groupMembers.length} approvedLogs={approvals} />
                        {groupMembers.map((member, index) => {
                            return <UserProgress frequency={frequency} totalVotes={votesArray[index]} />
                        })}

                    </View>
                ) : (
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
                )
                }
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
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 16,
        width: "100%",
        alignItems: "center",
        height: "100%",

    },
    inner_container: {
        justifyContent: 'flex-start',
        paddingTop: "10%",
        width: "100%",
        alignItems: "center",
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