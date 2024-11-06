import { Text, View } from "react-native";
import { Auth } from '../components/Auth';
import { UserProvider } from '../components/UserContext';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <UserProvider>
        <Auth />
      </UserProvider>
    </View>
  );
}
