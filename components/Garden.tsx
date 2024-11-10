import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext';
import { useEffect } from 'react';
import { DocumentReference } from 'firebase/firestore';
import { checkUserHasGroup } from '../utils/group';

export function Garden() {

    const router = useRouter();
    const [groups, setGroups] = useState<DocumentReference[]>([]);
    const [hasGroups, setHasGroups] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        const fetchGroups = async () => {
            const groupResult = await checkUserHasGroup(user);
            if (groupResult) {
                setGroups(groupResult);
                setHasGroups(true);
            } else {
                setHasGroups(false);
            }
        };
        fetchGroups();
    }, [user]);

    return (
        <View>
            {hasGroups ? (
                <Text>Garden</Text>
            ) : (
                <View style={styles.container}>
                    <Text>You need to be in a group to start a garden!</Text>
                    <Button title="Go to Groups" onPress={() => router.push({ pathname: '/group', params: {} })} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});