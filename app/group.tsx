import { Text, View } from "react-native";
import { Group } from '../components/Group';

export default function GroupLayout() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Group />
    </View>
  );
}
