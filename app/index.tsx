import { Text, View } from "react-native";
import { Auth } from '../components/Auth';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from "react-native";

export default function Index() {
  return (
    <LinearGradient
    colors={['#8E9F8D', '#596558']} // Gradient colors
    style={styles.background}
    start={[0, 0]}
    end={[1, 1]}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Auth />
      </View>
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