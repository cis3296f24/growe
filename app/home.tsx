import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Garden } from '../components/Garden';

export default function HomeLayout() {
    return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                        <Garden />
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