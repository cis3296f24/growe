import { Text, View } from "react-native";
import { Garden } from '../components/Garden';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Garden />
    </View>
  );
}
