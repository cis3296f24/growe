import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Garden } from '../components/Garden';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Index() {
    return (
        <LinearGradient
            colors={['#8E9F8D', '#596558']} // Gradient colors
            style={styles.background}
            start={[0, 0]}
            end={[1, 1]}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Garden />
                </View>
            </SafeAreaView>
        </LinearGradient>
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