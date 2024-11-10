import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useUser } from './UserContext';
import { DocumentReference, DocumentSnapshot, getDoc } from 'firebase/firestore';
import { checkUserHasGroup, joinGroup, createGroup } from '../utils/group';
import { err } from 'react-native-svg';

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
        <View style={styles.container}>
            {hasGroups ? (
                <View style={styles.container}>
                    <Text>Group Code: {groupCode}</Text>
                    <Text>Group Name: {groupName}</Text>
                    <Text>Habit: {habit}</Text>
                    <Text>Frequency: {frequency}</Text>
                <Text>Members:</Text>
                    {groupMemberNames.map((memberName, index) => (
                        <Text key={index}>{memberName}</Text>
                    ))}
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
            )}
        </View>
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
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        color: 'black',
        borderRadius: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        paddingBottom: 128,
      },
});