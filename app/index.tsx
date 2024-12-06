import { Text, View } from "react-native";
import { Auth } from '../components/Auth';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#596558',
      }}
    >
      <Auth />
    </View>
  );
}