import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { User } from 'firebase/auth';
import Logo from '../assets/icons/logo.svg';
import { useUser } from './UserContext';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { DocumentReference } from 'firebase/firestore';
import { createGroup } from '../utils/collection';

export function Group() {

    const [step, setStep] = useState<'initial' | 'name-group' | 'display-code' | 'enter-code'>('initial');
    const [groups, setGroups] = useState<DocumentReference[]>([]);
    const [hasGroups, setHasGroups] = useState(false);
    const { user } = useUser();
    const [groupName, setGroupName] = useState(`${user?.displayName?.replace(/\s+/g, '')}Group`);

    useEffect(() => {
        // users collection, user document (user.uid), groups list of references to group documents
        const checkUserGroups = async () => {
            const db = getFirestore();
            const q = query(collection(db, 'users'), where('uid', '==', user?.uid));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size === 0) {
                console.log('No such document!');
            } else {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    setGroups(data.groups);
                    setHasGroups(true);
                });
            }
        };
    
        checkUserGroups();
    }, [user]);

    const handleCreateGroup = async () => {
        // create a new group document in the groups collection
        // add the group reference to the user's document in the users collection
        // set the user's groups state to include the new group reference
        // set the hasGroups state to true
        // the group document should have a users[list of references to user documents] field, a name str field, an admin user ref field, a habit str field, and a habit int frequency field, a garden ref field, streak int field

        const newUserGroup = await createGroup(user, groupName);

        setGroups([...groups, newUserGroup]);
        setHasGroups(true);
    };

    const handleJoinGroup = () => {

    };

    return (
        <View>
            {hasGroups ? (
                <Text>Groups</Text>
            ) : (
                <View>
                    <Text>Welcome to your garden.</Text>
                    <Text>It's time to plant a new seed.</Text>
                    {step === 'initial' && (
                        <View>
                            <Button title="Create a Group" onPress={() => setStep('name-group')} />
                            <Button title="Join a Group" onPress={() => setStep('enter-code')} />
                        </View>
                    )}
                    {step === 'name-group' && (
                        <View>
                            <TextInput
                                placeholder={`${user?.displayName?.replace(/\s+/g, '')}Group`} 
                                placeholderTextColor="gray"
                                value={groupName}
                                onChangeText={setGroupName}
                            />
                            <Button title="Create" onPress={() => handleCreateGroup()} />
                        </View>
                    )}
                    {step === 'display-code' && (
                        <View>
                            <Text>Group Code</Text>
                            // display latest group's code
                            <Text>{groups[groups.length - 1].id}</Text>
                        </View>
                    )}

                </View>
            )}
        </View>
    );
}