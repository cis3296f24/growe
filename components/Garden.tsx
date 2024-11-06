import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { User } from 'firebase/auth';
import Logo from '../assets/icons/logo.svg';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext';
import { useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { DocumentReference } from 'firebase/firestore';

export function Garden() {

    const router = useRouter();
    const [groups, setGroups] = useState<DocumentReference[]>([]);
    const [hasGroups, setHasGroups] = useState(false);
    const { user } = useUser();

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

    return (
        <View>
            {hasGroups ? (
                <Text>Groups</Text>
            ) : (
                <View>
                    <Text>The garden is empty.</Text>
                    <Button title="Go to Groups" onPress={() => router.push({ pathname: '/group', params: {} })} />
                </View>
            )}
        </View>
    );
}