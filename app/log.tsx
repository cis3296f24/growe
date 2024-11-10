import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function LogLayout() {
    return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                        <Text>Log</Text>
                </View>
            </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});