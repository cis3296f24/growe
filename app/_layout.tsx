import { Stack, usePathname } from 'expo-router';
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserProvider } from '../components/UserContext';
import "../global.css";
import { LinearGradient } from 'expo-linear-gradient';
import { Line } from 'react-native-svg';

export default function RootLayout() {
  const pathname = usePathname();
  const isIndexPage = pathname === '/';

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
          <View style={styles.content}>
            <UserProvider>
              {!isIndexPage && <Header />}
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                </Stack>
              {!isIndexPage && <Footer />}
            </UserProvider>
          </View>
      </SafeAreaView>
    </GluestackUIProvider>
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
