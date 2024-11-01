import { Text, View } from "react-native";
import { Auth } from '../components/Auth';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Auth />
    </View>
  );
}
